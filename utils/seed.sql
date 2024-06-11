-- Drop existing triggers first
DROP TRIGGER IF EXISTS trg_order_placed_quotations_insert ON orders;
DROP TRIGGER IF EXISTS trg_quotation_sent_update_order_status ON quotations;
DROP TRIGGER IF EXISTS trg_quotation_confirmed_create_delivery ON quotations;
DROP TRIGGER IF EXISTS trg_delivery_disputed_update_order_status ON deliveries;
DROP TRIGGER IF EXISTS trg_delivery_delivered_update_order_status ON deliveries;
DROP TRIGGER IF EXISTS trg_quotation_declined_update_order_status ON quotations;

-- Drop existing tables
DROP TABLE IF EXISTS deliveries;
DROP TABLE IF EXISTS quotations;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users; 
DROP TABLE IF EXISTS roles;

-- Create the roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name TEXT UNIQUE NOT NULL,
    role_weight INTEGER UNIQUE NOT NULL,
    role_permissions TEXT[] DEFAULT '{}'::TEXT[]
);

-- Insert roles data
INSERT INTO roles (role_name, role_weight) VALUES
('client', 10),
('banned', 0),
('admin', 100),
('driver', 20)
ON CONFLICT (role_name) DO NOTHING;

-- Create the users table with reference to the roles table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token TEXT,
    email_verified_on TIMESTAMPTZ,
    password TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    deleted_on TIMESTAMPTZ,
    banned_on TIMESTAMPTZ,
    updated_on TIMESTAMPTZ DEFAULT NOW(),
    created_on TIMESTAMPTZ DEFAULT NOW()
);
-- Insert placeholder values in users
INSERT INTO users (name, email, password, role_id)
VALUES
    ('Alice Smith', 'alice@example.com', 'password123', 1), -- assuming role_id 1 corresponds to 'client'
    ('Bob Johnson', 'bob@example.com', 'password456', 2),  -- assuming role_id 2 corresponds to 'banned'
    ('Charlie Brown', 'charlie@example.com', 'password789', 3); -- assuming role_id 3 corresponds to 'admin'


-- Create the orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    weight DECIMAL,
    address_from TEXT,
    address_to TEXT,
    instructions TEXT,
    status VARCHAR(50) DEFAULT 'Placed' CHECK (status IN ('Cancelled', 'Placed', 'Pending Confirmation', 'Quotation Declined' , 'Ready for Delivery', 'Delivery In Progress', 'Delivered', 'Disputed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the quotations table
CREATE TABLE IF NOT EXISTS quotations (
    quotation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(order_id),
    cost_explanation TEXT,
    client_response TEXT,
    status VARCHAR(50) DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Sent', 'Confirmed', 'Declined')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the deliveries table with validation for driver_phone and driver_cnic
CREATE TABLE IF NOT EXISTS deliveries (
    delivery_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(order_id),
    driver_name TEXT,
    driver_phone TEXT CHECK (driver_phone ~ '^\+92\d{10}$'),
    driver_cnic TEXT CHECK (driver_cnic ~ '^\d{5}-\d{7}-\d{1}$'),
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Disputed', 'Delivered')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: Whenever Order is "Placed" make a row in quotations with status "In Progress"
CREATE OR REPLACE FUNCTION create_quotation_on_order_placed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Placed' THEN
        INSERT INTO quotations (order_id, status)
        VALUES (NEW.order_id, 'In Progress');
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_placed_quotations_insert
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION create_quotation_on_order_placed();

-- Trigger: Whenever Quotation status is "Sent", change the status of order to "Pending Confirmation"
CREATE OR REPLACE FUNCTION update_order_status_on_quotation_sent()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Sent' THEN
        UPDATE orders
        SET status = 'Pending Confirmation'
        WHERE order_id = NEW.order_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quotation_sent_update_order_status
AFTER UPDATE OF status ON quotations
FOR EACH ROW
EXECUTE FUNCTION update_order_status_on_quotation_sent();

-- Trigger: Whenever Quotation status is "Confirmed", change the status of order to "Ready for Delivery" and create a row in deliveries table with status "Pending"
CREATE OR REPLACE FUNCTION update_order_and_create_delivery_on_quotation_confirmed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Confirmed' THEN
        UPDATE orders
        SET status = 'Ready for Delivery'
        WHERE order_id = NEW.order_id;

        INSERT INTO deliveries (order_id, status)
        VALUES (NEW.order_id, 'Pending');
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quotation_confirmed_create_delivery
AFTER UPDATE OF status ON quotations
FOR EACH ROW
EXECUTE FUNCTION update_order_and_create_delivery_on_quotation_confirmed();

-- Trigger: Whenever the delivery status is "Delivered", change the status of order to "Delivered"
CREATE OR REPLACE FUNCTION update_order_status_on_delivery_delivered()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Delivered' THEN
        UPDATE orders
        SET status = 'Delivered'
        WHERE order_id = NEW.order_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delivery_delivered_update_order_status
AFTER UPDATE OF status ON deliveries
FOR EACH ROW
EXECUTE FUNCTION update_order_status_on_delivery_delivered();

-- Trigger: Whenever the delivery status is "Disputed", change the status of order to "Disputed"
CREATE OR REPLACE FUNCTION update_order_status_on_delivery_disputed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Disputed' THEN
        UPDATE orders
        SET status = 'Disputed'
        WHERE order_id = NEW.order_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delivery_disputed_update_order_status
AFTER UPDATE OF status ON deliveries
FOR EACH ROW
EXECUTE FUNCTION update_order_status_on_delivery_disputed();

-- Trigger: Whenever Quotation status is "Declined", change the status of order to "Quotation Declined"
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trg_quotation_declined_update_status ON quotations;

-- Create function to update statuses
CREATE OR REPLACE FUNCTION update_status_on_quotation_declined()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Declined' THEN
        -- Check if there is any delivery for the specific order
        IF EXISTS (SELECT 1 FROM deliveries WHERE order_id = NEW.order_id) THEN
            -- Update delivery status to 'Disputed'
            UPDATE deliveries
            SET status = 'Disputed'
            WHERE order_id = NEW.order_id;
        END IF;
        
        -- Update order status to 'Quotation Declined'
        UPDATE orders
        SET status = 'Quotation Declined'
        WHERE order_id = NEW.order_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER trg_quotation_declined_update_status
AFTER UPDATE OF status ON quotations
FOR EACH ROW
EXECUTE FUNCTION update_status_on_quotation_declined();



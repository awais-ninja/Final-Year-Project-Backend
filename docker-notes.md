docker run -e POSTGRES_PASSWORD=jamyrose -p 5432:5432 -d --name pg-swiftlink postgres

docker run -d --name redis-swiftlink -p 6379:6379 redis

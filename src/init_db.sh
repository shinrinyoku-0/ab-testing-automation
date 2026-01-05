#!/bin/bash

echo "Waiting for PostgreSQL to be ready..."
while ! pg_isready -h db -p 5432 -U postgres; do
  sleep 1
done

echo "Running Alembic migrations..."
alembic upgrade head

echo "Database initialized!"
exec "$@"

#!/bin/bash

echo "Loading environmental variables..."
set -a && source .env && set +a

echo "Starting PostgreSQL database using Docker Compose..."
docker compose up -d db

echo "Waiting for the PostgreSQL database to be ready..."
until docker compose exec db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 5
done

echo "PostgreSQL is ready."

cleanup() {
    echo "Cleaning up..."
    docker compose stop db

    jobs -p | xargs kill
    pkill -f "manage.py runserver"
}

trap cleanup SIGINT SIGTERM

echo "Starting Django backend..."
cd backend

if [ -f venv/bin/activate ]; then
  source venv/bin/activate
else
  python3 -m venv venv
  source venv/bin/activate
fi

pip install -r requirements.txt
python3 manage.py migrate
python3 manage.py runserver &

echo "Starting Next.js frontend..."
cd ../frontend && npm ci && npm run dev &

wait

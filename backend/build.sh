#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing dependencies..."
npm ci

echo "Building TypeScript project..."
npm run build

echo "Build completed successfully!"

# Run database migrations if needed
if [ "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npm run migrate
  echo "Migrations completed!"
else
  echo "No DATABASE_URL found, skipping migrations"
fi
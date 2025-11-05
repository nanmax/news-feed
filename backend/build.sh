#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm ci

# Build the project
npm run build

# Run database migrations if needed
if [ "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npm run migrate
fi
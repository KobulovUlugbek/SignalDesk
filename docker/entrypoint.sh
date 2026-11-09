#!/bin/sh
set -eu

if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
  DB_FILE="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
  mkdir -p "$(dirname "$DB_FILE")"
  touch "$DB_FILE"
fi

php artisan migrate --force
php artisan db:seed --force
chown -R www-data:www-data database storage bootstrap/cache
exec "$@"

FROM php:8.3-cli-bookworm AS php-deps
RUN apt-get update && apt-get install -y --no-install-recommends libsqlite3-dev libonig-dev libxml2-dev libzip-dev unzip git \
    && docker-php-ext-install pdo_sqlite pdo_mysql mbstring dom xml zip \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
WORKDIR /app
COPY . .
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

FROM node:22-alpine AS assets
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM php:8.3-apache-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends libsqlite3-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_sqlite pdo_mysql mbstring dom xml opcache \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*
RUN sed -ri 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/*.conf \
    && printf '\n<Directory /var/www/html/public>\n    AllowOverride All\n    Require all granted\n</Directory>\n' >> /etc/apache2/apache2.conf
WORKDIR /var/www/html
COPY . .
COPY --from=php-deps /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build
COPY docker/entrypoint.sh /usr/local/bin/signaldesk-entrypoint
RUN chmod +x /usr/local/bin/signaldesk-entrypoint \
    && mkdir -p database storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data database storage bootstrap/cache
EXPOSE 80
ENTRYPOINT ["signaldesk-entrypoint"]
CMD ["apache2-foreground"]

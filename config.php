<?php
$dbDsn = getenv('DB_DSN') ?: null;
$dbUser = getenv('DB_USER') ?: null;
$dbPass = getenv('DB_PASS') ?: null;

if (!$dbDsn && getenv('DB_HOST')) {
    $dbDsn = sprintf(
        'pgsql:host=%s;port=%s;dbname=%s;sslmode=require',
        getenv('DB_HOST'),
        getenv('DB_PORT') ?: '5432',
        getenv('DB_NAME') ?: 'postgres'
    );
}

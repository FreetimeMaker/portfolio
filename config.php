<?php
// Supabase PostgreSQL Konfiguration
$dbHost = getenv('SUPABASE_HOST') ?: getenv('DB_HOST') ?: 'localhost';
$dbPort = getenv('SUPABASE_PORT') ?: getenv('DB_PORT') ?: '5432';
$dbName = getenv('SUPABASE_DB') ?: getenv('DB_NAME') ?: 'postgres';
$dbUser = getenv('SUPABASE_USER') ?: getenv('DB_USER') ?: 'postgres';
$dbPass = getenv('SUPABASE_PASSWORD') ?: getenv('DB_PASS') ?: '';

// PostgreSQL DSN (Supabase standard)
if (getenv('DB_DSN')) {
    $dbDsn = getenv('DB_DSN');
} else {
    $dbDsn = sprintf(
        'pgsql:host=%s;port=%s;dbname=%s;user=%s;password=%s',
        $dbHost,
        $dbPort,
        $dbName,
        $dbUser,
        $dbPass
    );
}

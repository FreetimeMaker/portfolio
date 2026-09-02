<?php
// Supabase PostgreSQL Konfiguration
$dbHost = getenv('SUPABASE_HOST') ?: 'localhost';
$dbPort = getenv('SUPABASE_PORT') ?: '5432';
$dbName = getenv('SUPABASE_DB') ?: 'postgres';
$dbUser = getenv('SUPABASE_USER') ?: 'postgres';
$dbPass = getenv('SUPABASE_PASSWORD') ?: '';

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

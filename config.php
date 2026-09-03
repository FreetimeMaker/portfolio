<?php
$envFile = __DIR__ . '/.env';
if (is_readable($envFile)) {
    $envValues = parse_ini_file($envFile, false, INI_SCANNER_RAW) ?: [];
    foreach ($envValues as $name => $value) {
        if (getenv($name) === false) {
            putenv($name . '=' . $value);
        }
    }
}

$supabaseUrl = getenv('NEXT_PUBLIC_SUPABASE_URL') ?: null;
$supabaseKey = getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ?: null;
$resendApiKey = getenv('RESEND_API_KEY') ?: null;
$protonEmail = getenv('PROTON_EMAIL') ?: null;

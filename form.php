<?php
require __DIR__ . '/config.php';

function resultPage(string $title, string $message): never
{
    $title = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

    echo <<<HTML
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{$title}</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="icon" type="image/png" href="/favicons/android-chrome-192x192.png">
</head>
<body class="contact-result-page">
    <main class="contact-result">
        <h1>{$title}</h1>
        <p>{$message}</p>
        <a class="result-link" href="/">Zurück zur Hauptseite</a>
    </main>
</body>
</html>
HTML;
    exit;
}

function sendSupabaseMessage(string $url, string $key, string $name, string $email, string $comment): void
{
    if (!function_exists('curl_init')) {
        throw new RuntimeException('PHP-cURL ist nicht verfügbar.');
    }

    $payload = json_encode([['name' => $name, 'email' => $email, 'message' => $comment]], JSON_THROW_ON_ERROR);
    $curl = curl_init(rtrim($url, '/') . '/rest/v1/contacts');
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . $key,
            'Authorization: Bearer ' . $key,
            'Content-Type: application/json',
            'Prefer: return=minimal',
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
    ]);

    $response = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $curlError = curl_error($curl);
    curl_close($curl);

    if ($response === false || $curlError !== '' || $status < 200 || $status >= 300) {
        throw new RuntimeException('Nachricht konnte nicht gespeichert werden.');
    }
}

function sendEmail(string $apiKey, string $recipient, string $replyTo, string $subject, string $html): void
{
    if (!function_exists('curl_init')) {
        throw new RuntimeException('PHP-cURL ist nicht verfügbar.');
    }

    $payload = json_encode([
        'from' => 'Jamie Achatz (Freetime Maker) <no-reply@free-time.me>',
        'to' => [$recipient],
        'reply_to' => $replyTo,
        'subject' => $subject,
        'html' => $html,
    ], JSON_THROW_ON_ERROR);

    $curl = curl_init('https://api.resend.com/emails');
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
    ]);

    $response = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $curlError = curl_error($curl);
    curl_close($curl);

    if ($response === false || $curlError !== '' || $status < 200 || $status >= 300) {
        throw new RuntimeException('E-Mail konnte nicht gesendet werden.');
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /');
    exit;
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$comment = trim($_POST['comment'] ?? $_POST['message'] ?? '');
$company = trim($_POST['company'] ?? '');

if ($company !== '') {
    resultPage('Vielen Dank!', 'Ihre Nachricht wurde erfolgreich gesendet.');
}

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $comment === '') {
    resultPage('Bitte versuchen Sie es erneut.', 'Bitte füllen Sie alle Felder korrekt aus.');
}

try {
    if (!$supabaseUrl || !$supabaseKey) {
        throw new RuntimeException('Supabase ist nicht konfiguriert.');
    }

    sendSupabaseMessage($supabaseUrl, $supabaseKey, $name, $email, $comment);

    if (!$resendApiKey || !$protonEmail) {
        throw new RuntimeException('E-Mail-Versand ist nicht konfiguriert.');
    }

    $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
    $safeComment = nl2br(htmlspecialchars($comment, ENT_QUOTES, 'UTF-8'));

    sendEmail(
        $resendApiKey,
        $protonEmail,
        $email,
        'Neue Portfolio-Anfrage von ' . $name,
        "<h3>Neue Kontaktanfrage</h3><p><strong>Name:</strong> {$safeName}</p><p><strong>E-Mail:</strong> {$safeEmail}</p><p><strong>Nachricht:</strong></p><p>{$safeComment}</p>"
    );

    sendEmail(
        $resendApiKey,
        $email,
        $protonEmail,
        'Bestätigung Ihrer Kontaktanfrage',
        "<p>Hallo {$safeName},</p><p>vielen Dank für Ihre Nachricht! Ich habe sie erhalten und werde mich so schnell wie möglich bei Ihnen melden.</p><br><p>Viele Grüße,</p><p>Ihr Jamie Achatz (Freetime Maker)</p>"
    );

    resultPage('Vielen Dank!', 'Ihre Nachricht wurde erfolgreich gesendet.');
} catch (Throwable $error) {
    error_log('Contact form error: ' . $error->getMessage());
    resultPage('Bitte versuchen Sie es erneut.', 'Ihre Nachricht konnte leider nicht gesendet werden.');
}

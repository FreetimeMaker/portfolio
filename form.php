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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /');
    exit;
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$comment = trim($_POST['comment'] ?? $_POST['message'] ?? '');

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $comment === '') {
    resultPage('Bitte versuchen Sie es erneut.', 'Bitte füllen Sie alle Felder korrekt aus.');
}

try {
    if (!$dbDsn || !class_exists('PDO')) {
        throw new RuntimeException('Datenbank ist nicht konfiguriert.');
    }

    $pdo = new PDO($dbDsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS contact_messages (
            id BIGSERIAL PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(180) NOT NULL,
            comment TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )'
    );
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_email ON contact_messages (email)');

    $statement = $pdo->prepare(
        'INSERT INTO contact_messages (name, email, comment) VALUES (:name, :email, :comment)'
    );
    $statement->execute([
        ':name' => $name,
        ':email' => $email,
        ':comment' => $comment,
    ]);

    resultPage('Vielen Dank!', 'Ihre Nachricht wurde erfolgreich gesendet.');
} catch (Throwable $error) {
    error_log('Contact form error: ' . $error->getMessage());
    resultPage('Bitte versuchen Sie es erneut.', 'Ihre Nachricht konnte leider nicht gesendet werden.');
}

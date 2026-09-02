# Supabase Setup für PHP Kontaktformular

Die PHP-Dateien wurden für PostgreSQL via **Supabase** aktualisiert.

## Supabase einrichten

1. **Projekt erstellen**
   - Gehe zu [supabase.com](https://supabase.com)
   - Erstelle ein neues Projekt
   - Wähle eine Region

2. **Verbindungsdaten erhalten**
   - Gehe zu **Project Settings → Database**
   - Du findest die Verbindungsdaten:
     - `Host` (z.B. `db.xxxxx.supabase.co`)
     - `Port` (standardmäßig `5432`)
     - `Database` (standardmäßig `postgres`)
     - `User` (standardmäßig `postgres`)
     - `Password` (dein gesetztes Passwort)

## Umgebungsvariablen setzen

Erstelle eine `.env`-Datei im Root-Verzeichnis oder setze folgende Umgebungsvariablen:

```env
SUPABASE_HOST=db.xxxxx.supabase.co
SUPABASE_PORT=5432
SUPABASE_DB=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=dein_sicheres_passwort
```

Oder setze eine einzige DSN (Datenbankverbindung):

```env
DB_DSN=pgsql:host=db.xxxxx.supabase.co;port=5432;dbname=postgres;user=postgres;password=dein_passwort
```

## Lokale Entwicklung

Falls du lokal PostgreSQL installieren möchtest (optional):

```bash
# macOS
brew install postgresql

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Windows
# Downloade von https://www.postgresql.org/download/windows/
```

Dann lokal verbinden:
```env
SUPABASE_HOST=localhost
SUPABASE_PORT=5432
SUPABASE_DB=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=dein_passwort
```

## Testen

Nach dem Setup:

1. Öffne `form.php` in deinem Browser
2. Das Kontaktformular sollte funktionieren
3. Die Tabelle `contact_messages` wird automatisch erstellt

## Struktur der Tabelle

```sql
CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON contact_messages(email);
```

## Fehlerbehebung

- **"DB_DSN not configured"**: Stelle sicher, dass die Umgebungsvariablen korrekt gesetzt sind
- **"SQLSTATE[08006]"**: Überprüfe Host, Port und Passwort
- **"permission denied"**: Der Datenbankbenutzer hat nicht die richtigen Rechte

## SSL-Verbindung (empfohlen für Produktion)

Supabase benötigt SSL-Verbindung. Füge folgende Option zum DSN hinzu:

```env
DB_DSN=pgsql:host=db.xxxxx.supabase.co;port=5432;dbname=postgres;user=postgres;password=passwort;sslmode=require
```

Oder in der Umgebungsvariablen-Konfiguration, wenn dein PHP PDO das unterstützt.

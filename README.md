# Persönliche Wunschliste – Starterprojekt

Dieses Projekt ist eine eigenständige Website mit HTML, CSS und JavaScript. Es gibt keine App und keine WordPress-Abhängigkeit. Die Produktliste liegt in `products.js` und kann dort geändert werden.

## Enthalten
- Mobiloptimierte Wunschlisten-Website
- Suche und Kategorien
- 16 bereits eingetragene Weihnachtswünsche
- Platzhalter für Produktbilder, Preise und Händlerlinks
- Cloudflare-Worker + D1-Datenbankschema für gemeinsame Reservierungen
- Reservierung ohne Benutzerkonto

## Vor dem Veröffentlichen anpassen
1. In `products.js` Produktbilder, konkrete Modelle, Preise und echte Händlerlinks ergänzen. Die Links sind absichtlich noch leer; es sind keine Affiliate-Links eingebaut.
2. In `index.html` den Seitentitel und die Begrüßung personalisieren.
3. In `app.js` nach dem Worker-Deployment `API_BASE` auf die Worker-URL setzen.
4. Vor öffentlicher Nutzung eine Datenschutzerklärung ergänzen und die Datensparsamkeit/Einwilligung für die Reservierung prüfen. Der Name und optionale Nachricht werden gespeichert.

## Lokal ansehen
Einfach `index.html` im Browser öffnen. Für die Reservierung muss der Worker eingerichtet sein; ohne API zeigt die Seite nur die Vorschau und die Produktliste.

## Veröffentlichung (Beispiel Cloudflare Pages)
1. Ein Cloudflare-Konto erstellen.
2. Dieses Projekt in ein GitHub-Repository hochladen.
3. In Cloudflare Pages das Repository verbinden.
4. Framework preset: `None`; Build command leer lassen; Build output directory `/` bzw. Projektwurzel wählen.
5. Die erzeugte Pages-Adresse ist deine Website-Adresse. Eine eigene Domain kann später verbunden werden.

Alternativ lässt sich das Projekt auf Netlify veröffentlichen. Für eine einfache statische Seite ist kein klassischer eigener Server erforderlich.

## Gemeinsame Reservierungen mit Cloudflare D1
1. Cloudflare-Account und Node.js installieren.
2. Wrangler installieren: `npm install -g wrangler`
3. Im Ordner `worker` anmelden: `npx wrangler login`
4. Datenbank erstellen: `npx wrangler d1 create wunschliste`
5. Die ausgegebene `database_id` in `worker/wrangler.toml` eintragen.
6. Schema einspielen: `npx wrangler d1 execute wunschliste --file=schema.sql`
7. Worker veröffentlichen: `npx wrangler deploy`
8. Die Worker-URL (z. B. `https://wunschliste-api.<konto>.workers.dev`) in `app.js` bei `API_BASE` eintragen.
9. Die Website erneut veröffentlichen.

## Wichtige Hinweise
- Die Reservierung ist aktuell einmalig: Ein Wunsch kann nur einmal reserviert werden. Eine Stornierung oder Admin-Verwaltung ist in dieser ersten Version noch nicht enthalten.
- Das Backend speichert den angegebenen Namen und eine optionale Nachricht. Es gibt noch keine Admin-Ansicht zum Löschen/Ändern von Reservierungen.
- CORS ist für den einfachen Start offen konfiguriert. Vor produktiver Nutzung sollte die erlaubte Website-Domain eingeschränkt und ein Schutz gegen automatisierte Anfragen ergänzt werden.
- Die Website enthält bewusst keine Affiliate-Links.


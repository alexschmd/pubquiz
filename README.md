# Pubquiz Dashboard

Scoreboard und Teamverwaltung mit TanStack Start, React, Vite und eigenem CSS. Motion animiert die Sortierung im Scoreboard; die Einstellung für reduzierte Bewegung wird berücksichtigt.

## Entwicklung

Node.js ab 22.12 und npm werden benötigt.

```sh
npm ci
npm run dev
```

- Scoreboard: http://localhost:3000
- Verwaltung: http://localhost:3000/manage

Bis zu zehn Teams können angelegt, benannt, eingefärbt und gelöscht werden. Die Verwaltung vergibt oder entfernt einzelne Punkte. Das Scoreboard sortiert nach Punkten.

## Daten

Teams bleiben unter dem bisherigen Schlüssel `teams` im localStorage erhalten. Bestehende Daten werden beim Start übernommen. Tabs derselben Origin synchronisieren sich über Browser-Storage-Events. Verschiedene Geräte oder Browser teilen keinen Spielstand. Beim Wechsel von Domain oder Port müssen die Daten separat übertragen werden.

## Produktion

```sh
npm run build
npm start
```

Nitro erzeugt den Node-Server unter `.output/server/index.mjs` und die öffentlichen Assets unter `.output/public`. Der Standardport ist 3000; mit `PORT` lässt er sich ändern. Das gesamte `.output`-Verzeichnis wird für das Deployment benötigt.

## Prüfungen

```sh
npm run typecheck
npm test
npm run build
```

Die Tests prüfen Datenübernahme, Speicherung, Tab-Synchronisierung, beschädigte Bestandsdaten und Rasteraufteilung für ein bis zehn Teams.

## Fragen und Countdown

Unter `/manage` mehrere Fragen in der shadcn-Textarea vorbereiten, eine pro Zeile. Leerzeilen werden ignoriert. Fragen können explizit nummeriert werden; sonst werden sie automatisch durchnummeriert.

```text
1. Welcher Planet ist der Sonne am nächsten?; (Merkur) (Venus) (Erde) (Mars)
2. Wer schrieb Faust?
```

Frage auswählen, Dauer von 1 bis 3600 Sekunden setzen und „Frage starten“ wählen. „Nächste Frage auswählen“ bereitet die nächste Frage vor, ohne sie zu starten. Jede Frage merkt sich ihre eingestellte Zeit während der geöffneten Verwaltung. Änderungen an der Liste setzen Auswahl und vorbereitete Zeiten zurück.

Das Scoreboard zeigt „Frage X“, den Fragetext, optionale Antworten und den Countdown. Die letzten zehn Sekunden pulsieren rot; bei reduzierter Bewegung bleibt der Timer statisch rot. Nach Ablauf bleibt die Frage mit „Zeit abgelaufen“ sichtbar. Antworten sind zunächst nur Anzeige, ohne Lösungsauswahl oder automatische Wertung. Sound ist für eine spätere Erweiterung vorgesehen.

„Scoreboard anzeigen“ und „Frage anzeigen“ wechseln die Ansicht, ohne die Zeit zurückzusetzen. „Frage beenden“ entfernt die aktive Frage. Endzeitpunkt, aktive Frage und Ansicht werden gespeichert und zwischen Tabs derselben Origin synchronisiert. Die vorbereitete Fragenliste bleibt aktuell nur während der geöffneten Verwaltungsseite erhalten.

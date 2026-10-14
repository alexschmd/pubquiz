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

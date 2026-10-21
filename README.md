# Pubquiz Dashboard

Scoreboard und Teamverwaltung mit TanStack Start, React, Vite und eigenem CSS. Motion animiert die Sortierung im Scoreboard; die Einstellung für reduzierte Bewegung wird berücksichtigt.

## Entwicklung

Node.js ab 22.12 und npm werden benötigt.

```sh
npm ci
npm run dev
```

- Startseite: http://localhost:3000
- Scoreboard: http://localhost:3000/quiz
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

Unter `/manage` öffnet „Fragen hinzufügen“ bzw. „Fragen bearbeiten“ einen Dialog mit zwei Ansichten. „Textimport“ bietet eine shadcn-Textarea für mehrere Fragen, eine pro Zeile. Unter „Bearbeiten“ lassen sich Fragen und Antworten einzeln hinzufügen, ändern oder löschen und mehrere richtige Antworten per Checkbox markieren. Beide Ansichten übernehmen die Änderungen beim Wechsel. Leerzeilen werden ignoriert. Fragen können explizit nummeriert werden; sonst werden sie automatisch durchnummeriert.

```text
1. Welcher Planet ist der Sonne am nächsten?; (Merkur) (Venus) (Erde) (Mars)
2. Wer schrieb Faust?
```

In der Übersicht eine Frage im Select auswählen, ihre Dauer von 1 bis 3600 Sekunden direkt daneben einstellen und „Frage starten“ wählen. Die Vorschau entfällt. Start- und Ansichtsknöpfe bleiben immer sichtbar. Fragenliste und Zeiten bleiben nach dem Neuladen gespeichert.

Das Scoreboard zeigt „Frage X“, den Fragetext, optionale Antworten und den Countdown. Die letzten zehn Sekunden pulsieren synchron zu den Sekundenwechseln rot; bei reduzierter Bewegung bleibt der Timer statisch rot. Nach Ablauf bleibt die Frage mit „Zeit abgelaufen“ sichtbar. Die Lösung bleibt bis zum Aufdecken verborgen; eine automatische Wertung erfolgt nicht. Sound ist für eine spätere Erweiterung vorgesehen.

„Scoreboard anzeigen“ und „Frage anzeigen“ wechseln die Ansicht, ohne die Zeit zurückzusetzen. „Frage beenden“ entfernt die aktive Frage. Endzeitpunkt, aktive Frage und Ansicht werden gespeichert und zwischen Tabs derselben Origin synchronisiert. Die vorbereitete Fragenliste und ihre Zeiten bleiben ebenfalls gespeichert.

Antwortmöglichkeiten sind nach dem Start verborgen. Unter der Fragensteuerung können A, B, C usw. einzeln sowie alle Antworten gemeinsam angezeigt oder wieder verborgen werden. Der Countdown bleibt ohne sichtbare Antworten unter der Frage und wandert mit dem ersten Reveal animiert nach oben rechts. Das Verbergen aller Antworten bringt ihn zurück. Antwortfreigaben bleiben beim Ansichtswechsel und Neuladen erhalten; eine neu gestartete Frage beginnt wieder mit verborgenen Antworten.

Antwortfreigaben lassen sich bereits für die ausgewählte Frage vorbereiten. Beim Start werden sie übernommen. Die schmalen Augen-Schalter in den shadcn Button Groups steuern die Sichtbarkeit. Für die laufende Frage wirken Änderungen sofort.

„Zeit stoppen“ hält den Countdown mit seiner genauen Restzeit an und wird zu „Zeit fortsetzen“. „Zeit neu starten“ setzt die laufende Frage auf ihre beim Start gewählte Dauer zurück. Pausen bleiben auch beim Neuladen und Wechseln der Ansicht erhalten.

Die richtigen Antworten werden in der Verwaltung per Haken am Ende einer Antwortgruppe markiert oder direkt importiert: `1. Planet?; (Merkur*) (Venus)`. Mehrere Antworten dürfen mit `*` markiert werden. Der KI-Importprompt berücksichtigt diese Markierung, sofern die Lösung im Dokument angegeben ist. Die Markierung ist auf dem Scoreboard zunächst verborgen. „Lösung aufdecken“ zeigt alle Antworten, hebt alle richtigen grün hervor und dimmt die übrigen; „Lösung verbergen“ entfernt die Hervorhebung. Das Aufdecken verändert die Countdown-Zeit nicht.

Fragen werden intern strukturiert gespeichert. Ältere gespeicherte Textlisten werden weiterhin übernommen. Der Textimport bleibt im bisherigen Format; ein JSON-Import ist nicht erforderlich. Inhalte mit Sonderzeichen des Importformats können im Editor bearbeitet und gespeichert werden.

## Routen und Quizstatus

`/` zeigt die Landingpage. Sobald in `/manage` „Quiz starten“ gewählt wird, leitet die Landingpage automatisch nach `/quiz` weiter. `/quiz` bleibt direkt erreichbar und zeigt Fragen oder Platzierungen. „Quiz beenden“ entfernt die aktive Frage und gibt die Landingpage wieder frei; Teams und vorbereitete Fragen bleiben erhalten. Der Status liegt unter `pubquiz-running` im localStorage und wird zwischen Tabs derselben Origin synchronisiert.

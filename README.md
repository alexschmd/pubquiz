# Pubquiz Dashboard

Scoreboard und Teamverwaltung mit TanStack Start, React, Vite und eigenem CSS. Motion animiert die Sortierung im Scoreboard; die Einstellung für reduzierte Bewegung wird berücksichtigt.

## Entwicklung

Node.js ab 22.12 und pnpm werden benötigt.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

- Startseite: http://localhost:3000
- Scoreboard: http://localhost:3000/quiz
- Verwaltung: http://localhost:3000/regie

Bis zu zehn Teams können angelegt, benannt, eingefärbt und gelöscht werden. Die Verwaltung vergibt oder entfernt einzelne Punkte. Das Scoreboard sortiert nach Punkten.

## Daten

Teams bleiben unter dem bisherigen Schlüssel `teams` im localStorage erhalten. Bestehende Daten werden beim Start übernommen. Tabs derselben Origin synchronisieren sich über Browser-Storage-Events. Verschiedene Geräte oder Browser teilen keinen Spielstand. Beim Wechsel von Domain oder Port müssen die Daten separat übertragen werden.

## Produktion

```sh
pnpm build
pnpm start
```

Nitro erzeugt den Node-Server unter `.output/server/index.mjs` und die öffentlichen Assets unter `.output/public`. Der Standardport ist 3000; mit `PORT` lässt er sich ändern. Das gesamte `.output`-Verzeichnis wird für das Deployment benötigt.

## Prüfungen

```sh
pnpm typecheck
pnpm test
pnpm build
```

Die Tests prüfen Datenübernahme, Speicherung, Tab-Synchronisierung, beschädigte Bestandsdaten und Rasteraufteilung für ein bis zehn Teams.

## Fragen und Countdown

Unter `/regie` öffnet „Fragen hinzufügen“ bzw. „Fragen bearbeiten“ einen Dialog mit zwei Ansichten. „Textimport“ bietet eine Textarea für mehrere Fragen, eine pro Zeile. Unter „Bearbeiten“ lassen sich Fragen, Antworten, richtige Antwortmarkierungen und optionale Lösungen für offene Fragen einzeln pflegen. Beide Ansichten übernehmen die Änderungen beim Wechsel. Leerzeilen werden ignoriert. Fragen können explizit nummeriert werden; sonst werden sie automatisch durchnummeriert.

```text
1. Welcher Planet ist der Sonne am nächsten?; (Merkur*) (Venus) (Erde) (Mars)
2. Wer schrieb Faust?; =Johann Wolfgang von Goethe
```

In der Übersicht zeigt eine 16:9-Live-Vorschau das aktuelle Beamer-Bild samt Schnellsteuerung (Timer starten/stoppen, neu starten, zwischen Frage und Scoreboard wechseln, Frage abbrechen). Darunter wählst du eine Frage aus der Liste (inkl. Gespielt-Status), stellst ihre Dauer von 1 bis 3600 Sekunden ein und startest sie mit „Frage starten“. Eine gestartete Frage erscheint zunächst mit pausiertem Countdown („Bereit“) auf dem Scoreboard, bis die Zeit explizit gestartet wird. Änderungen an der Dauer wirken direkt auf noch nicht gestartete Fragen; Bearbeitungen im Fragen-Dialog bleiben auf der aktuellen Frage und synchronisieren eine laufende Frage live. Fragenliste, Zeiten und Gespielt-Status bleiben nach dem Neuladen gespeichert.

Das Scoreboard zeigt „Frage X“, den Fragetext, optionale Antworten und den Countdown. Die letzten zehn Sekunden pulsieren synchron zu den Sekundenwechseln rot; bei reduzierter Bewegung bleibt der Timer statisch rot. Nach Ablauf bleibt die Frage mit „Zeit abgelaufen“ sichtbar. „Zurück zum Scoreboard“ schließt die Frage und wählt automatisch die nächste ungespielte Frage aus. „Frage abbrechen“ fragt vor dem Beenden nach. Eine automatische Wertung erfolgt nicht; Sound ist für eine spätere Erweiterung vorgesehen.

Antwortmöglichkeiten sind nach dem Start verborgen, lassen sich aber bereits vorab vorbereiten und live einzeln (A, B, C …) oder gesamt ein- und ausblenden. Der Countdown bleibt ohne sichtbare Antworten unter der Frage und wandert mit dem ersten Reveal animiert nach oben rechts; das Verbergen aller Antworten bringt ihn zurück.

Richtige Antworten werden bei Auswahlfragen per Haken oder `*` markiert (`(Merkur*)`, mehrere möglich), bei offenen Fragen per `; =Lösung` oder im Formularfeld „Lösung (optional)“ hinterlegt. Bei offenen Fragen zeigt `/regie` die Lösung direkt als Moderationshinweis an, ohne sie auf dem Beamer zu zeigen. „Lösung aufdecken“ und „Lösung verbergen“ stehen jederzeit zur Verfügung – auch vor Ablauf der Zeit –, ohne den Countdown zu verändern: Bei Auswahlfragen werden alle Antworten eingeblendet und die richtigen grün hervorgehoben, bei offenen Fragen erscheint die Textlösung animiert auf dem Beamer. Der KI-Importprompt berücksichtigt beide Formate.

Fragen werden intern strukturiert gespeichert; ältere gespeicherte Textlisten werden weiterhin übernommen. Inhalte mit Sonderzeichen des Importformats können im Editor bearbeitet und gespeichert werden.

## Routen und Quizstatus

`/` zeigt die Landingpage. Sobald in `/regie` „Quiz starten“ gewählt wird, leitet `/` automatisch nach `/quiz` weiter (über das `pubquiz/`-Logo in `/regie` bleibt die Landingpage per `/?landing=true` erreichbar). `/quiz` zeigt ohne laufendes Quiz und mit angelegten Teams einen Wartebildschirm („Gleich geht’s los.“) und wechselt nach dem Start animiert auf das Scoreboard bzw. die aktive Frage. „Quiz beenden“ fragt zur Sicherheit nach, beendet eine ggf. laufende Frage und kehrt zum Wartebildschirm zurück; Teams und vorbereitete Fragen bleiben erhalten. Der Status liegt unter `pubquiz-running` im localStorage und wird zwischen Tabs derselben Origin synchronisiert.

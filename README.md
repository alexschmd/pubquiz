# Pubquiz Dashboard

Ein Echtzeit-Quiz-Management-Dashboard, gebaut mit [Once UI](https://once-ui.com/) und Next.js (Once UI-Framework), das nahtloses Tracking und Anpassen von Team-Punkten ermöglicht.

## Funktionen

- **Dynamische Team-Verwaltung**: Füge Quiz-Teams hinzu, bearbeite oder lösche sie direkt – alle Änderungen werden in `localStorage` gespeichert.  
- **Anpassbare Team-Farben**: Weise Teams Startfarben über einen intuitiven Farbwähler zu.  
- **Echtzeit-Punktestand**: Erhöhe oder verringere Punkte direkt im Dashboard, die Teams werden automatisch nach Punktestand sortiert.  
- **Responsives Rasterlayout**: Das Layout passt sich flexibel an jede Anzahl von Teams (1–10) an.  
- **Landing Page**: Zeigt den Punktestand an und soll für die Teilnehmer sichtbar sein.
- **Manage Page**: Wird vom Admin benutzt um die Teams und ihre Punkte zuverwalten.


## Erste Schritte

```bash
# Dependencies installieren
npm install

# Projekt
npm run dev
```

## Produktion & Deployment

```bash
# Dependencies installieren
npm install

# Projekt builden 
npm run build

# Build starten
npm run start
```

## Aufrufen

```bash
# Scoreboard im Browser öffnen
http://localhost:3000

# Manage Page im Browser öffnen
http://localhost:3000/manage
```
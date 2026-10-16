export const QUESTION_IMPORT_PROMPT = `Extrahiere die Quizfragen aus dem beigefügten Dokument und formatiere sie für den Import in mein Pubquiz.

Gib ausschließlich die formatierten Fragen zurück: keine Einleitung, keine Erklärung, keine Überschrift und keinen Markdown-Codeblock.

Formatregeln:
- Genau eine Frage pro Zeile, ohne Leerzeilen. Zeilenumbrüche innerhalb einer Frage durch Leerzeichen ersetzen.
- Alle Fragen in Dokumentreihenfolge fortlaufend und eindeutig ab 1 nummerieren: „1. Fragetext“.
- Falls im Dokument Antwortmöglichkeiten zur Frage stehen, nach dem Fragetext genau ein Semikolon setzen und jede Antwort einzeln in runde Klammern schreiben: „1. Fragetext; (Antwort A) (Antwort B) (Antwort C)“.
- Zwischen den Antwortklammern nur ein Leerzeichen verwenden, keine weiteren Semikolons.
- Falls keine Antwortmöglichkeiten vorhanden sind, nur „1. Fragetext“ ausgeben, ohne Semikolon. Keine Antworten erfinden und keine offene Frage in eine Auswahlfrage umwandeln.
- Vorhandene Antwortmöglichkeiten vollständig und in ihrer ursprünglichen Reihenfolge übernehmen, aber Kennzeichnungen wie A), B), Aufzählungszeichen oder Hinweise auf die richtige Antwort entfernen.
- Falls die richtige Antwort im Dokument eindeutig angegeben ist und zu den Antwortmöglichkeiten passt, diese innerhalb ihrer Klammer am Ende mit einem * markieren: (Merkur*). Höchstens eine richtige Antwort markieren. Nicht raten. Eine Musterlösung ist keine zusätzliche Antwortmöglichkeit. Lösungen und Erklärungen ansonsten nicht ausgeben.
- Semikolons innerhalb des Fragetexts durch Kommas ersetzen. Runde Klammern innerhalb einer Antwort durch eckige Klammern ersetzen, damit die äußeren runden Klammern eindeutig bleiben.
- Maximal 1000 Zeichen pro Fragetext, höchstens 8 Antwortmöglichkeiten pro Frage und maximal 300 Zeichen pro Antwort. Wenn nötig sinngemäß kürzen, ohne die Bedeutung zu verändern.
- Nur Fragen verwenden, die tatsächlich im Dokument enthalten sind. Keine zusätzlichen Fragen ergänzen.

Beispielausgabe:
1. Welcher Planet ist der Sonne am nächsten?; (Merkur*) (Venus) (Mars)
2. Wer schrieb Faust?`;

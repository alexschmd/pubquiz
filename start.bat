@echo off
setlocal

rem ---------------------------------------------
rem Hier kannst du einen Standard-Pfad vorgeben.
rem Wenn du keinen Default-Pfad willst, lass die
rem nachfolgende Zeile leer (set "DEFAULT_DIR=").
rem ---------------------------------------------
set "DEFAULT_DIR=C:\pfad\zu\deinem\projekt"

rem Wenn DEFAULT_DIR gesetzt ist, übernehmen, sonst fragen
if defined DEFAULT_DIR (
    set "targetdir=%DEFAULT_DIR%"
) else (
    goto ASKDIR
)

:CHECKDIR
if not exist "%targetdir%" (
    echo.
    echo Fehler: Das Verzeichnis "%targetdir%" existiert nicht.
    echo Bitte erneut versuchen.
    echo.
    set "targetdir="
    goto ASKDIR
)
goto PREPARE

:ASKDIR
set /p targetdir=Bitte gib das Verzeichnis ein, in dem "npm start" ausgeführt werden soll: 
goto CHECKDIR

:PREPARE
pushd "%targetdir%" || (
    echo.
    echo Fehler: Konnte nicht in "%targetdir%" wechseln.
    exit /b 1
)

echo.
echo Oeffne Standard-Browser...
start "" "http://localhost:3000"
start "" "http://localhost:3000/manage"

rem Kleine Pause, damit die Browser-Aufrufe rausgehen und der Server etwas Zeit hat
timeout /t 3 /nobreak >nul

echo.
echo Starte "npm start" im aktuellen Fenster...
npm start

rem npm start blockiert hier – schließt du die Konsole, wird der Server sofort beendet.
popd
endlocal
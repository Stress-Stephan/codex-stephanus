# Die Waffenkammer des Schalks

Begehbarer Entwurf für „30 Waffen gegen das Grau“, Stand 25.10.2026.

## Lokal ansehen

Den kompletten Ordner entpacken und `index.html` in Chrome oder Edge öffnen. Kein Build, keine Installation und kein Konto nötig. Der Ordner `assets` muss neben der HTML-Datei bleiben.

## Auf GitHub Pages laden

1. Den Inhalt dieses Ordners in einen eigenen Repository-Ordner oder ins Repository-Hauptverzeichnis laden: `index.html`, `style.css`, `app.js`, `books.js`, `.nojekyll` und `assets`.
2. Im Repository unter **Settings → Pages → Deploy from a branch** den Branch und Ordner wählen. Liegt der Inhalt in einem Unterordner `waffenkammer`, lautet die Adresse anschließend `https://BENUTZER.github.io/REPOSITORY/waffenkammer/`.
3. Diese veröffentlichte Adresse kann auf der bestehenden Website verlinkt oder als iframe eingebettet werden. Für den Rundgang ist eine bildschirmfüllende Darstellung sinnvoll.

Keine Dateien dieser Lieferung wurden auf GitHub oder der bestehenden Website veröffentlicht.

## Steuerung

- W / S oder ↑ / ↓: gehen; A / D oder ← / →: umsehen.
- Mausrad: vorwärts und rückwärts.
- Bildschirmtasten: antippen oder gedrückt halten, auch auf dem Handy.
- Bilder im Gang: anklicken und groß betrachten.
- Am Ende des Ganges: Tür öffnen; alternativ am Anfang direkt zur Waffenkammer springen.
- In der Kammer: Wand über die drei Schaltflächen auswählen, Cover anklicken.
- „Alle 30 Waffen“: direkte Übersicht mit Reihenfilter.
- Escape oder ×: geöffnetes Bild schließen.
- Unter „?“ lässt sich ruhige Bewegung einschalten.

## Inhalte und Links

30 unveränderte JPG-Originalcover: AS01–AS15 und ST01–ST15 aus den angegebenen Ordnern. Vier Originalbilder im Gang und das große Schmiedebild an der Rückwand aus `https://stephan-universum.de/legende`. Das unveränderte Gangfoto liegt unter `assets/gang.jpg` und dient als Hintergrund hinter der räumlichen Szene. Wände und Boden sind eine eigene SVG-Steinstruktur; die bewegliche Perspektive entsteht mit CSS, die Schmiede mit der Originalillustration und einer ergänzenden SVG-Darstellung. Der Entwurf ist kein fotorealistischer 3D-Scan des Gangfotos.

Die Auswahl öffnet das Originalcover und einen Link zur jeweiligen bestehenden Amazon-Buchreihe. Direkte Einzelproduktlinks wurden nicht geliefert. Sie können in `books.js` unter `links` ergänzt werden, beispielsweise `AS01:'https://www.amazon.de/dp/…'`. Erst dann wechselt die Beschriftung auf „Dieses Buch ansehen“.

Die kurzen Bildbezeichnungen dienen der Navigation des Entwurfs. Der vollständige Originaltext der Legende ist über die Bildansicht erreichbar. Keine Tonspur, keine Tracker, keine extern geladenen Bibliotheken oder Schriften.

## Prüfung

In Chrome: Gang mit Tastaturschritten bis zur Tür durchlaufen, Türwechsel, Bücherwand, Buchdetail, Katalog mit 30 Einträgen, Small-Truths-Filter mit 15 Einträgen und Detail von ST15 geprüft. Handyansicht bei 390 × 844 geprüft; kein horizontaler Dokumentüberlauf und keine fehlgeschlagenen Bilddateien bei der Kontrolle. Originalcover nach dem Kopieren per SHA256 verglichen. Kein Test auf einem echten Mobilgerät und keine GitHub-Pages-Veröffentlichung.

## Lorenfahrt, überarbeitet am 26.10.2026
Am Eingang Tür öffnen und einsteigen. Der Sitz dreht sich einmal nach links, während die Lore weiter geradeaus rollt. Vier Originalbilder hängen ausschließlich links. Es gibt keine automatischen Bildhalte. Ein Klick auf ein Bild öffnet die Großansicht und pausiert die Bewegung bis zum Schließen. Pause, Weiterfahren, Weiter und Überspringen bleiben verfügbar.

Das Bild mit Stress- und Dunkel-Stephan ist entfernt. Das Schmiedebild hängt ausschließlich in der Waffenkammer, groß gegenüber dem Eingang. Gang und Raum sind räumlich verbunden: Die Tür öffnet sich vor der Lore, die Schienen führen weiter in den Raum. Erst dort hält die Lore an; danach kann man aussteigen und die Bücher auswählen. ride.js beim GitHub-Upload mit übernehmen.

## Neue Optik und Bilder
Die aktuelle Galerie enthält drei neue bodenhohe Wandbilder ohne Rahmen: Der Ruf nach dem Boten, Der Gefährte und Siegelbruch (zuerst angehängte Variante Siegelbruch 2.jpeg). Der Schmied.jpeg hängt im Raum. Die freigestellte Website-Schmiede ersetzt die SVG-Behelfsschmiede. Materialtextur und Bildbearbeitung sind in Bildbearbeitung.md dokumentiert. Für GitHub das Paket entpacken und die Dateien samt assets hochladen. Die Einzeldatei ist wegen der unveränderten Originalbilder etwa 31 MB groß. Die Ordnerfassung wurde im Browser geprüft, bei der Einzeldatei wurden die eingebetteten JavaScript-Blöcke auf Syntax geprüft; ihr separater Browseraufruf scheiterte an der Übertragungsgrenze des Vorschauwerkzeugs.


## Automatischer Einstieg mit Abfahrt
Die Eingangstür startet die Fahrt direkt. Ein zweiter Startklick entfällt. Die Lore fährt zunächst einen steilen Schacht hinab und durch eine 90-Grad-Kurve in den Bildergang. Pause und Überspringen bleiben erreichbar. Bei bevorzugter reduzierter Bewegung beginnt die Fahrt direkt in der Galerie. Im Raum ist ausschließlich der Ofen zu sehen; die zusätzliche Figur und der Amboss sind entfernt. Das Wandbild wurde auf nahezu volle Höhe des größeren Raums vergrößert. Einstieg, Abfahrt, Übergang zur Galerie, Ankunft und Ausstieg wurden im Browser geprüft.


## Massives Eingangstor
Die erste Tür ist jetzt ein großes altes Eichentor mit geschmiedeten Eisenbändern, Ringgriffen und sichtbarer Holzmaserung. Die Tür besteht aus zwei animierten Flügeln und öffnet in etwa 1,8 Sekunden. Die anschließende Abfahrt startet ohne zweiten Klick. Eingangsdarstellung und automatischer Start wurden im Browser geprüft.


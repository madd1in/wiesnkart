# Suppa Lederhosn Karts (Wiesn Kart)

Spielbarer 3D-Arcade-Kart-Prototyp fuer den Browser (bis Runde 53 "Mushroom Rally"), gebaut ab 13.09.2026.
Kleine Karts, grosse Gaudi: Rennen rund ums Volksfest, durch Pilzwald, Schloss, Festzelt und Geisterhaus.
Alle Figuren, Modelle, Musik und Namen sind eigene Entwuerfe.

Live: https://madd1in.github.io/wiesnkart/ (die alte Adresse leitet weiter)

## Runde 70 (01.10.2026): 16-BIT-Modus, Cheat-Code, versteckte Spielmodule, SOUND TEST (Retro-Hommagen und Easter Eggs)

Nutzerwunsch "mehr Retro-16-Bit-Referenzen und Easter Eggs" – alles eigene Hommagen an die Konsolen-Ära, keine fremden Figuren.

**🎮 16-BIT-Modus** (Knopf unter Grafik, im Pausenmenü): die Szene wird in Konsolen-Auflösung gerendert (224 Zeilen), dann auf
15-Bit-Farben (5 Bit je Kanal) mit 4×4-Bayer-Raster gebracht und pixelig hochskaliert; kombinierbar mit dem CRT-Look (dann
wie am Röhrenfernseher). Dazu ein gedämpfter Klang mit kurzem Hall wie aus dem Soundchip. Auf schwachen Geräten sogar schneller.

**Cheat-Code im Menü**: ↑↑↓↓←→←→ B A (Tastatur oder Controller) – schaltet den 16-BIT-Modus ein, die Lackierung
„Konsolengrau“ frei und gibt den Erfolg *Alte Schule*.

**Versteckte Spielmodule**: auf jeder der zwölf Strecken schwebt ein Voxel-Spielmodul (graues Modul mit Brezn-Etikett) über
einer Sprungschanze – nur im Sprung erreichbar. Gefunden bleibt gefunden („🎮 SPIELMODUL GEFUNDEN! 3/12“); alle zwölf geben den
Aufsatz **Spielmodul** und den Erfolg *Modulsammler*.

**SOUND TEST**: fünfmal schnell auf den Titel tippen – alle 14 Chiptune-Stücke und viele Klänge zum Anhören, im 16-Bit-Stil.

**Retro-Sprüche**: letzter Platz heißt jetzt „GAME OVER? NÖ – NOCHMAL!“, der Ladebildschirm bittet manchmal, das Modul nicht
anzupusten. Fix: die unsichtbare Kopfleiste überdeckte im Menü den Titel.

## Runde 69 (01.10.2026): Wochenziele, Garagen-Vorschau, Münzregen, Fahrer-Brabbeln

**Wochenziele** (`progress.mjs`, Tests): drei Aufgaben je Kalenderwoche, für alle gleich (z. B. „Gewinne 3 Rennen“,
„Zünde 30 Drift-Turbos“, „Fahre 3 Online-Rennen“, „Fahre auf 4 verschiedenen Strecken“), Fortschritt über alle Rennen der
Woche, je Ziel +80 XP. Wer alle drei schafft, bekommt den neuen Aufsatz **🏆 Wochen-Pokal** (Voxel). Karte unter der
Tagesaufgabe – eingeklappt eine Zeile mit drei Punkten, aufgeklappt mit Fortschrittsbalken und Resttagen.

**Garagen-Vorschau**: in der Fahrer-Karte steht jetzt das eigene Kart als gerendertes Bild – mit Fahrer, Farbe, Karosserie
und Aufsatz, aktualisiert bei jeder Änderung.

**Münzregen** (neues Item, eher für vorne): vier Münzen auf einmal (mehr Höchstgeschwindigkeit) und ein kleiner Schub,
goldener Funkenregen, aufsteigende Münzklänge; die KI nutzt ihn, wenn sie wenige Münzen hat.

**Klang**: die Fahrer **brabbeln** zu ihren Pixel-Sprechblasen – kurze Chiptune-Silben in eigener Tonhöhe je Figur (wütend
tiefer, froh höher, Schreck steigend), online mit der Figur des Mitspielers. Dezente Klicks auf allen Menüknöpfen.

**Pixel-Konfetti** auf dem Treppchen beim Zieleinlauf. Auf kleinen Bildschirmen blendet das einfache Menü die
Online-Hinweiszeile aus (steht auch im Online-Fenster).

## Runde 68 (01.10.2026): Siegerkarte zum Teilen, Aufsätze in der Lobby, KI hält Bananen, Itemboxen ploppen auf

**Siegerkarte teilen** (für mehr Spieler über Freunde): auf dem Ergebnis-Bildschirm erzeugt "📤 Siegerkarte teilen" ein
Hochformat-Bild im Pixel-Look – Platz, Sterne, Strecke, Klasse, Zeit, beste Runde, Name bzw. Spitzname, Aufsatz und Link zum
Spiel. Auf dem Handy über das Teilen-Menü, sonst als PNG-Download.

**Online**: Aufsätze erscheinen in der Spielerliste der Lobby und im Namensschild über den Karts der Mitspieler.

**KI hält Bananen und Fake-Blöcke hinter sich** (sichtbar), bis sie sie ablegt – eine Such-Brezn von hinten prallt daran ab.

**Itemboxen** ploppen nach dem Einsammeln federnd wieder auf, statt schlagartig da zu sein.

## Runde 67 (01.10.2026): Lebendigere Fahrer, Voxel-Deko an den Strecken, Items halten und nach hinten werfen

**Fahrer** (Nutzerwunsch "grafisch an den Fahrermodellen feilen"): **Pixel-Sprechblasen** über den Köpfen – wütend nach einem
Dreher, froh nach einem gelandeten Treffer oder beim Überholen, Schreck vor dem XXL-Stachelpanzer, Herz beim Maß Bier. Die
Fahrer **drehen sich zum Kart neben sich** (auch zu dem, der dicht auffährt).

**Strecken**: **Retro-Voxel-Deko am Rand** je Thema (`voxel.mjs` decoModel): Kakteen im Sonnen-Canyon, Schneemänner am
Eisstock-See, Palmen in der Schildkröten-Bucht, Kürbisse im Geisterhaus, Fliegenpilze auf Pilz-Promenade und im Neon-Pilzwald,
Maßkrüge auf Bierstraße und Magnet-Kirmes, Lollis im Schoko-Matsch – instanziert, fest verteilt, nur an freien Plätzen.
**Reifenspuren** liegen länger, es gibt mehr davon, Farbe je Untergrund (Eis hell, Sand/Schoko braun), auch beim Dreher.

**Gameplay**: **Item hinter sich halten** – Leertaste / Item-Blase / X gedrückt halten: Banane oder Fake-Block hängen hinten am
Kart und **fangen eine Brezn von hinten ab**; loslassen legt ab (kurz tippen wie bisher, nach 10 s automatisch). **Grüne Brezn
nach hinten werfen**: dabei Bremse (↓/S) halten – auch die KI wirft nach hinten, wenn einer dicht auffährt. Die Fahrschule
erklärt das Halten, sobald man eine Banane hat; zwischen zwei Tipps liegen mindestens 18 s.

## Runde 66 (01.10.2026): XXL-Stachelpanzer, Voxel-Aufsätze, Glücksbrezn, Auto-Spitznamen, Fahrschule, 8-Bit-Jingles

**XXL-Stachelpanzer** (Nutzerwunsch, eigener Entwurf, `voxel.mjs`): eine riesige stachelige Voxel-Kuppel rollt schlingernd die
Strecke entlang und **walzt jeden auf ihrer Spur um** (bleibt nicht stehen, trifft jeden einmal, schleudert hoch). Maß Bier und
Riesenwuchs halten stand, kreisende Brezn opfern sich. In der Arena prallt er am Rand ab. Nur im hinteren Feld, Rückspiegel
warnt, eigene Chip-Klänge (Grollen, Walzen-Krach), online und KI.

**Voxel-Aufsätze** (Kosmetik über dem Kart, `progress.mjs` TOPPERS): Lebkuchenherz (Stufe 3), Maßkrug (3 Tage Wiesn-Serie),
Riesenbrezn (Stufe 6), Pixel-Stern (10 Online-Rennen), Pixel-Krone (Online-Sieg). Wahl in der Fahrer-Karte (auch im einfachen
Menü), gesperrte zeigen, wie man sie bekommt; **online sehen alle Mitspieler deinen Aufsatz**. Ein paar KI-Fahrer tragen auch
einen. Nah an der Kamera werden fremde Aufsätze ausgeblendet.

**Glücksbrezn des Tages**: einmal am Tag im Menü aufbrechen – 30 bis 250 XP (Pixel-Brezn, Pixel-Konfetti, Chip-Klang).

**Automatische Spitznamen online** (Nutzerwunsch, `nick.mjs`): wer keinen Namen eingibt, fährt als „TurboBrezn42“,
„DriftFuchs76“ … – einmal vergeben und gemerkt, 🎲 würfelt einen neuen.

**Fahrschule**: Tipps im ersten Rennen nur, wenn sie gebraucht werden (kein Gas nach dem Start, erste Kurve ohne Drift-Turbo,
Item ungenutzt), passend zu Tastatur, Touch oder Controller; gelernt = nie wieder.

**Online**: kreisende Brezn reisen in den Kart-Flags mit (alte Clients ignorieren sie); Brezn-Treffer prüft jeder für seine
eigenen Karts. Arena-Items um Brezn-Trio, Fake-Block erweitert.

**8-Bit-Jingles** für Sieg/Treppchen und „Nochmal!“ (eigene Kompositionen statt der alten Samples), „?“-Blöcke zerspringen beim
Einsammeln in Pixel-Splitter.

## Runde 65 (01.10.2026): Einfaches Startmenü, Online-Anreize, Brezn-Trio, Fake-Block, Pixel-Itemboxen, neue Chiptune-Musik

**Einfaches Startmenü** (Nutzerwunsch "Menü am Anfang zu abschreckend und komplex"): beim Start nur noch zwei große Knöpfe
**🌐 Online fahren** und **🏁 Schnelles Rennen** (zuletzt gewählte Strecke und Klasse), darunter Fahrerwahl und Tagesaufgabe.
Modi, Strecken, Kart, Lenkhilfe und Grafik liegen hinter **☰ Alle Modi, Strecken & Einstellungen**; "← Einfaches Menü" führt
zurück. Wer das volle Menü aufmacht, bekommt es beim nächsten Besuch wieder. Controller: A startet online.

**Mehr Anreize für Online** (`progress.mjs`, Tests): Online-Rennen zählen **doppelt** (×2 XP), **+20 XP je geschlagenem
Menschen**, **+100 XP fürs erste Online-Rennen des Tages**. Drei **Lackierungen nur online** (Wiesn Blau-Weiß nach 1, Lebkuchen
nach 3, Pixel-Pink nach 5 Online-Rennen, 🌐 am Farbtupfer). Der erste Online-Sieg vor einem Menschen bringt die
**Pixel-Krone** (Voxel), die ab dann über dem eigenen Kart schwebt – online sehen sie alle Mitspieler. Neue Erfolge
*Wiesn-Gesellig*, *Online-Champion*, *Stammgast* (10 Online-Rennen), *Menschenkenner* (25 Menschen geschlagen). Der
Online-Knopf zeigt den Bonus ("+100 XP heute" / "×2 XP") und die Zahl der Spieler online; das Online-Fenster listet alle Vorteile.

**Wiesn-Serie** (Streak): wer an aufeinanderfolgenden Tagen fährt, bekommt beim ersten Rennen des Tages +15 XP je Serientag
(bis Tag 7); das Menü zeigt den Stand.

**Brezn-Trio** (Nutzerwunsch "3 um den Fahrer rotierende grüne/rote Panzer"): drei Pixel-Brezn kreisen ums Kart. Sie fangen
Bananen, Fake-Blöcke und Such-Brezn ab (je eine Brezn), wer sie streift, dreht sich. Jeder Item-Druck feuert eine:
**grün** fährt stur geradeaus die Spur entlang und trifft den Ersten, den sie erwischt (auch den Werfer), **rot** sucht den
Nächsten vor einem. Online synchronisiert, KI nutzt beide.

**Fake-Fragezeichen-Block** (Nutzerwunsch): sieht aus wie eine Itembox, nur mit kopfstehendem "¿" – wer reinfährt, rutscht
wie auf einer Bananenschale ("FAKE! REINGELEGT 😈"). Die Hälfte der KI-Fahrer fällt drauf rein.

**Retro-Voxel-Pixel-Assets** (`voxel.mjs`, Tests): kleiner Voxel-Baukasten zur Laufzeit (ASCII-Pixelkarten → nur
Außenflächen, 8-Bit-Flächenlicht) – Brezn grün/rot, Pixel-"?"-Block, Fake-Block, Pixel-Krone. Die **Itemboxen sind jetzt
Pixel-"?"-Blöcke**, auch im HUD.

**Chiptune** – neue eigene Stücke (`art/r61/chiptune.mjs`, MP3 per ffmpeg, Lautheit angeglichen): Menü *Wiesn-Ouvertüre*,
Pilz-Promenade *Almwiesen-Galopp*, Sonnen-Canyon *Wüstenritt*, Neon-Pilzwald *Leuchtpilz-Beat*, Lobby-Welt/Kotzhügel
*Festzelt-Boogie* – damit läuft überall eigene 8-Bit-Musik. Neue Chip-Effekte (`art/r65/make_sfx.mjs`): Brezn-Wurf,
Fake-Block (Kichern und Zerplatzen), Dreher, Flunder und Zurückploppen, Rückspiegel-Piep, Pixel-Krone-Fanfare, Online-Bonus,
Menü-Klick, Wusch, Landung, Platschen, falsche Richtung.

### Ideen für mehr Spieler (nächste Runden)

- **Wochen-Cup online**: jede Woche ein fester Cup mit Online-Bestenliste und Pokal fürs Profil.
- **Freunde-Bonus**: wer über den eigenen Einladungslink kommt, bringt beiden beim ersten gemeinsamen Rennen Extra-XP.
- **Saison-Pass "Wiesn-Saison"**: kostenlose Belohnungsstufen (Hupen, Reifenspuren, Pixel-Hüte) über 4 Wochen.
- **Geister-Duelle**: Zeitfahr-Geister von Freunden per Link teilen und schlagen.
- **Emotes und Hupen** im Rennen (schon im Chat vorhanden) als schnelle Pad-Tasten, freischaltbar.
- **Zuschauer-Modus** in der Lobby-Welt: laufendes Rennen live aus der Luft-Loisl-Kamera verfolgen.
- **Clans / Festzelte**: Teams mit gemeinsamer Punktzahl pro Woche, Zeltfahne über dem Kart.
- **Tägliche Glücksbrezn**: einmal am Tag ein kleines Zufallsgeschenk (Lackierung, Hupe, XP).
- **Kurze Einstiegs-Tour**: 30-Sekunden-Übungsrunde beim ersten Start, die Drift, Hopsen und Items zeigt.
- **Teilbare Siegerbilder**: On-Ride-Foto mit Platz und Zeit als Bild zum Teilen.

## Runde 64 (30.09.2026): Riesendom mit Retro-Pixel-Charme, Klaenge fuer Dreher und Flunder, Haenger-Suche

**Riesendom mit leichtem Retro-Pixel-Voxel-Charme** (Nutzerwunsch, `art/r64/create_voxdome.py`): ein grosser Pixel-
Sonnenball im Abendhimmel hinter den Tuermen, blockige Pixelwolken treiben ueber dem Wolkenmeer, am Strassenrand
Pixel-Banner mit Sonnenwappen, Voxel-Waechterstatuen mit Grossschwert und Kohlebecken mit Pixelflamme (ohne Kollision, damit
die Anti-Grav-Roehren frei bleiben), dazu kreisende Pixel-Vogelschwaerme.

**Klaenge** - Reifenquietschen beim Dreher, ein "Pfff" mit Papierflattern beim Plattdruecken, ein Doppelpiep, wenn der
Rueckspiegel aufgeht.

**Haenger-Suche** (`art/r64/stuck_sweep.py`) - an allen Loopings und Anti-Grav-Roehren aller Strecken mit Vollgas und drei
Einfahrtstempos durchgefahren: kein harter Stopp mehr wie vorher im Riesendom; alle Loopings schaffen schon 10 m/s Einfahrt.

## Runde 63 (30.09.2026): Dreher, platt wie eine Flunder, Oelpfuetzen, Rueckspiegel

**Dreher** (Nutzerwunsch, wie in klassischen Kart-Spielen) - nach Banane, Such-Brezn, Blauer Brezn, einer Oelpfuetze oder
einem harten Rempler ohne Sporen dreht sich das Kart sichtbar zwei-, dreimal um die eigene Achse, huepft dabei leicht und
verliert das Tempo (vorher kreiselte es nur waehrend der Betaeubung). Sporen machen weiter schneller (+0,35 m/s je Spore,
hoechstens 10) - wer keine hat, faellt beim Rempeln herum.

**Platt wie eine Flunder** - die Masskrug-Stampfer (und Riesenwuchs-Karts) druecken das Kart papierduenn: es flattert 1,9 s wie
ein Blatt Papier, faehrt langsamer und ploppt dann mit einem Klang zurueck.

**Oelpfuetzen** auf Sonnen-Canyon, Bierstrasse und Magnet-Kirmes (schillernde Lachen auf der Fahrbahn) - Dreher, Mass Bier,
Boellerschuss und Riesenwuchs schuetzen; die KI weicht aus.

**Rueckspiegel** - fliegt eine Such-Brezn von hinten auf mich zu oder ist eine Blaue Brezn im Anflug, blendet oben ein
gerahmter Rueckspiegel ("⚠ VON HINTEN!") mit dem Blick nach hinten ein.

**Ampel-Loisl** schaut jetzt zum Starterfeld (die Drehung wurde aus lookAt und zurueckgesetzten Euler-Winkeln gebaut und
kippte je nach Richtung weg).

## Runde 62 (30.09.2026): Kamerafahrt vor dem Start, Intro-Fanfare, Ampel-Pieptoene, der Luft-Loisl

**Kamerafahrt ueber das Starterfeld** (Einzelrennen, Grand Prix, Zeitfahren; nicht online) - vor dem Countdown faehrt die
Kamera tief an der Startaufstellung entlang und schaut den Fahrern ins Gesicht (Namen blenden ein), dann schwenkt sie hinter
das eigene Kart. Jede Taste, jeder Tipp und jede Pad-Taste ueberspringt. Dazu eine **eigene Intro-Fanfare** (Chiptune,
D-Dur, Pulswellen-Lead, Harmonie, Dreieck-Bass, Trommelwirbel und Becken); die Rennmusik setzt erst danach ein.

**Ampel mit Pieptoenen** - drei kurze Toene fuer die drei roten Phasen, ein langer hoher bei Gruen (vorher nur zwei plus
Start).

**Der Luft-Loisl** (eigene Figur, `art/r62/create_loisl.py`): ein Bayer mit Schnauzer, Gamsbart-Hut und Hosentraegern im
fliegenden Masskrug mit Propeller. Er schwebt mit der Startampel vor dem Feld (die Lampen folgen dem Countdown) und steigt
beim Start auf, zeigt bei falscher Richtung sein Schild "FALSCHE RICHTUNG ↺" und fischt Abgestuerzte mit der Angel aus Wasser
und Abgrund - das Kart haengt an der Schnur und wird sanft auf die Strecke gesetzt.

## Runde 61 (30.09.2026): Cups, Schoko-Matsch, Online als Standard, eigene Chiptune-Musik je Strecke, CRT-Modus, Xbox-Controller, XXL-Riesendom, 8-Bit-Geisterhaus

**Online ist der Standardmodus** - erster Modus-Knopf "🌐 Online" ist vorausgewaehlt; der (blaue) Startknopf "Online los!"
springt direkt in die oeffentliche Lobby-Welt. Einzelrennen, Grand Prix, Zeitfahren, Wiesnland und Kotzhügel bleiben daneben.

**Strecken in Cups** (`cups.mjs`, Tests) - Grand Prix jetzt je Cup: 🥨 Brezn-Cup, 🍺 Masskrug-Cup, 💝 Lebkuchen-Cup (je vier
Strecken) und 🎡 Wiesn-Marathon ueber alle zwoelf. Cup-Auswahl erscheint im Grand-Prix-Modus, die Cup-Strecken sind nummeriert,
Pokale je Cup und Klasse (der Marathon behaelt die alten Pokale).

**Neue Strecke Schoko-Matsch** (eigene Hommage an Schokoladen-Matschstrecken, eigener Name und eigenes Layout, `choco.mjs`
mit Tests): Schokomatsch-Pfuetzen bremsen und nehmen Seitenhalt (mit Turbo gleitet man fast ungebremst durch, schmatzender
Klang), Schokobrocken wackeln am Hang (rosa Warnstreifen) und rollen quer ueber die Bahn, Sprung ueber den Schokofluss,
Keks-Stollen, Waffel-Buckel. Blender-Modelle (`art/r61/create_choco.py`): Schokobrocken mit Nuessen, Lebkuchenherz am
Holzgestell, Riesen-Schokobrezn mit Streuseln, Waffelturm, Sahnehaube, dreistoeckiger Schokobrunnen, Pralinen,
Zuckerwatte-Baeume. Die KI weicht Pfuetzen (je nach Koennen) und rollenden Brocken aus.

**Eigene Chiptune-Musik** (`art/r61/chiptune.mjs`: kleiner 8-Bit-Synthesizer, eigene Kompositionen, Blender-Mixdown zu MP3):
Geisterhaus Gothic-Barock, Bierstrasse Masskrug-Polka, Graben-Flug Sturzflug-Marsch, Bucht Lagunen-Calypso, Eissee Walzer,
Riesendom Orgel-Choral, Schoko-Matsch Swing, Lava-Feste Magma-Galopp, Magnet-Kirmes Rummelwalzer; Lautheit an die alte Musik
angeglichen. Es spielt immer nur ein Stueck (MP3 und Chiptune ueberlagern sich nicht).

**CRT-Modus** (optional, Knopf "📺 CRT" unter Grafik, im Pausenmenue, Controller X): Roehrenwoelbung, Farbsaeume, Leuchten,
Scanlines, Streifenmaske, Vignette, leichtes Flimmern als Nachbearbeitungs-Shader; das HUD bekommt feine Zeilen.

**Xbox / Edge mit Controller** (`padnav.mjs`, Tests): das ganze Menue und alle Fenster (auch Online) sind per Steuerkreuz/Stick
raeumlich navigierbar (gelber Fokusrahmen, Halten wiederholt), A bestaetigt, B zurueck, Menue-Taste startet, LB/RB Modus.
Auf der Xbox (oder mit `?tv=1`) Fernseh-Modus ohne Touch-Tasten und ein Hinweis: in Edge die Menue-Taste halten und
"Spielsteuerung verwenden" waehlen - dann gehen alle Tasten ans Spiel.

**Riesendom als XXL-Kathedralenstadt** (`art/r61/create_domecity.py`): Riesen-Kathedralen mit Doppeltuermen und Rosenfenster,
Glockentuerme, Kuppel-Rotunden, Arkadenzeilen und Strebebogen-Tore quer ueber der Fahrbahn, dazu ein Ring aus Riesenbauten,
die aus dem Wolkenmeer ragen. Zwei Anti-Grav-Passagen schlaengeln sich durch die Haeuserschluchten (Ueberkopf-Fahrt und
Rundum-Tour unter den Toren). Fix: in der Ueberkopf-Passage prallte man seitlich gegen unsichtbare Kollisionspunkte der Pfeiler und blieb haengen - Tore und Arkaden haben keine Kollision mehr, Tore ueber Anti-Grav-Zonen sind 1,6-fach gross.

**Geisterhaus in 8/16-Bit** (`art/r61/create_voxel.py`, Voxel aus Pixelkarten): Kandelaber auf der Fahrbahn zerspringen beim
Durchfahren in Pixelwuerfel und geben ein Item (Pixel-Herz steigt auf, 8-Bit-Klang), Pixel-Fledermaeuse, Gespenster,
Totenkopf-Saeulen, Buntglasfenster, Ruestungen, Zinnenmauern und ein grosser Pixel-Mond.

**Schildkroeten-Bucht und Eisstock-See mit eigenen Wahrzeichen** (`art/r61/create_bayice.py`): Schildkroetenpanzer-Insel mit
Palmen und Schiffswrack draussen in der Lagune, Riesen-Sandburgen, Rettungstuerme, springende Delfine; Eispalast am See,
Eisskulpturen (Masskrug, Brezn), Iglu-Dorf, gefrorene Wasserfaelle.

**Tsunami in der Schildkroeten-Bucht** (`tsunami.mjs`, Tests): bei 44 s Rennzeit heult die Sirene ("TSUNAMI-WARNUNG!"),
eine 26 m hohe Wellenwand mit Schaumkrone rollt vom Meer ueber die ganze Insel, das Wasser steigt und steht 22 s ueber der
Strecke - alle Karts fahren als Wave-Rider (5 % schneller, rutschiger, Gischt), danach laeuft das Wasser wieder ab. Die Phase
haengt an der Rennzeit, online sehen alle dasselbe.

**Zwei neue Items** (eigene Entwuerfe, `core.mjs` mit Tests): 🧨 **Boellerschuss** - fuers hintere Feld: eine eiserne
Boellerkugel mit Lunte umschliesst das Kart, 4,2 s geht es unverwundbar und 42 % schneller automatisch die Ideallinie
entlang, wer beruehrt wird, fliegt zur Seite. 🔷 **Blaue Brezn** - fliegt mit Fluegeln hoch ueber der Strecke zum
Fuehrenden (nie zum Werfer), stuerzt herab und trifft mit einer Druckwelle (7 m) auch die Nachbarn; das Mass Bier blockt.

**Feinschliff** - Menue hochkant (<= 420 px): Online-Knopf kompakt, kein Rollbalken; Geisterhaus-Looping findet wieder Platz;
Ladefehler (Figuren-Paket nach dem Kuh-Modell) behoben; Zeitklo loest ab 7,5 m aus. Werkzeuge: `art/lib/preview_glb.py`
(Blender-Vorschau), `art/r61/shots.mjs` (Standbilder aus kopflosem Chrome), `art/r61/wav_to_mp3.py`.

## Runde 60 (29.09.2026): Drei neue Strecken, Online-Lobby-Welt, Chat & Emojis, Wiesnland-Challenges, Ritter auf dem Drachen

**Drei neue Strecken** (Wunsch: eine Strandstrecke, ein zugefrorener See und eine gotische Goetterstadt im Abendlicht -
wie seit Runde 54 mit eigenen Namen und Entwuerfen; wer die Originalnamen will, aendert je Strecke nur `name:` in `courses`):
- **Schildkroeten-Bucht** - Brandungswellen rollen quer ueber die Strandpromenade und schieben Karts, die Sandbank-Abkuerzung
  laeuft mit der Flut voll (Ebbe/Flut-Schild, bei Flut langsam), Bootsfahrt durch die Lagune, Krabben, Palmen, Strandkoerbe,
  Leuchtturm, Meeresschildkroeten. Wetter: Delfine, Leuchtalgen.
- **Eisstock-See** - Glatteis (weniger Seitenhalt, Drift laedt schneller), riesige Eisstoecke gleiten quer, Eisbloecke
  zerspringen und wachsen nach, Eishoehle, Gletscherspalte, Halfpipe, Looping. Wetter: Diamantstaub, Lawine.
- **Riesendom** - durchs Kirchenschiff einer Kathedrale (Buntglas, Sonnen-Turbos), Riesenwaechter schlagen mit der
  Hellebarde quer ueber die Strasse (roter Warnstreifen, die ferne Spur bleibt frei), Strebebogen-Bruecke, Abgrund-Sprung ueber
  dem Wolkenmeer, Looping. Wetter: Lichtstrahlen, Tauben.
- Medaillenzeiten, je ein Erfolg (Gezeitenkenner, Eisstock-Koenig, Hellebarden-Taenzer), Menue mit elf Karten in zwei Reihen.
  Mechanik als reine Funktionen in `surface.mjs` (Tests). QA: 12er-Autopilot-Rennen 129,7 / 130 / 118,8 s ohne Fehler.

**Online: die Open World ist die Lobby** - Renn-Raeume und eigene Raeume starten in der **Lobby-Welt** (Wiesnland): alle fahren
zusammen, oben laeuft ein Zeitgeber, jedes Portal ist eine Stimme fuer die naechste Strecke. Danach faehrt der Raum gemeinsam
das Rennen und kehrt automatisch zurueck (nach dem letzten Menschen im Ziel, spaetestens 28 s nach dem ersten). In der
Lobby-Welt steht die **offene Kotzhuegel-Arena**: hineinfahren = drei Herzen, K.O.s zaehlen fuer den letzten Treffer.
Wer einem laufenden Rennen nicht mehr beitreten kann, kaempft bis zum naechsten Start im **Warte-Kampf** gegen Bots.
Der Online-Knopf zeigt, wie viele gerade online sind. Protokoll NET_VER 4.

**Chat und Emojis** (`chat.mjs`) - Text (gesaeubert, grobe Woerter maskiert, gedrosselt), 12 Emojis und 8 Schnellsprueche,
Sprechblasen ueber dem Kart, Verlauf im Spiel und im Online-Fenster. Taste **T** oeffnet den Chat, **1-6** schicken Emojis.

**Wiesnland-Challenges** (`challenge.mjs`, Anklang an die kleinen Aufgaben grosser Open-World-Rennspiele) - drei **Blitzer**
(Tempo am Punkt), zwei **Tempo-Zonen** (Schnitt ueber einen Abschnitt), zwei **Drift-Zonen** (Driftpunkte, jede Drift mit
Turbo-Ende erhoeht den Faktor bis x2) und zwei **Sprungschanzen** (Weite). Je bis zu drei Sterne, Bestwerte bleiben, neue
Sterne bringen XP, online meldet sich ein neuer Rekord im Chat. Das Wiesnland ist dafuer wieder als eigener Modus im Menue
(**🎡 Wiesnland** frei fahren, daneben **⚔ Kotzhügel Fight**); vier weitere Portale fuehren zum Graben-Flug und zu den neuen
Strecken.

**Ritter Kunz auf dem Drachen** - neuer Fahrer: gepanzerter Ritter mit Topfhelm, Waffenrock in Kartfarbe, zerfranstem Umhang
und Schwert auf dem Ruecken (eigener Entwurf). Neues Gefaehrt **Drache** (Kart-Stil): Reittier aus Dino und Drache mit
Knubbelnase, Kulleraugen, Stiefeln, Sattel, Hoernern, Rueckenzacken, Fledermausfluegeln und Pfeilschwanz - die Beine laufen
mit dem Tempo, die Fluegel schlagen in der Luft und beim Turbo, der Schwanz pendelt.

QA: 183 Tests; Autopilot-Rennen mit Ritter und Drache (Eisstock-See, Pilz-Promenade) ohne Fehler; Zwei-Browser-Online-Test
mit lokalem Test-Relay (Lobby, Chat, Abstimmung, Rennen, Rueckkehr, Arena-Herzen); Challenge-Probe (alle neun ausloesbar).

## Runde 59 (29.09.2026): Graben-Hindernisse, Kuehe ohne Haengenbleiben, huebschere Almkuh, Zeitklo & Tentakel, groessere Lenktasten

**Graben-Flug spielerisch abwechslungsreicher** - im Graben nach dem Sturzflug jetzt eine Hindernisfolge: Sperrwaende
mit Luecke (Slalom links/rechts/mitte), wandernde Schleusentore (Timing), Laservorhaenge im Takt mit orange blinkender
Vorwarnung und als Finale ein kleiner leuchtender Abluftschacht - genau hindurch gibt es "VOLLTREFFER!" mit grossem
Turbo. Treffer bremsen (Spieler staerker als Bots), Waende und Tore schieben zur Luecke; die KI zielt auf die
vorausberechnete Luecke und aufs Finale; Windringe liegen nicht mehr in Hindernissen. Zeitfahren (Autopilot) 90,9 s.

**Kotzhügel-Arena belebter** - vier Tribuenen mit Publikum schraeg rund um den Strohballen-Ring (die Fans huepfen,
solange gekaempft wird), drei Wiesn-Buden und ein Kranz weiss-blauer Fahnen auf dem Ring; die deko-freie Zone um die Arena
ist groesser, damit keine Baeume in den Tribuenen stehen.
QA: 12er-Autopilot-Rennen auf allen 8 Strecken ohne Fehler (die "haengenden" Canyon-Bots im Protokoll waren ein
Messartefakt: nach dem Zieleinlauf des Spielers stoppt das Spiel die Bots mitten im 10-s-Messfenster).

**Kuehe auf der Pilz-Promenade** - man blieb an ihnen haengen: Zusammenstoss stiess zurueck und betaeubte (Tempo 5 m/s),
die Kuh lief weiter in einen hinein. Jetzt nur ein Streifer (Tempo -28 %), danach 1,2 s Durchfahrt, die Kuh flieht an den
Rand; Kuehe grasen meist am Rand und queren selten und zuegig. Neues Modell (`art/r59/create_cow.py`): Fleckvieh mit
Kulleraugen und Wimpern, Almabtrieb-Blumenkranz, geschwungene Hoerner, grosse Messingglocke am bestickten Halsband
(bimmelt beim Vorbeifahren), Euter, wedelnder Schwanz.

**Easter Eggs** (Anklang an klassische Zeitreise-Adventures, eigene Entwuerfe ohne Figuren oder Namen): blaue Zeitklos mit
Mondsichel-Tuer (`art/r59/create_eggs.py`) - wer vorbeifaehrt, dem springt die Tuer auf, gruener Blitz, kleiner
Zeitsprung-Turbo; lila und gruene Tentakel aus Gullydeckeln, die hochschnellen, wenn ein Kart kommt; Warnschilder
"ACHTUNG TENTAKEL!". Auf der Pilz-Promenade und im Geisterhaus.

**Handy hochkant, Zwei-Tasten-Lenkung** - Lenktasten hoeher (22 % der Bildhoehe), die linke breiter mit unsichtbarer
Trefferzone bis zum Rand und nach oben; Gas und Bremse ragten rechts aus dem Bild (jetzt passt alles in die Breite).

## Runde 58 (29.09.2026): Jederzeit online einsteigen, Angriffs-Items in der Arena, Oberflaechenflug

**Laufenden Online-Sitzungen jederzeit beitreten** - auch Rennen: der Neue uebernimmt das Kart eines Bots mitten im
Rennen samt Lage, Runde und Rennzeit (kein eigener Countdown), Kotzhügel Fight und Freifahrt wie bisher. Ist der Bot
schon im Ziel, faehrt der Neue das naechste Rennen. Die Raumliste zeigt "laeuft – sofort einsteigen".

**Kotzhügel Fight nur mit Angriffs-Items** - Such-Brezn, Pilzbombe, Banane (Falle) und Riesenwuchs; kein Turbo, kein
Mass Bier.

**Graben-Flug: erst ueber die Oberflaeche** (`elem.mjs`, Flugplan mit Hoehenabschnitt) - nach dem Start steigt man auf
42 m und fliegt rund 200 m ueber die gedeckelte Stationsoberflaeche zwischen Tuermen und Geschuetzen, dann oeffnet sich
der Graben (Leuchtband an der Kante) und es geht im Sturzflug hinein. Der Graben liegt dafuer am normalen Flugprofil
statt am Hoehenflug (vorher stieg er mit jeder Flughoehe mit). Zeitfahren (Autopilot) 81,9 s, keine Fehler.

## Runde 57 (29.09.2026): 12er-Starterfeld, Online-Bestenliste, Festungs-Abwehr im Graben-Flug, Quetschn-Maß

**Sonnen-Canyon: geheime Forschungsanlage und Zeitsprung** (`art/r57/create_lab.py`, eigene Entwuerfe, nur Anklaenge an
80er/90er-Science-Fiction): Bunker im Felsen mit Panzertor, Warnstreifen und Schild "TESTLABOR 7 · SPERRZONE",
drehende Radarschuesseln, Testkammer-Silos mit gruen leuchtendem Kern, Kistenstapel, eine Hochbahn mit pendelndem
Einschienen-Wagen und ein Kleinstadt-Uhrturm (Zeiger auf 10:04). Wer mit 142 km/h ueber den Asphalt jagt, loest einen
Zeitsprung aus: Blitz, Donner und zwei brennende Reifenspuren.

**Geisterhaus: mehr Gothic-Schloss** (`art/r57/create_gothic2.py`): Ritterruestungen mit Hellebarde, Wasserspeier mit
gluehenden Augen, Ruinenwaende mit leuchtenden Buntglas-Spitzbogenfenstern, schmiedeeiserne Zaeune und hohe
Schlosstuerme mit roten Fenstern im Hintergrund.

**Online-Arena**: der Kotzhügel Fight laeuft online in derselben Arena; jeder Mensch startet jetzt auf seinem eigenen
Platz (vorher standen alle auf Startplatz 1, weil das eigene Kart lokal immer Nummer 0 ist).

**Fass-Kart als Standard** (`art/r56/create_kartbodies.py`, KB_Fass): Sepp in Lederhosn sitzt in einem bauchigen
Bierfass - vorn und hinten geschlossen, Cockpit-Ausschnitt in der Mitte, Daubenfugen, Reifen in Kartfarbe, weiss-blaue
Raute und Messing-Zapfhahn vorn, Bierschaum quillt aus dem Spundloch. Neuer Standard (einmalig auch fuer bestehende
Spielstaende), Keil/Tourer/Klassik bleiben waehlbar.

**Kotzhügel Fight ruckelfrei und groesser** - Karts und Kamera wurden weit neben der Strasse ueber die zugeordnete
Streckenstelle ins Bild gesetzt (mit bis zu 300 m Querversatz): Rollzonen, Steilkurven und die See-Tauchspirale
verzerrten dort Lage, Neigung und Kamera, Bots tauchten bis 338 m unter den Boden. Jetzt steht alles abseits der
Strasse an seiner echten Lage, die Arena hat festen Sandboden, und die Wand greift auch nach Rempeleien. Messung:
keine Hoehenspruenge mehr, alle Bots bleiben in der Arena. Arena groesser (Radius 85 statt 60 m, weiter suedlich), sechs
Fass-Stapel, sechs Strohballen-Waelle, 15 Itemboxen; Bots suchen Gegner im Umkreis von 130 m.

**Rampen vor Luecken ueber die ganze Breite** - auf der Pilz-Promenade fuhr man nach dem Looping am Rand an der
13 m breiten Rampe vorbei in den Wassergraben; Lueckenrampen decken jetzt Fahrbahn und Randstreifen ab (22,4 m).

**Graben-Flug mit Gegnern** (`art/r57/create_fortress.py`, eigene Entwuerfe): sechs Geschuetztuerme am Grabenrand
(Sockel mit weiss-blauem Rautenband, Drehkopf mit Doppelrohr) zielen auf den Spieler und feuern Festungs-Laser -
leuchtende Kugeln mit Schweif, die aus dem Turm in eine Flugspur einschwenken; ausweichen durch Lenken, im
Festungs-Alarm schneller. Zwei Staffeln Brezn-Jaeger (Stahlkapsel mit rotem Auge, Fluegel in Brezenform mit Salz)
stuerzen sich vorn in den Graben, feuern entgegen und ziehen ueber den Spieler hinweg hoch. Treffer kosten Tempo, aber
keine Betaeubung (die deckelte im Flug auf 5 m/s); Bots werden nur leicht gebremst und weichen aus, damit sich das
12er-Feld im engen Graben nicht staut. Kommt das Modell erst waehrend des Rennens an, werden Tuerme und Jaeger
nachgeruestet. Pruefung: Zeitfahren (Autopilot) 89 s statt 84 s ohne Gegner, Rennen ohne Fehler.

**Online-Bestenliste ohne eigenen Server** (`lb.mjs`) - Weltrangliste je Strecke fuers Zeitfahren und "Online-Siege"
(nur Siege gegen mindestens einen anderen Menschen). Eintraege sind signierte Nostr-App-Daten (NIP-78, Kind 30078)
auf sechs oeffentlichen Relays; signiert wird mit dem noble-secp256k1 aus dem schon eingebundenen Trystero, der
Schluessel bleibt im Browser, je Spieler und Liste zaehlt ein ersetzbarer Eintrag. Eingetragen wird nur auf Knopfdruck
(Name und Wert sind danach oeffentlich), Zeiten unter 70 % der Gold-Medaille werden verworfen, fremde Namen nur als
Text angezeigt. Zu sehen im Zeitfahr-Ergebnis (mit Namensfeld) und im Online-Fenster (Auswahl der Liste).
Fix: Tippen in Eingabefeldern steuert nicht mehr das Kart (Leerzeichen im Namen, P pausierte, Enter startete).
Fix: Online-Fenster auf dem Handy hochkant war 500 px breit (Beitreten-Knoepfe abgeschnitten) - passt sich jetzt an.
Handy hochkant (automatischer Ueberlauf-Test aller Bildschirme bei 390 px): Modi als 2x2-Raster (Zeitfahren war
abgeschnitten), Lenkhilfe und Grafik je eine volle Zeile (Sparsam ragte hinaus), Kampf-Anzeige einzeilig oben links statt
vierzeilig gequetscht; der Kotzhügel-Kasten blieb nach dem Kampf im Menue stehen und verdeckte den Titel (behoben).

**12 Karts pro Rennen** - Einzelrennen, Grand Prix und Online-Rennen starten mit 12 Karts in Dreierreihen (gleiche
Tiefe wie vorher 8 in Zweierreihen, der Spieler auf Startplatz 8). Vier neue Bots: Hias, Kathi, Wastl und Zenzi.
Grand-Prix-Punkte fuer 12 (15-12-10-9-...-1), fuer 8 wie bisher. Kotzhügel Fight bleibt bei 8, ebenso Grafik "Niedrig"
(Handys automatisch). Online traegt das Setup die Feldgroesse, Bots auf den Plaetzen 8-11 faehrt der Host
(Protokoll-Version 3). Positionsanzeige "x / 12", Ranglisten bei 12 Zeilen enger.
Pruefung (`art/r57/field12.mjs`): Autopilot-Rennen auf allen 8 Strecken mit 12 und 8 Karts - alle Startplaetze auf der
Fahrbahn (mind. 4,8 m Abstand), keine Fehler, Rechenzeit je Schritt rund 20 % ueber dem 8er-Feld.

**Maß-Bier-Musik** - die Wiesn-Polka des Maß-Items klingt jetzt nach Quetschn: zweite Melodiestimme 9 Cent hoeher
(Akkordeon-Schwebung) und eine leise Tuba-Stimme eine Oktave tiefer (`art/r44/make_chiptune.mjs`).

## Runde 56 (29.09.2026): Kotzhügel Fight, offene Räume, Graben-Flug, Wiesn-Fahrer, Keilflitzer

**Suppa Lederhosn Karts** - neuer Titel, Start-Ansage "O'ZAPFT IS!", neues Titelbild (Blender, `art/r56/create_keyart.py`:
Festwiese mit Wiesn-Tor, Riesenrad, Buden, Karts im Abendlicht) fuer Ladebildschirm (quer und hochkant) und Vorschau.
Ladebildschirm als helle Karte mit weiss-blauen Rauten und animiertem Rauten-Balken.

**Kotzhügel Fight** (die Open World): Arena auf der Wiese suedlich des Pilzbergs - Festplatz, Strohballen-Ring, Schild,
Fass-Deckungen, zehn Itemboxen. Jedes Kart hat drei Lebkuchenherzen, schwere Treffer kosten eins, wer keine mehr hat,
schaut zu; Sieg fuer den Letzten mit Herzen (nach 3 Minuten: die meisten). Im Einzelspieler gegen sieben Bots mit
Jagd-KI (steuert frei auf Gegner und Itemboxen, setzt Items gezielt), online genauso. In der Arena fliegen Brezn
zielsuchend frei durch den Raum, Bomben im Bogen.

**Online ohne Codes** - feste offene Raeume (Kotzhügel Fight 1/2, Rennen Flott/Wild) mit Belegung x/8 und Ping zum Host
(Lobby-Kanal, Ping per WebRTC). Leerer Raum: nach 12 s geht es mit Bots los, Nachzuegler uebernehmen das Kart eines
Bots; Renn-Raeume starten das naechste Rennen automatisch mit wechselnder Strecke. Eigene Raeume mit Code gibt es weiter.

**Graben-Flug** (8. Strecke): reine Flugstrecke durch den Stahlgraben einer Weltraum-Festung - 24 m hohe Stahlwaende mit
Lichtern, Stahlboden, oben die Stationsoberflaeche mit Tuermen und Geschuetzen, Ringe, Runden-Ereignis "Festungs-Alarm".

**Neue Fahrer** (`art/r56/create_drivers.py`): Sepp in Lederhosn, Vroni im Dirndl, Lebi das Lebkuchenherz und
Braumeister Finster (dunkle Tracht mit Umhang, gluehender Krug - eigene Figur, keine Anlehnung an Filmfiguren).
**Karosserien** (`art/r56/create_kartbodies.py`): Keilflitzer (Standard, flacher Supersportwagen-Keil) und Tourenwagen
(kantige 80er-Form, Doppel-Scheinwerfer, Lamellengrill) - eigene Entwuerfe ohne Marken-Merkmale; "Klassik" bleibt waehlbar.

**Wiesn-Umbau** - Bierstraße (Fahrbahn aus Bier mit Blaeschen und Schaumrand) statt Sternenglas, Stampfer als Riesen-Masskrug
mit Smiley, Item "Mass Bier" statt Schild, Wiesnland voller (Buden, Karussells, Festzelte, Maibaeume, Wimpelketten).

**Fixes** - keine Ruecksetzer mehr weit neben der Strasse im Wiesnland (Luftfuehrung, Kuppen, Looping-, Rollzonen-,
Element- und Magnetfuehrung wirken nur noch auf der Strasse), hellere Naechte (Wueste nachts zusaetzlich), Handy hochkant:
groessere Lenkknoepfe, Item-Knopf in Daumennaehe.

## Runde 55 (28.09.2026): Online mit Freunden, Lenkhilfe in drei Stufen, saubere Runden

**Online-Modus (Peer-to-Peer, ohne Server und Anmeldung)** - Knopf "🌐 Online" im Menue: Raum erstellen (5-stelliger
Code, "Link teilen" schickt `?room=CODE`) oder mit Code beitreten. Bis zu 8 Karts: Menschen plus Bots auf den freien
Plaetzen. Der Host waehlt **Wiesnland** (frei fahren, Missionen) oder ein **Rennen** (Strecke, Klasse) und startet fuer
alle; im Wiesnland startet ein Portal beim Host gleich ein gemeinsames Rennen. Technik: WebRTC ueber
`vendor/trystero.mjs` (Trystero 0.25.4, MIT; oeffentliche Nostr-Relays vermitteln nur den Verbindungsaufbau), reine
Protokoll-Logik in `net.mjs` (Tests `net.test.mjs`):
- Jeder Browser faehrt sein eigenes Kart, der Host die Bots; Zustand ~15-mal pro Sekunde als kurzes Zahlen-Array,
  Empfaenger zeigen fremde Karts 110 ms verzoegert und interpoliert (Richtung auf dem kurzen Weg, kurze Fortschreibung).
- Jeder Browser sieht sich als Fahrer 0 (eigener und globaler Platz 0 werden getauscht), gleiche Startaufstellung,
  gleiches Wetter (Host schickt den Wetter-Seed), Start erst, wenn alle ihre Strecke gebaut haben.
- Items wirken beim Besitzer: der Werfer meldet Brezn, Bombe, Banane, Gewitterwolke, Tinte; jeder Browser spielt den
  Wurf nach, getroffen wird nur, wer im eigenen Browser gefahren wird (getestet: Gewitterwolke schrumpft den Gast).
- Namensschilder ueber Mitspielern, Namen werden gefiltert (nur Buchstaben/Ziffern, 12 Zeichen); nur der Besitzer eines
  Karts darf dessen Zustand melden. Wer geht, wird vom Host durch einen Bot ersetzt; geht der Host, faehrt man allein weiter.
- Playwright-Test mit zwei Browser-Fenstern: Beitritt ~15 s, Wiesnland und Neon-Pilzwald gemeinsam gefahren.

**Mehr Koennen, mehr Belohnung** - Die Lenkhilfe war bisher standardmaessig an und hat Kurven mitgelenkt und vor Ecken
gebremst: man musste fast nur Gas geben. Jetzt drei Stufen: **Aus** (Standard am Rechner, +25 % XP), **Leicht**
(Standard auf Touch-Geraeten, faengt nur am Fahrbahnrand ab, +10 % XP) und **Voll** (wie bisher, ohne Bonus).
**Saubere Runde** (kein Gras, keine Leitplanke/Wand, kein Absturz): "SAUBER ✓" in der Rundenanzeige, +20 XP je Runde,
Anzeige im Ergebnis. Neue Erfolge **Freihändig** (Sieg ohne Lenkhilfe), **Blitzsauber** (drei saubere Runden) und
**Wiesn-Legende** (Sieg in Wild ohne Lenkhilfe). KI in Locker und Flott etwas schneller (`CLASSES` in `core.mjs`).
Messung mit `art/r55/difficulty.mjs` (Autopilot = guter Spieler ohne Lenkhilfe): Locker Sieg mit 100-370 m Vorsprung,
Flott Platz 2-3 knapp hinter dem Rivalen (2-3 s), Wild Platz 7-8.

**Wiesnland im Vordergrund** - der Modus-Knopf hat jetzt einen eigenen Look (gruen, Riesenrad), online ist
Wiesnland die Voreinstellung. Beim Beitreten zeigt die Lobby, dass die Suche bis zu 20 s dauern kann.

**Kleinigkeiten** - Lebkuchenherz-Muenze und Glocke leuchteten noch blau (altes Material-Leuchten aus R41 blieb beim
Wiederverwenden in Blender erhalten; `blib.material` setzt das Leuchten jetzt zurueck, `ow.glb` neu exportiert).

## Runde 54 (28.09.2026): Wiesn Kart - eigene Marke, eigene Figuren, ruhige KI-Karts

**Neuer Name "Wiesn Kart"** - Titel, Logo (Brezn), Ladekarte, Startbogen ("WIESN KART"), Seitentitel und Vorschau-Texte.
Das Menue traegt weiss-blaue Rauten statt Zielflaggen-Karos, Farben in Bayern-Blau, Festzelt-Rot und Bier-Gold.
Die Open World heisst jetzt **Wiesnland**.

**Alles, was an fremde Spiele erinnerte, ist neu gestaltet oder umbenannt** (eigene Entwuerfe, Blender-MCP):
- **Hau-den-Lukas-Hammer** statt Stampf-Block mit Gesicht: Holzklotz mit Eisenbaendern und Messingplakette am Stiel
  (`art/r54/create_hazards.py`, `assets/hazards.glb`). Auf der Lava-Feste und im Weltall passend eingefaerbt.
- **Bierfaesser mit Fliegenfallen** statt gruener Roehren mit Schnapp-Pflanzen; die befahrbare Einfahrt ist ein
  riesiger Fassring. **Bayerischer Steinloewe** (spuckt Feuerbaelle) statt Drachen-Buste, **Roehrenkanone** mit
  gluehender Kanonenkugel statt Geschoss mit Gesicht.
- **Bettlaken-Gespenst mit Laterne** (`assets/ghost.glb`, Wellensaum, Ovalaugen, keine Zunge).
- **Glockenschalter** (Messingglocke auf Holzsockel) statt Druckschalter, dazu **Lebkuchenherz-Muenzen** mit
  Zuckerguss-Rand (`art/r54/create_safe_props.py`, `assets/ow.glb`).
- **Such-Brezn** statt Panzer (`assets/shell.glb`, Brezel mit Salzkoernern, eigenes Symbol im Item-Fenster),
  **Herzschild** (Lebkuchenherz-Symbol) statt Stern, **Riesenwuchs** statt Riesenpilz.
- **Wiesn-Zauberer** statt Brillen-Zauberer: moosgruene Kutte mit goldenen Sternen, Filzhut mit Feder, weisser Bart,
  Knollennase, Knorrenstab mit Irrlicht; er wirft **Sporenkugel, Funkenstern und Ahornblatt** (`create_gothic.py`).
- **Sternenbahn** (frueher Sternenbahn): tiefblaues Sternenglas mit Milchstrassen-Band und funkelnden Sternen statt
  Regenbogen-Farbband, Randsteine weiss-gold.
- **Drift-Turbos in Funken, Glut und Blitz** (gold, orange, eisblau) statt Mini/Super/Ultra in blau-rot-lila.
- **Klassen Locker, Flott, Wild** statt Hubraum-Angaben (intern weiter 50/100/150, Bestzeiten bleiben erhalten).
- **Pilzi in Tracht:** gruene Weste und rotes Halstuch (statt blau-gelb). neue KI-Fahrerin **Resi**.
- **Wiesn-Polka** als Schild-Melodie (`art/r44/make_chiptune.mjs`) statt der alten Stern-Schleife.
- Die Sprachansagen "Schild" und "Willkommen" (alter Name) sind stumm, bis neue Aufnahmen da sind.
- Code: `kamek.mjs` heisst `wizard.mjs` (Tests `wizard.test.mjs`), alle Vergleiche mit fremden Spielen aus Kommentaren
  und README entfernt.

**KI-Karts ruckeln nicht mehr im Pulk (Teil 1)** - Kollisions-Korrekturen werden im Bild als Versatz aufgefangen und
klingen in ~0,1 s ab, KI-Lenkung leicht geglaettet, Abstands-Entscheidung mit 0,7 s Hysterese. Gier-Wackler frei
0,6 % -> 0,1-0,3 %, im Kontakt ~0 %.

## Runde 53 (28.09.2026): Neuschwanstein zum Durchfahren, Pilz-Wiesn, Gothic-Geisterhaus mit Besen-Zauberer, Kart-Glanz, Minimal-HUD, Strecken-Ereignisse

**Neuschwanstein befahrbar (Pilz-Promenade)** - `assets/schloss.glb` aus `art/r53/create_schloss.py` (Blender-MCP, eigener
Entwurf im Neuschwanstein-Stil, 18 300 Dreiecke): Die Strasse fuehrt durch den roten Backstein-**Torbau** (flacher Bogen,
Zinnen, Ecktuermchen, hochgezogenes Fallgitter, Laternen), durch den offenen **Innenhof** (Arkaden, Wehrgang, blau-weisse
Fahnen, Viereckturm mit 36 m und Pyramidendach, Kemenate, Ritterhaus) und unter dem **Palas** hindurch (Durchfahrt mit
Bogenrippen und Laternen, drei Fensterreihen, Saengerbalkon, steiles Schieferdach, Rundtuerme mit goldenen Spitzen,
Treppenturm 40 m). Das Schloss steht auf einem Felssockel aus den Blender-Felsen des Spiels. Es ersetzt das Kulissenschloss
am Inselrand; der Holztunnel sitzt dahinter (kuerzer), die Roehren-Pflanzen stehen hinter dem Schloss.
Durchfahrt innen 21 m breit, Kollider erst ab 10,7 m neben der Mitte - Autopilot-Test: alle 8 Karts fahren ohne Anstossen durch.

**Pilz-Wiesn (Neon-Pilzwald als Oktoberfest)** - `assets/wiesn.glb` (`create_wiesn.py`): **Wiesn-Tor** zum Durchfahren
gleich nach dem Start (blau-weiss gewundene Pfosten, Rautenmuster, Gluehbirnenkette, Schild "PILZ-WIESN", Riesenbrezeln,
Lebkuchenherz), drei drehende **Kettenkarussells**, **Wiesn-Buden** mit Lebkuchenherzen, **Masskrug-Leuchtschilder**,
Bierfass-Pyramiden, Biertische, ein zweites Festzelt "PILZBRAEU", blau-weisse **Wimpelketten** quer ueber die Strasse und
das Riesenrad der Kirmes. Alles nur an freien Stellen (keine Zone, Rollzone, Tunnel, Bruecke oder anderer Streckenteil).

**Gothic-Geisterhaus und Besen-Zauberer** - `assets/gothic.glb` (`create_gothic.py`, eigene Entwuerfe in
Gothic-Horror-Stimmung): gotisches **Uhrturm-Tor** zum Durchfahren (Spitzbogen, Rosettenfenster aus
Buntglas, Turmuhr, Fialen, Wasserspeier), 18 eiserne **Kandelaber** mit flackernden Kerzen, **Ruinenmauern** mit
Buntglasfenstern, Saerge, **Fledermaus-Schwaerme** (Fluegel schlagen). Dazu der **Besen-Zauberer** (seit R54 als Wiesn-Zauberer
neu gestaltet, Reisigbesen): Im Abschnitt Zielgerade bis Gruft fliegt er vor dem
Spieler her und wirft alle 2,6-3,8 s Zauber-Formen (Ring, Quadrat, Dreieck) auf die Strasse - Wurfbahn als Bogen, gelandet
bleiben sie 3,2 s liegen; wer hineinfaehrt, dreht sich ("VERZAUBERT!", eine Spore weg), Schild schuetzt, Spruenge
fliegen darueber. Nie in Tunnel, Looping, Rollzone, Achterbahn oder Luecke. Logik in `kamek.mjs` (6 Unit-Tests).

**Kart- und Fahrer-Glanz** - Karts und Fahrer spiegeln ein Studio-Licht (PMREM aus Softboxen und Himmelsverlauf):
Karosserie mit Klarlack (MeshPhysical), Chrom-Felgen, Gold, Glas; dazu ein Cartoon-Randlicht in der Himmelsfarbe der
Strecke. Nur fuer Karts und Fahrer (die Welt bleibt matt), nachts gedaempfte Spiegelung und kraeftigeres Randlicht.
Im Leicht-Modus (Handy) unveraendert.

**Minimal-HUD ueberall** (Nutzerwunsch "ingame gui minimal"): Was in R52 nur hochkant galt, ist jetzt auf Desktop und quer
Standard - Platz klein oben links, Runde als Pille oben mittig, runder Pause-Knopf mit Item-Blase oben rechts,
Drift-Balken unten mittig, Windschatten als schmaler Balken. Zeit, Wetterleiste, Rivale, Karte, Tempo, Sporen,
Tastenhilfe, Marke, Ton- und Vollbild-Knopf mit "Anzeige: VOLL" im Pausemenue (jetzt auf allen Geraeten).

**Runden-Ereignisse je Strecke** (Nutzerhinweis "zu aehnlich ueber die Strecken"): Kein Ereignis gibt es mehr auf zwei
Strecken, und ab Runde 2 bekommt eine Runde mit 80 % eines (nicht zweimal dasselbe hintereinander):
Pilz-Promenade Ballonfestival, Alpengluehen, Regenbogen, Gluehwuermchen · Sonnen-Canyon UFO-Lift, Sonnenfinsternis ·
Magnet-Kirmes Feuerwerk, Luftballons · Pilz-Wiesn Himmelslaternen, Polarlicht · Geisterhaus Blutmond (roter Himmel und
Mond), Fledermaus-Schwarm, Irrlichter · Sternenbahn Sternschnuppen, Komet · Lava-Feste Vulkanausbruch (Lavabomben,
Beben, glutroter Horizont). weather.mjs +4 Tests (Exklusivitaet, Haeufigkeit, Passung, Himmelsfarben).

**Windschatten mit Ausscheren** (lokale R52-Arbeit, jetzt eingebunden): Hinter einem Kart laedt sich in 1,2 s der
Windschatten; ist er voll ("TURBO BEREIT"), heisst es seitlich ausscheren - das zuendet 1,05 s Turbo, danach 3 s
Abklingzeit. HUD-Balken, Luftrauschen, eigene Chiptune-Signale; KI schert automatisch aus. `draft.mjs` mit Tests.
Dazu Windfahnen aus Blender (`windsock.glb`) am Rand der ersten drei Strecken.

MCP-Einsatz: Blender-MCP (alle drei neuen Modellpakete in der offenen Blender-Sitzung, eigene Szenen, Vorschau per
Viewport-Screenshot), Playwright-MCP (Fahrtests und Bilder). 147/147 Tests.

**Nachschliff (Nutzerhinweise):**
- **Kein Zittern mehr beim Verkeilen:** Sanfte Beruehrungen (unter 4 m/s Relativtempo, z. B. Auffahren im Pulk) sind
  jetzt unelastisch - beide Karts fahren danach mit gleichem Normaltempo weiter, statt jedes Bild neu abzuprallen; nur
  harte Stoesse prallen wie bisher. Die KI beachtet erstmals andere Karts: langsameres Kart dicht voraus -> auf der
  freieren Seite vorbei, sonst dessen Tempo mitfahren; nebeneinander haelt sie 2,9 m Abstand. Messung mit festem
  Zeitschritt (20 s Autopilot-Start, alt live gegen neu): Kontakt-Bilder -65 % (Pilz-Promenade) bzw. -52 % (Kirmes),
  Ruck-Spitzen waehrend Kontakten -57 % bzw. -81 %. core.mjs +1 Test.
- **Wetter-/Ereignis-Leiste wieder sichtbar** - im Minimal-HUD klein unter der Runden-Pille (sie war mit ausgeblendet,
  dadurch wirkten die Runden-Ereignisse "weg").
- **Pilz-Promenade oefter mit Ereignis:** Regenbogen auch in einer Regenrunde am Tag (Sonne und Regen), Ereignis-Chance
  90 % - jetzt 78 % der Rennen mit Ereignis (vorher 58 %); der Regenbogen bleibt im Regen sichtbar.
- Liegende Zauber des Besen-Zauberers verschwinden beim Neustart und im Menue.
- **Ruecklichter:** Nachts, auf den dunklen Strecken, im Gewitter und im Tunnel gluehen alle Karts hinten rot (mit
  weichem Lichtschein); Brems- und Ruecklichter sitzen jetzt an der echten Heckkante (vorher steckten die Bremslichter
  im Blech) und auch die KI-Karts haben sie.
- **Drache leuchtet nachts** (Magnet-Kirmes): Schuppen, Stacheln, Bauch und Hoerner gluehen in ihrer Farbe, die Augen hell.
- **Kirmes bei Nacht heller:** warm-rosa Budenlicht im Umgebungslicht, bunter Fuelllicht-Schein, etwas mehr Belichtung.

## Runde 52 (27.09.2026): Halfpipes, Minimal-HUD hochkant und Layout-Feinschliff

**Halfpipes** (halfpipe.mjs, 9 Unit-Tests): U-foermige Abschnitte mit flachem Boden und Viertelkreis-Waenden
(5,5 m hoch, Beton mit Pfeilen hinauf, Metallkante, Plattform und Rueckwand). Wie Looping und Rollzone wird flach
gefahren: der Querversatz ist die Bogenlaenge ueber Boden und Wand, darueber geht es senkrecht in die Luft.
- **Fahren:** schraeg auf die Wand halten (ab ~15,6 m/s Quertempo reicht es bis zur Lippe) - die Schwerkraft zieht
  entlang des Querschnitts zurueck, die Nase folgt der Bahn. Ueber der Lippe fliegt man senkrecht hoch (hoechstens
  6 m) und faellt in die Pipe zurueck; in der Luft SHIFT = Trick. Wertung bei der Rueckkehr: "HALFPIPE-AIR 4,2 m!"
  mit kleinem Schub, gestandener Trick "HALFPIPE-TRICK" mit Trick-Turbo, ab 4,5 m auch eine Spore.
- In Ein- und Ausfahrt wachsen die Waende weich aus dem Boden (dort haelt die Kante wie eine Bande); ein Flug, der
  nicht mehr vor dem Ende landen wuerde, wird flacher. Wand und Flug drehen mit der Bahn mit - in einer Kurve trug
  es das Kart sonst nach aussen (bis 2,8 m zusaetzliche Hoehe).
- **Kamera** schaut in der Pipe die Bahn entlang und steht zur Mitte versetzt hoeher - folgte sie der Nase, stuende
  sie beim Herunterfahren hinter der Wand. **KI:** je nach Koennen nimmt ein Fahrer eine Wand, fliegt, dreht einen
  Trick und wechselt die Seite (im Test hoben 5-6 von 7 KI-Fahrern ab).
- **Platz:** eine Suche (hpFindSpot) nimmt die naechste gerade, freie Stelle - Tunnel, Bruecken, Loopings,
  Achterbahn, Seen, Gefahren am Rand, Portale und Glockenschalter bleiben draussen; normale Schanzen und Sprungpilze
  duerfen in der Pipe liegen. Platz fand sich auf der **Magnet-Kirmes** (Startgerade, mit der ersten Schanze in der
  Pipe) und zweimal im **Wiesnland**; die anderen Strecken sind lueckenlos belegt (laengstes freies Stueck ~70 m).
- Neuer Erfolg "Halfpipe-Held" (3 Halfpipe-Tricks in einem Rennen) - jetzt 33. Autopilot-Rennen Kirmes und
  Wiesnland ohne Sturz und ohne Fehler; 120/120 Tests.

**Wiesnland frei fahren (Nutzerhinweis "staendig falsche Richtung und zurueckgesetzt"):**
- Keine "FALSCHE RICHTUNG"-Anzeige mehr im Wiesnland - dort gibt es keine Fahrtrichtung.
- Wer an Baum, Fels oder Wall haengen bleibt, wird nicht mehr per Rettungspilz auf die Strasse gesetzt: das Kart
  setzt 2,6 m zurueck und wendet ("↺ GEWENDET"), man faehrt dort weiter, wo man war.
- Kurze Leitplanken-Stummel vor und hinter den Loopings (je 24 m, aus der Deko-Sperrzone) entfallen in der offenen
  Welt - dort blieb man an ihnen haengen. Am Erdwall der Halfpipe gleitet man ab statt stehen zu bleiben.
- Test: 10 freie Fahrten ueber die Wiese in alle Richtungen - vorher 6 Ruecksetzer, jetzt keiner.
- Pause quer zweispaltig: alle sechs Knoepfe ohne Rollen sichtbar (640x360 zeigte vorher nur die Haelfte).

**Nachschliff (Teil 4):**
- **Fehler behoben - Strecken-Cache:** vorgebaute Strecken werden aus einem Cache geladen; dabei fehlten die neuen
  Halfpipe-Zonen, die Randstreifen-Tabelle (wo die Auslaufzone als Fahrbahn zaehlt) und die Weltgroesse. Nach Kirmes
  oder Wiesnland hatte die Pilz-Promenade unsichtbare Halfpipe-Zonen (Kart fiel auf 17 km/h), nach dem Vorbauen im
  Menue galt der Randstreifen der zuletzt gebauten Strecke. Ein Test prueft jetzt, dass jede in buildWorld gesetzte
  Variable mit in den Cache geht.
- **Halfpipe:** eine Reihe Sporen schwebt 2,4 m ueber jeder Lippe - wer abhebt, sammelt auf dem Weg hinauf und
  hinunter (im Test 3 je Air). Funken von der Metallkante beim Absprung, Aufsetz-Geraeusch, Absprung-Sound auch fuer
  KI in der Naehe; auf der Minikarte ein eigenes rosa Band; keine Reifenspuren mehr hinter der Pipe im Gras.
- Bei den ersten drei Einfahrten ein Hinweis ("HALFPIPE! Schraeg hochfahren"), im Ergebnis eine Kachel
  "Halfpipe · Airs · Tricks" mit der hoechsten Flughoehe.
- **Erdwall:** aussen liegt jetzt eine Grasboeschung bis 25,5 m neben der Mitte (statt senkrechter Rueckwand). Wer im
  Wiesnland ueber die Wiese seitlich heranfaehrt, wird als "draussen" eingestuft und vom Wall ferngehalten - vorher
  haette die Pipe seinen grossen Querversatz als Flughoehe gelesen und ihn ueber die Lippe gesetzt (geprueft:
  parallel und schraeg von beiden Seiten, niemand kommt naeher als 26 m, keiner hebt ab).
- Bananen, die man auf der Halfpipe-Wand fallen laesst, liegen an der Wand (vorher im Gras hinter der Pipe).
- **Bildblitz** hoechstens halbweiss (Gewitterwolken-Treffer war 70 %); mit "Bewegung reduzieren" im System nur ein
  Viertel davon, ebenso Blitz-Aufhellung und Kamerawackeln.
- **Siegerehrung:** "ERFOLG: Grand-Prix-Sieger" lag hinter der Ergebniskarte - jetzt darueber im freien Bereich.
- **Menue quer:** die Garage-Zeilen verteilen sich ueber die ganze Hoehe (kein leerer Streifen mehr).

**Minimal-HUD hochkant** (Handy, Nutzerwunsch "Anzeige im Rennen zu voll"): im Rennen stehen nur noch Platz (oben
links, kompakt), Runde als kleine Pille (🏁 1/3), Pause-Knopf, Item-Blase darunter, Einblendungen und ein duenner
Drift-Balken unten. Zeit, Wetterleiste, Rivalen-Schild, Sporen, Tempo, Minikarte sowie Ton-, Vollbild- und
Marken-Knopf entfallen; das Zeitfahren behaelt Zeit und Geist, im Wiesnland bleibt die Missionstafel (kleiner).
Standard ist MINIMAL - wer alles sehen will, schaltet im Pausemenue "Anzeige hochkant: VOLL" (wird gespeichert).
Quer und am Desktop bleibt die Anzeige wie bisher.

### Layout-Feinschliff auf allen Bildschirmen

Gemessen statt geschaetzt: ein Pruefskript legt Menue und Renn-HUD auf 15 Groessen (Handy hochkant 360-412 px,
quer 640-915 px, Tablet, Laptop 1024-1920 px) und meldet jedes Element, das aus seinem Kasten ragt, abgeschnitten
ist oder ein anderes ueberdeckt - vorher 30 Funde, jetzt keiner.
- Pruefskript: art/r52/layout_check.mjs (`RACE=1` misst zusaetzlich das HUD).
- **Menue quer (Handy):** die Garage steht jetzt als Zeilen "Etikett | Auswahl" - vorher liefen Kart-Farben und
  "Sparsam" in die Tagesaufgabe, "Hochkant: Ein-Hand" schob sich unter "Los geht's" (quer jetzt "📱 Ein-Hand"),
  "Geisterhaus" und "Regenbogen-" wurden in den Karten abgeschnitten.
- **Modus-Knoepfe:** Breite nach Inhalt - "Zeitfahren" war hochkant abgeschnitten, "Grand Prix" brach auf Tablet
  und Laptop zweizeilig um. Auf 360 px bekommt "Grafik" eine eigene Zeile.
- **Einblendungen** (Turbo, Platz, Rivale ...) lagen auf Laptops mit 600-700 px Hoehe genau ueber Runde/Zeit; jetzt
  immer darunter, die grosse Mitteilung (RUNDE 2) darunter. Hochkant brachen sie immer zweizeilig um und
  ueberdeckten Platzanzeige und Rivalen-Schild: mit `left:50%` stand dem Text nur die halbe Schirmbreite zur
  Verfuegung - jetzt einzeilig unter Rivalen-Schild und Item-Blase.
- **Grand Prix hochkant:** der Kopfkasten (Runde · Zeit · GRAND PRIX) verdeckte die eigene Platzanzeige - dort
  jetzt "GP" und etwas kleinere Ziffern. **Zeitfahren hochkant:** vier Felder liefen links aus dem Bild, jetzt
  volle Breite. Geist, Medaillenzeit und GP-Zaehler in derselben Display-Schrift wie Runde/Zeit.
- **Touch quer:** "DRIFT · TRICK" und "BREMSE" passen in ihre runden Knoepfe, das Item-Symbol in seine Blase,
  die Tempoanzeige liegt auf kleinen Handys nicht mehr unter BREMSE. Item-Blase hochkant nicht mehr ueber Runde/Zeit.
- **Kerbe/Kamera-Loch (iPhone quer):** Kopfleiste, Platz, Rivale, Wiesnland-Tafel und Lenkknoepfe ruecken aus dem
  sicheren Bereich nicht mehr heraus (geprueft mit simulierten Safe-Area-Raendern).

## Runde 51 (26.09.2026): Tux als Fahrer, Drachen-Spirale, offeneres Wiesnland, Handy-Leistung

- **Tux, der Linux-Pinguin, faehrt mit** (fuenfte Figur, eigener Entwurf, art/r51/create_penguin.py ->
  assets/driver_penguin.glb): schwarzer Tropfenkoerper, weisser Bauch, gelber Schnabel und Plattfuesse, Flossen am
  Lenkrad, Rennschal mit wehenden Enden und Rennbrille auf der Stirn - Schal und Brillenband in der Teamfarbe.
  Kart "Kernel-Kufe": rutscht wie auf Eis (Grip 0,95), dafuer schnell (Tempo 1,05) und driftfreudig. Im Menue waehlbar,
  in jedem Rennen faehrt ein KI-Tux (Nori) mit.
- **Drachen-Spirale (Magnet-Kirmes):** die Kamera drehte in Achterbahn-Schrauben fest zu 40 % mit - nach einer vollen
  360-Grad-Schraube stand sie bei 144 Grad, also kopfueber unter der Bahn, bis die Zone endete. Jetzt laeuft sie
  verzoegert, aber ganz mit (in der Mitte weiter ~40 %) und steht am Ende jeder Schraube aufrecht ueber der Bahn.
- **Wiesnland offener:** keine Kurven- und Landeplanken mehr, die Lenkhilfe greift nur noch auf der Strasse (vorher
  zog sie das Kart aus 40 m Entfernung zurueck) - die Wiesen sind frei befahrbar. Portal-Schleier und Namensschilder
  blenden beim Heranfahren aus und verdecken die Strasse nicht mehr.
- **Handy-Leistung:** Modell-Materialien, die sowohl fuer instanzierte als auch fuer normale Meshes (oder mit
  wechselndem Schattenempfang) gezeichnet wurden, liessen three.js bei jedem Zeichenaufruf das Shader-Programm neu
  bewerten; instanzierte Nutzer bekommen jetzt eine feste Kopie, im Leicht-Modus empfangen alle Meshes einheitlich.
- 110/110 Tests; Autopilot-Rennen auf allen 7 Strecken ohne Fehler.
- **Update-Video** media/r51_tux_wetter.mp4 (48 s, Hochformat, mit Ton; klein: _small, 8,6 MB): Tux in der
  Frontkamera, Gewitter bei Nacht, UFO in der Daemmerung, Schnee mit Polarlicht, Sonnen-Turbos, Drachen-Spirale,
  offenes Wiesnland (art/r51/capture_frames.mjs -> prune_events.py -> edit_video_blender.py; Post-Texte in
  media/social-texte-r51.md). Der Test-Hook `rallyTest.step` fuehrt die Kamera jetzt bei jedem Physikschritt nach -
  vorher hing sie in Aufnahmen doppelt so weit hinter dem Kart wie im echten Spiel.

## Runde 50 (26.09.2026): Wetter und Tageszeit von Runde zu Runde, Controller, HUD-Feinschliff

**Wetter und Tageszeit wechseln von Runde zu Runde** (weather.mjs, 12 Unit-Tests): jedes Rennen bekommt einen
eigenen Wetterbericht - Runde 1 bleibt ruhig, danach wird es wechselhaft, die letzte Runde ist meist die
dramatischste (z. B. ☀ → 🌇🌧🛸 → 🌙⛈). Der Wechsel blendet an der Ziellinie ueber (kurz davor bis kurz danach),
beim Rundenwechsel kommt eine Ansage ("🛸 DAEMMERUNG · REGEN · UFO!"), unter Runde/Zeit steht der Bericht als
Symbolleiste mit der aktuellen Runde gross.
- **Tageszeiten:** Tag, Daemmerung (Abendrot, warmes Licht, naeherer Dunst), Nacht (Sterne, Mond, Scheinwerfer),
  Morgenrot. Die dunklen Strecken (Neon-Pilzwald, Geisterhaus, Sternenbahn, Lava-Feste) behalten ihre Stimmung
  und wechseln nur Wetter und Ereignisse; der Sonnen-Canyon kann in eine Wuestennacht kippen.
- **Wetter:** Wolken, Regen (Streifen im Shader, Gischt hinter den Karts, Rauschen), Gewitter (Blitze am Horizont
  mit Bildblitz und Donner mit Laufzeit, Windboeen, die alle Karts gleich seitlich schieben), Nebel, Schneegestoeber,
  Sandsturm (Canyon), Ascheregen (Lava-Feste). Nasse und verschneite Fahrbahn haelt etwas weniger (fuer alle gleich).
- **Ereignisse:** UFO mit Schwebe-Strahl - wer darunter faehrt, wird wie vom Sprungpilz angehoben (Trick moeglich),
  danach fliegt es vor dem Feld weiter; Regenbogen nach dem Regen, Polarlicht, Sternschnuppen, Gluehwuermchen in der
  Daemmerung, Sonnenfinsternis (Scheibe mit Korona, Scheinwerfer an).
- Licht, Himmel und Nebel werden aus dem Thema gemischt (reine Funktion `weatherLook`), Teilchen folgen der Kamera
  im Shader (keine CPU-Arbeit je Tropfen), alles wird mit der Strecke vorkompiliert - keine Shader-Kompilierung im
  Rennen. Tunnel und Unterwasser haben Vorrang. Zeitfahren und Wiesnland bleiben ruhig (faire Bestzeiten), in der
  Pause abschaltbar ("Wetter: WECHSELHAFT / AUS"). Neue Erfolge "Nahbegegnung" (UFO-Lift) und "Wetterfest" (Sieg
  bei Gewitter, Schnee oder Sandsturm) - jetzt 32.

**Controller** (pad.mjs, 9 Unit-Tests; Gamepad-API mit Standard-Belegung, Xbox/PlayStation/Switch): Stick oder
Steuerkreuz lenken stufenlos (Totzone, sanfte Kurve), A/RT Gas, B/LT Bremse, LB/RB Hops und Drift (in der Luft Trick),
X/Y Item, START Pause, VIEW zuruecksetzen, im Wiesnland Y fuer das Portal. Im Menue: links/rechts Strecke,
hoch/runter Klasse, LB/RB Modus, A/START los, Y Erfolge. In Pause, Ergebnis und Siegerehrung waehlen hoch/runter
den Knopf (gelber Rahmen), A bestaetigt (kurz nach dem Zieleinlauf gesperrt), B geht zurueck. Rumpeln bei Treffern,
Turbos und harten Landungen. Die Hinweise (Tastenleiste, Item-Knopf, Drift-Anzeige) zeigen Controller-Tasten,
sobald er benutzt wird, und wechseln bei Tastatureingabe zurueck.

**Feinschliff:**
- Tempoanzeige mit Tinten-Kontur wie Runde/Zeit (war auf Wasser, Sand und heller Fahrbahn kaum lesbar), im Turbo tuerkis.
- Menue: "Stufe N" am Erfolge-Knopf war gelb auf gelb - jetzt dunkles Abzeichen; Kurzbeschreibungen der breiten
  Streckenkarten stehen linksbuendig unter dem Namen (waren mittig).
- Motorfilter blieb bei Hoechsttempo ueber der Nyquist-Grenze (Konsole voller Warnungen) - begrenzt.
- Pruefung: Autopilot-Rennen ueber alle sieben Strecken mit zufaelligem Wetter (alle kommen ins Ziel, keine Fehler),
  Bildvergleich Desktop, Handy hochkant und quer.

## Runde 49 (26.09.2026): Sonnen-Turbos im Tunnel

- Jeder Lichtfleck unter einer Deckenoeffnung ist jetzt ein **Sonnen-Turbo**: wer hindurchfaehrt, bekommt einen
  kurzen Schub (0,65 s, einmal je Durchfahrt) mit hellem Chiptune-Glockenlauf und Glitzern. Die Flecken liegen
  je nach Sonnenstand seitlich versetzt - im Tunnel lohnt sich die Linienwahl. Geschickte KI-Fahrer zielen darauf.
- Der Fleck folgt jetzt der Fahrbahn (kleines Gitter statt flacher Ebene, vorher teils unter dem Belag
  verschwunden) und zeigt Strahlen und drei Pfeile in Fahrtrichtung.
- Felsen auf dem Tunnelhuegel weiter nach aussen und kleiner - im Canyon ragten sie durch die Decke.
- Neuer Erfolg "Sonnenanbeter" (6 Sonnen-Turbos in einem Rennen).

## Runde 48 (26.09.2026): Riesenpilz-Marsch, Neon-Tunnel im Takt, KI weicht aus, Update-Video

- **Riesenpilz-Marsch:** solange das Kart gross ist, laeuft eine eigene Chiptune-Schleife (stampfender Marsch in
  a-Moll, 140 bpm, Bass-Stampfer auf jedem Schlag; art/r44/make_chiptune.mjs) statt der Schild-Melodie -
  der Riesenpilz setzt intern das Schild, dadurch lief vorher die falsche Musik.
- **Riesenpilz besser sichtbar:** die Kamera zieht kaum noch mit zurueck, das grosse Kart fuellt jetzt das Bild.
  KI-Fahrer weichen einem Riesenpilz dicht hinter ihnen zur Seite aus (je geschickter, desto frueher).
- **Tintlinge groesser** (1,45-fach), damit sie auch ueber weiter entfernten Karts lesbar sind.
- **Neon-Tunnel:** er liegt in einer Rollzone und hat deshalb keine Deckenoeffnungen - dafuer dichtere Leuchtrippen,
  die im Takt der Musik aufblitzen (Farbwechsel tuerkis -> pink auf jedem Schlag).
- **Update-Video** (art/r47/capture_frames.mjs, edit_video_blender.py): drei Tunnel mit Lichtschaechten,
  Riesenpilz, Tinte aus Sicht des Getroffenen (Kleckse auf dem Bild, Tintlinge ueber den Karts vorne),
  Spiegel-Modus; Post-Texte in media/social-texte-r47.md.

## Runde 47 (25.09.2026): Riesenpilz und Tintenpilz, laengere Tunnel mit Licht-Durchbruechen, Spiegel-Modus

**Zwei neue Items (core.mjs, eigene Entwuerfe):**
- **Riesenpilz:** 7 s lang waechst das Kart auf 1,75-fache Groesse und ist unverwundbar (ohne Schildblase),
  etwas schneller; wer gerammt wird, wird plattgedrueckt und weggeschoben. In der letzten Sekunde blinkt es
  zwischen gross und klein, die Kamera geht mit nach hinten. Fuer die hintere Haelfte des Feldes.
- **Tintenpilz:** alle, die vorne liegen, bekommen Tinte. Ueber ihnen ploppt ein Tintling auf (Schopftintling mit
  Comic-Augen, Blender: art/r45/create_inkcap.py, assets/inkcap.glb), wackelt und zerlaeuft. Trifft es den
  Spieler, kleben Tintenkleckse auf dem Bild und rutschen langsam ab (mit Turbo schneller weg); KI-Fahrer mit
  Tinte fahren eine flatternde Linie und gehen zwischendurch vom Gas. Das Herzschild haelt die Tinte ab.
- Beide mit gerenderten 3D-Vorschaubildern, KI-Einsatz und neuen Chiptune-Effekten (wachsen, schrumpfen,
  plattmachen, Tintenklatscher).

**Item-Feld im Spiel ueberarbeitet:** weisser Aussenring und Ring in Item-Farbe, rotierender Strahlenkranz
hinter dem Item, schwebendes Item, farbiges Namensschild, Roulette mit blinkendem Rahmen, Aufblitzen beim
Einsammeln.

**Schild der Rivalen verdeckt nicht mehr die Sicht:** nur noch ein duenner Randschimmer statt gefuellter Blase,
und je naeher an der Kamera, desto durchsichtiger.

**Tunnel neu (Blender: art/r45/create_tunnelkit.py, assets/tunnelkit.glb):**
- Laenger: Pilz-Promenade 78 m (vorher 53), Sonnen-Canyon 81 m (48), Neon-Pilzwald 86 m (46), Geisterhaus 79 m
  (43) - ohne Rampen, Loopings, Flug- oder Wasserzonen zu beruehren; zwei Tribuenen wurden dafuer verschoben.
- **Licht-Durchbrueche:** alle ~22 m eine Oeffnung in der Decke mit Lichtkegel (weich, nah an der Kamera
  durchsichtig), tanzendem Staub und Lichtfleck auf der Fahrbahn; Farbe je Stil (Sonne, Mondlicht in der Gruft).
  Ein Erdhuegel ueber dem Gewoelbe wirft Schatten - drinnen ist es wirklich dunkel, durch die Oeffnungen faellt
  Sonne. Im Leicht-Modus (ohne Schatten) dunkelt ein Streifen die Fahrbahn ab. In Rollzonen keine Oeffnungen.
- Portale je Stil statt flacher Boegen: hohler Baumstamm mit Pilzen und Baumpilzen, Sandstein-Bogen mit
  Schlussstein-Relief, Neon-Rahmen mit Leuchtroehren und Gluehbirnen, Gruftbogen mit leuchtendem Rundfenster,
  Laternen und Efeu, Roehrenmuendung.
- Wandmuster je Stil (Holzmaserung, Mauerwerk, Neonraster, Nieten, Lava-Risse), Rippen, Laternen mit Lichthof;
  die Felsbrocken, die innen durch die Wand stachen, liegen jetzt oben auf dem Huegel.

**Spiegel-Modus (ab Fahrerstufe 3):** Knopf neben den Klassen; das Bild ist seitenverkehrt (wie im grossen
Vorbild auch die Schilder), die Lenkung umgedreht - nicht im Zeitfahren und nicht im Wiesnland.

**Neue Erfolge:** Spiegelmeister, Riesenschritt (3 Karts plattgemacht), Tintenfisch (4 Fahrer mit einer Tinte) -
jetzt 29. Zusammengefuehrt mit Runde 45/46 einer parallelen Sitzung (Gewitterwolke, Rivale, Tagesaufgabe bleiben).

## Runde 46 (25.09.2026): Gewitterwolke, Rivale, Tagesaufgabe, Drift-Sound, Startnummern

**Neues Item Gewitterwolke:** Blitze aus dunklen Wolken treffen alle Karts vor dem Nutzer - kurzer Dreher,
Item weg, 4 s klein und langsamer (72 % Hoechsttempo). Kleine Karts werden von grossen plattgefahren
("PLATT GEFAHREN!" / "UEBERROLLT!"), der Herzschild blockt. Nur fuer die hintere Haelfte des Feldes
(Gewicht 0 bis Platz 5, dann steigend), die KI setzt sie sofort ein. Optik: Wolke und Zickzack-Blitz ueber jedem
getroffenen Kart in Sichtweite, Donner und Bildblitz; das Modell schrumpft sichtbar (Rennlogik in core.mjs,
`SHRINK_T`, `flattenSmall`, 2 Unit-Tests). Neuer Erfolg "Wettermacher" (4 Karts mit einer Wolke).

**Rivale je Rennen:** einer aus den ersten drei Startplaetzen, faehrt etwas besser als seine Klasse. Rotes
"RIVALE"-Schild ueber seinem Kart (waechst mit der Entfernung mit), im HUD "⚔ ▲ NAME" (rot: vor dir, gruen:
hinter dir), Ansage zum Start. Im Ergebnis "Rivale geschlagen" +25 XP und der Erfolg "Rivalen-Bezwinger".

**Tages-Herausforderung:** Karte ueber dem Startknopf - aus dem Datum folgen Strecke, Klasse und Aufgabe (Treppchen,
Sieg, 8 Drift-Turbos, ohne Treffer, 10 Muenzen, 4 Tricks, 8-mal ueberholen, Rivale schlagen), fuer alle gleich und
ohne Server. Antippen waehlt Modus, Strecke und Klasse. Geschafft: +60 XP einmal am Tag, Erfolg "Tagesheld",
die Karte zeigt "GESCHAFFT". Reine Funktionen in progress.mjs (3 Unit-Tests).

**Drift-Knistern:** waehrend des Drifts ein leises Chiptune-Trillern mit Funkenrauschen, das je Drift-Turbo-Stufe
eine Quinte hoeher und schneller wird und beim Stufenwechsel klickt - man hoert, wann Loslassen lohnt (Test in
audio.test.mjs). Dabei aufgefallen: Funkenfarbe und Anzeige nutzten andere Schwellen (0,7/1,4/2,3) als die echte
Turbo-Logik (0,55/1,15/1,9) - jetzt beide aus `miniTurbo()`.

**Schwindel-Sterne:** nach Dreher, Treffer oder Blitz kreisen drei gelbe Sterne ueber dem Kopf (eine instanzierte
Geometrie fuer alle Karts).

**Fahrer und Karts aufgehuebscht (art/r46/polish_karts.py, Anbauten per Strahltest auf die bestehenden Modelle):**
- Startnummern je Figur (Pilzi 7, Schildi 3, Volt 9, Mochi 5): Rundschild mit Goldrand auf der Haube und
  Nummernschild am Heck - im Rennen sieht man die Karts meist von hinten.
- Pilzi traegt eine Rennbrille: Gummiband, das der Hutform folgt, zwei Glaeser mit Goldrand auf der Krempe.
- Volt: das fast weisse Visier ueberstrahlte die LED-Augen - jetzt dunkles Glas, groessere leuchtende Augen,
  gluehende Antennenkugel.
Leicht-Fassungen neu (art/r44/make_lod.py fuer kartkit, driver, driver_robot), Sicherungen in art/r46/.

## Runde 45 (25.09.2026): Ein-Hand-Steuerung hochkant, neue Felsen, Stern-Melodie, Menue v6

**Ein-Hand-Steuerung (Handy hochkant, Standard):** keine Fahrknoepfe mehr - das ganze Bild ist eine Wischflaeche.
Ein Finger wischt links/rechts und lenkt stufenlos (der Nullpunkt wandert mit, wenn man ueber den vollen Ausschlag
hinaus wischt - Gegenlenken wirkt sofort), eine Schiene mit Knopf zeigt den Ausschlag. Gas gibt das Spiel selbst,
**Tippen = Bunny-Hop** (in der Luft = Trick), **weit wischen und kurz halten = Drift** (Loslassen gibt den Drift-Turbo,
voll zur Gegenseite gewischt loest den Drift und driftet andersherum weiter), **nach oben wischen = Item**. Ein
zweiter Finger kann ebenfalls tippen. Im Countdown zaehlt der aufgelegte Finger als Gas - bei der "1" auflegen gibt
den Raketenstart (ein schon frueher aufgelegter Daumen wuergt den Motor nicht ab). Die Item-Blase sitzt oben rechts (antippbar), eine Kurzanleitung erscheint in den ersten fuenf
Rennen ab dem Countdown. Tippen wird ueber die Ereignis-Zeitstempel erkannt, damit es auch bei ruckelnden Bildern
zaehlt. Umschalten im Menue und in der Pause ("Hochkant: Ein-Hand / Knoepfe"); quer bleiben die Knoepfe.

**Handy drehen machte alles winzig:** Beim Wechsel hochkant/quer zoomte der Browser heraus, weil Elemente breiter
als der Schirm waren (die drehenden Tempo-Streifen ragten 12 % ueber jeden Rand, im Menue liefen die Kartfarben
rechts hinaus). Jetzt: Viewport ohne Zoom (minimum/maximum-scale 1), `html` und `body` schneiden ab,
`text-size-adjust:100%`, Tempo-Streifen in einem Rahmen mit `overflow:hidden`, Einblendungen hoechstens schirmbreit.
Nach dem Drehen wird zweimal nachgemessen (150/500 ms) und ein trotzdem verbliebener Zoom per neu geschriebenem
Viewport-Tag auf 1 gesetzt.

**Felsen neu aus Blender (art/r45/create_rock.py, assets/rock.glb und assets/lo/rock.glb):** statt drei
20-Flaechen-Ikosaedern gemeisselte Brocken - verbeulte Kugel, ein schraeges Gipfelplateau und 9-13 Seitenschnitte
(alles jenseits einer Ebene wird auf sie projiziert), gleich ausgerichtete Dreiecke verschmolzen. Moospolster mit
Wulst auf dem Plateau, Kiesel am Fuss, Schattierung als Vertexfarbe (oben hell und warm, unten dunkler und kuehler,
Gesteinsschichten, Kontaktschatten). Materialnamen bleiben (StonePaint/MossPaint): Canyonrot mit Sandkappe,
Lavabasalt und Tunnelwaende faerben weiter ein. 929 Dreiecke, Leicht-Fassung 332. Gebaut mit dem bpy-Modul
(`pip install bpy==5.0.1`, laeuft ohne Blender-Installation).

**Schild-Melodie:** Solange der Herzschild haelt, laeuft eine eigene Chiptune-Schleife (art/r44/make_chiptune.mjs,
assets/audio/sfx/chip/star.wav, 4,8 s, 200 bpm): Akkorde C - As - B - C, Rechteck-Arpeggio mit NES-Echo, Gegenstimme,
Dreieck-Bass im Oktavsprung, Rausch-Schlagzeug; jede Note endet bei null, die Naht knackt nicht. Die Streckenmusik
tritt so lange auf 28 % zurueck, bei Ende oder abgewehrtem Treffer blendet die Schleife in 0,3 s aus. Test in
audio.test.mjs.

**Menue v6:** dunkle Kontur und feines Diagonalmuster am Panel, Abschnittsnamen als Tinten-Schilder, Fahrer, Kart,
Lenkhilfe und Grafik in einer "Garage"-Karte. Breit: Modus und Klasse in einer Zeile, vier Strecken je Reihe und die
letzte Reihe fuellt die Breite (keine Luecke mehr), die Grafikwahl wird nicht mehr rechts abgeschnitten. Hochkant:
drei Karten je Reihe, alles passt auf einen 412x915-Schirm (vorher lagen Lenkhilfe, Grafik und Erfolge hinter dem
Startknopf). Quer: zwei Spalten - links Titel, Modus, Klasse, Garage und Erfolge/Umschalter, rechts Strecken und
Startknopf (vorher lag der Startknopf unter dem Bildrand); kompakte Stufe bis 667x375. Streckenvorschauen nie
verzerrt (`object-fit:cover`).

**Nebenbei:** In style.css stand seit Runde 41 ein uebrig gebliebener Merge-Marker (`=======`), der die folgende
Regel ungueltig machte - die Wiesnland-Missionsanzeige war dadurch nicht fixiert, sondern lag unsichtbar hinter dem
Spielbild. Entfernt.

## Runde 44 (25.09.2026): Fluessig auf Handys, Bunny-Hop-Drift, Touch-Steuerung im Arcade-Stil

**Ruckeln in Runde 1 - Ursache gefunden (Profil auf echter GPU, Kopflos-Chrome mit Intel UHD):**
Die automatische Grafikanpassung startete mit Schatten und schaltete sie im Rennen ab, sobald die
Bildrate unter 50 fps fiel. Schatten aus aendert den Shader-Schluessel aller Materialien - jedes
Objekt wurde beim ersten Auftauchen neu kompiliert (Spitzen bis 200-490 ms, nur in Runde 1). Dazu
kompilierten ausgeblendete Teile (Drache vor seiner Zone, Boot-/Flugzeugteile) erst beim ersten
Sichtkontakt. Jetzt:
- mitten im Rennen wird nur noch die Aufloesung (und der Schattenrhythmus) angepasst, nie Schatten oder Material
- die gelernte Stufe wird gespeichert und beim naechsten Start gleich angewandt; ein fluessiges Rennen (>58 fps) erlaubt wieder eine Stufe hoeher
- die Vorkompilierung blendet alle versteckten Teile der Strecke kurz ein (Drache, Transformationen, Unterwasser-Deko)
- Shaderfehler-Pruefung (getProgramInfoLog, blockiert bis der Treiber fertig ist) nur noch im Testmodus

**Audio frass 16 % CPU:** Motor- und Mischpult-Regler bekamen jeden Frame neue
setTargetAtTime-Ereignisse. Bei pausiertem Audiokontext (Handy vor dem ersten Tippen, Ton aus) laeuft
die Zeit nicht weiter und die Ereignislisten wachsen endlos. Jetzt nur bei laufendem Kontext und
spuerbarer Aenderung, alte Ereignisse werden vorher verworfen.

**Leicht-Modus (Handys automatisch, sonst Grafik "Sparsam"):** Lambert- statt PBR-Material,
keine Schatten und kein Scheinwerfer-Punktlicht von Anfang an, halbe Streudeko, und Low-Poly-Modelle
aus Blender (art/r44/make_lod.py, Decimate: Burg 24k -> 10k, Fahrer 7k -> 3k, Kart 5,2k -> 2,2k,
Baeume/Pilze/Tribuenen halbiert; assets/lo/). Messung mit Handy-Emulation (412x915, 4x CPU-Drossel):
schlimmster Frame in Runde 1 486 -> 100 ms, Frames ueber 50 ms in Runde 2 125 -> 53, Dreiecke
400k -> 212k, Draw-Calls 142 -> 103. Handys starten mit 1,5facher Aufloesung und regeln nur die
Aufloesung herunter. Neue Kartraeder auch im normalen Modus leichter (1352 -> 852 Dreiecke).
Mit **?fps** in der Adresse zeigt das Spiel Bildrate, Modus, Aufloesung und Draw-Calls an.

**Bunny-Hop-Drift:** Die Drifttaste laesst das Kart hopsen (0,3 s, Chiptune-
Sprung). Waehrend des Hopsers bestimmt die Lenkung die Richtung (und dreht etwas williger), bei der
Landung mit gehaltener Taste beginnt der Funkendrift - erst blau, dann rot (lila fuer sehr lange
Drifts), Loslassen gibt den Turbo. Ohne Lenkung bleibt es ein Hopser. Die KI haelt die Taste ueber
den Hopser und lenkt in die Kurve.

**Touch-Steuerung neu:** runde Knoepfe mit weissem Rand und Verlauf,
GAS (gruen, gross) und HOPS (rot) jetzt getrennt - vorher gab der Drift-Knopf automatisch Gas mit,
mit dem Hopser waere jeder Gasstoss ein Sprung geworden. Item-Blase gelb leuchtend, Bremse klein,
Lenkung als zwei grosse Kapseln. Auto-Gas bleibt auf dem Handy standardmaessig aus.

**Rechtwinklige Kurven:** Pilz-Promenade, Sonnen-Canyon und Neon-Pilzwald haben je
eine enge Ecke (Radius 11-15 m statt mindestens 24 m). Dafuer zieht der Streckenbau zwei Hilfspunkte eng um den
Eckpunkt und schwaecht die Radius-Glaettung nur dort ab; alle Bauten bleiben an ihrem Platz. Mit Grip geht so
eine Ecke nur mit etwa 19-23 m/s, im Drift mit 26-35 m/s plus Drift-Turbo - Driften lohnt sich. Dazu etwas mehr
Untersteuern bei Hoechsttempo (vorher war jede Kurve der Spiele mit Vollgas und Grip fahrbar).

**Keine toedlichen Spruenge vor Kurven mehr:** Audit aller Schanzen und Luecken - 12 Landungen lagen in einer
Kurve mit 24-35 m Radius (Neon allein 4). Neu ist eine Luftfuehrung: in der Luft folgt das Kart sanft dem
Streckenverlauf und wird Richtung Mitte gezogen. Sternenbahn: 2 -> 0 Abstuerze in der Regression.

**Regenbogen-Spirale entschaerft:** der kurvige Dreifach-Looping (Radius 22 m, 3 Umdrehungen) drehte die Kamera
zu schnell - jetzt 28 m Radius mit 2 Umdrehungen.

**Muenzen und Chiptune-Sound:** Die Sporen sind jetzt echte Sporenmuenzen aus Blender (art/r44/create_coin.py:
gepraegter Pilz, erhabener Rand, ein Material = ein Draw-Call fuer alle) und drehen sich aufrecht. Neue,
selbst synthetisierte Chiptune-Effekte (art/r44/make_chiptune.mjs, NES-artig: Rechteck 12,5/25/50 %, Dreieck,
LFSR-Rauschen): Muenze (H5 -> E6), Item-Box, Rundenfanfare, Drift-Turbo in drei Stufen, Turbo, Treffer,
Rempler, Banane, Trick, Ring, Raketenstart, Countdown - 15 WAVs, zusammen 270 KB.

**Neue Hindernisse aus Blender (art/r44/create_hazards.py, assets/hazards.glb, eigene Entwuerfe):**
- **Stampfer** - zorniger Stachel-Steinblock mit Gesicht. Wartet oben (Schatten auf der Bahn wird dunkler, kurzes
  Zittern), kracht herunter (Staub, Wackelkamera), liegt kurz als Hindernis und zieht sich hoch. Wer im Fall darunter
  ist, wird plattgedrueckt. Sternenbahn (drei) und Lava-Feste (zwei vor dem Ziel),
  abwechselnd links und rechts - Spurwahl und Timing entscheiden.
- **Roehren mit Schnappblume** am Fahrbahnrand (Pilz-Promenade, Neon-Pilzwald): die Pflanze dreht sich zum naechsten
  Kart, lehnt sich heraus und schnappt zu - wer die Kurve zu weit aussen nimmt, wird erwischt. Dazu Roehrengruppen
  als Deko im Wald.
- **Feuerkoenig-Statuen** (Lava-Feste): riesige gehoernte Steinbuesten mit gluehenden Augen spucken die Feuerbaelle,
  die im Bogen auf Fahrhoehe fallen und quer ueber die Bahn fliegen; Treffer = Dreher. Jetzt drei statt einem.
- **Roehrenkanone mit Kugelblitzen** (Lava-Feste, Ende der Burggeraden): feuert alle 1,6 s ein Geschoss mit Augen die
  Gerade hinunter, jedes leicht versetzt (Spuren -3,5 / 0 / 3,5 / -1,5 / 2 ...) - ausweichen!
- **Befahrbare Roehre** statt Magmaschacht auf der Lava-Feste, **"Achtung Lava"-Schilder** als Blender-Modell.
Takte und Bahnen in hazards.mjs (4 Unit-Tests), die KI weicht Stampfern, Kugelblitzen und Feuerbaellen aus.

**Tribuene neu (art/r44/create_grandstand.py):** Betonstufen mit farbigen Setzstufen und Baenken, niedrige Bruestung
mit Sponsorband und Schachbrettstreifen (die Zuschauer sind jetzt sichtbar), gestufte Seitenwaende mit Gelaender,
geschwungenes rot-weiss gestreiftes Dach mit Bogenkante, Wimpelkette, Fahnenmasten und Pilz-Schild. Sitzgeometrie
unveraendert. **Sporentor neu (art/r44/create_gate.py):** Pilztuerme auf Steinsockeln mit Goldringen und
Schachbrettband, getupfte Huete mit Wimpeln, Bannerbalken mit Schachbrettleisten und Gluehbirnenreihe; der
Schriftzug ist jetzt ganz lesbar (vorher verdeckten die Huete M und Y). **Jubel als Chiptune:** 8-Bit-Applaus
(Rauschen in zufaelligen Stoessen), Pfiffe und Hurra-Arpeggio.

**Mehr Platz zum Driften - Auslaufzonen:** Die Strassen waren zum Driften zu eng (Nutzer: "knalle immer gleich gegen
die Bande"). Beidseitig liegt jetzt ein befestigter Randstreifen von 8,6 bis 11,2 m (heller Belag, weisse
Randlinie), der als Fahrbahn zaehlt - nutzbare Breite 22 statt 17 m. Die Planken in Kurven stehen an seiner
Aussenkante, und ein Anschlag nimmt nur noch die Bewegung nach aussen weg (vorher Rueckprall mit 25 % Ueberschuss
und bis 16 % Tempoverlust, jetzt ohne Rueckprall, hoechstens 8 %) - man gleitet an der Bande entlang. Nicht auf
Bruecken, an Luecken, in Loopings, Roll-, Wasser-, Flug- und Achterbahnzonen, nicht auf der Abzweigseite.
Roehren, Kanone, Schilder und Grasbueschel sind entsprechend nach aussen gerueckt; das Untersteuern bei
Hoechsttempo ist wieder etwas zurueckgenommen, die engen Ecken haben 13 statt 11 m Radius.

**Gas- und Hops-Knopf getrennt, kein Auto-Gas:** war Auto-Gas auf einem Geraet einmal an, blieb die Einstellung
gespeichert und der Gas-Knopf verschwand - einmalig fuer alle auf AUS zurueckgesetzt.

**Achterbahnen ruhiger:** Die Twists drehten die Kamera mit bis zu 15 rad/s (eine Umdrehung auf 17-22 m). Der
Drache hat jetzt einen Korkenzieher mit einer statt zwei Umdrehungen auf fast doppelter Laenge, die kurzen
Achterbahnen (Geisterhaus, Regenbogen) keinen Twist mehr. Die Kamera dreht bei Achterbahn-Twists nur zu 40 % mit
und hoechstens 3,2 rad/s schnell. Die Anti-Grav-Spirale der Magnet-Kirmes ist 70 % laenger.

**Laengere Wasser- und Flugphasen:** Flug auf der Lava-Feste startet direkt nach der Schanze (+33 %), See im
Geisterhaus +46 %, See der Magnet-Kirmes +40 %, dazu Bach und Regenbogen-Flug laenger. Die Ueberlaenge eines Sees
geht nicht mehr nur unter Wasser: je 20 % an die Bootsfahrt an der Oberflaeche davor und danach (16-29 m statt 6 m).

**Lava-Feste aufpoliert (art/r44/polish_castle.py, Anbauten auf das bestehende Modell):** Feuerkoenig-Relief mit
Hoernern und gluehenden Augen ueber beiden Toren, Fallgitter-Zaehne in der Durchfahrt, Fackeln an Toren und
Fluegeln, gluehendes Lavaband am Fuss, Stachelkraenze und goldene Spitzen auf den Tuermen.

**Lava-Feste: Burgturm mit Mauerdurchbruch und Kanonen-Portal (art/r44/create_tower.py):** Die Hochstrasse vor dem
Ziel steigt jetzt auf 14 m (vorher 8) und windet sich in der Kurve an einem runden Basalt-Bergfried hinauf (30 m, gluehende
Lava-Risse, Zinnenkranz, leuchtende Fenster, Flammenbanner, spitzes rotes Stachel-Dach). Oben geht es durch einen
Mauerdurchbruch (kurzer Tunnel im Basalt-Stil) und dann frontal auf ein Steinportal zu, auf dem eine Roehrenkanone
thront: ihre Kugelblitze stuerzen von oben herab und fliegen in versetzten Spuren die Rampe hinunter - ausweichen.
Der Sprungpilz auf der Bruecke ist weg (haette von der Hochstrasse geschleudert). Ehrlich: die Kurve dort dreht nur
etwa 60-70 Grad - eine Spirale ueber mehrere Umdrehungen braeuchte einen Umbau der ganzen Streckenfuehrung.

**Wiesnland wirklich frei befahrbar:** Abseits der Ringstrasse bremste das Gras auf 12,5 m/s, Querfeldein wurde
als Abkuerzung zurueckgesetzt und die Hoehe neben der Strasse aus der Querneigung hochgerechnet (auf 200 m bis zu
24 m daneben). Jetzt faehrt man ueber die ganze Insel mit 95 % Tempo, der Boden ist flach, nichts setzt zurueck.
**Sandwege** fuehren von jedem Portal quer ueber die Wiese zum Pilzberg und verbinden alle Gebiete. Neue Mission
**Muenzjagd**: 24 Muenzen sind ueber die ganze Insel verstreut (mindestens 25 m neben der Strasse), jede zaehlt
einmal und bleibt gespeichert. Test: 116 m Wiese in 5,6 s mit 29 m/s Richtung Pilzberg, Hoehe 0, kein Zuruecksetzen.

**Mehr Erfolgserlebnis - Fahrerstufen, Erfolge, Lackierungen (progress.mjs, 4 Unit-Tests):**
- Jedes Rennen bringt **XP**: Platzierung (100 bis 28) plus Drift-Turbos (Funken 4, Glut 8, Blitz 15), Tricks, Windschatten,
  Ueberholen, Ringe, +30 ohne Treffer; mal 1 / 1,25 / 1,6 je Klasse. Der Ergebnisschirm zeigt die Aufschluesselung und
  einen XP-Balken, der sich fuellt (auch ueber einen Stufenaufstieg hinweg, mit Chiptune-Fanfare).
- **Fahrerstufen** schalten neue Lackierungen frei: Blitz (Stufe 2), Lava (3), Wald (5), Bonbon (7), Diamant (10).
- **23 Erfolge** mit Abzeichen: Erster Sieg, Treppchen, Turbo-Profi, Lila Funken, Combo-Koenig, Unberuehrbar,
  Luftakrobat, Windschatten-Jaeger, Ueberholkuenstler, Muenzsammler, Raketenstart, Wild-Champion, Grand-Prix-Sieger,
  Weltenbummler, Pokalsammler, Achterbahn-Fan, Entdecker (Wiesnland) - und je Strecke einer zur eigenen Idee:
  Kuhfluesterer, Wuestenfuchs, Taktgefuehl, Geisterjaeger, Stampfer-Taenzer, Sternenkind.
- Im Menue zeigt **"ERFOLGE"** Stufe, XP-Balken, alle Erfolge und die Lackierungen mit ihrer Stufe.

**Jede Strecke mit eigener Idee (art/r44/create_critters.py, assets/critters.glb):**
- **Pilz-Promenade "Almwiese":** drei Kuehe (Fleckvieh mit Glocke, Hoernern, grasendem Kopf und laufenden Beinen)
  wandern nach der engen Ecke ueber die Strasse und bleiben zum Grasen stehen - ausweichen, sonst Dreher und "Muh".
- **Neon-Pilzwald "Beat":** drei Taktschranken (Neon-Schlagbaeume von beiden Seiten) senken sich im 120-bpm-Takt
  abwechselnd links und rechts - die offene Seite im Takt waehlen. Turbo-Felder geben auf dem Schlag getroffen
  deutlich mehr Schub ("IM TAKT!").
- **Geisterhaus "Spuk":** Geisterhaende schiessen im ersten Abschnitt aus dem Boden (dunkler Riss als Warnung) und
  packen zu; dazu Gewitter mit Blitz (weisses Aufleuchten) und Donner.
- **Sternenbahn "Sternenstrasse":** Sternschnuppen schlagen mit Warnkreis auf der Bahn ein, dazu die Stampfer
  und der Sprung ueber den Abgrund. (Eine Mondschwerkraft-Zone war im Test, aber mit dem Gleiter flogen die Karts
  seitlich weg - wieder entfernt.)
- Die KI weicht Kuehen, Haenden, Einschlagkreisen aus und waehlt an den Schranken die offene Seite.
Neue Chiptune-Effekte: Muh, Zupacken, fallende Sternschnuppe, Einschlag, Donner.
Fehler behoben: die Auslaufzone endete direkt an Hochstrecken - wer auf ihr fuhr, kam an die Kante (Neon-Absturz).

**Eigener Streckencharakter - Sonnen-Canyon wird zum "Wuestensturm":** Der Canyon war ein Baukasten aus allem
(drei Loopings, Wandfahrt, Hochstrecke, Tafelberg, Luecke, Abzweigung, Tunnel) ohne Wuestengefuehl. Zwei Loopings
und die Wandfahrt sind raus, dafuer:
- **Duenen** auf der Startgeraden: rhythmische Sandkaemme (1,7 m, alle 18 m). Mit Tempo hebt man auf jedem Kamm ab -
  Hopser/Drift in der Luft gibt den Trick-Turbo bei der Landung.
- **Sandhosen**: drei wandernde Wirbelstuerme (wirbelnder Sandtrichter mit Staub), die quer ueber die Bahn und etwas
  vor und zurueck ziehen. Wer hineinfaehrt, wird hochgehoben und gedreht; die KI weicht aus.
- **Treibsand** an der Innenseite der engen Ecke: wer abkuerzt, wird stark gebremst und zur Mitte gezogen
  (ausser mit Turbo) - die Drift-Linie lohnt sich.
- **Dampf-Gueterzug** mit Pfeife und Schrankenglocke (Chiptune) an den Uebergaengen.
Neue Chiptune-Effekte: Sandhose, Treibsand-Blubbern, Dampfpfeife, Schrankenglocke.
Neon-Pilzwald: die Schanze kurz vor dem Ziel entfernt (landete in der letzten Kurve, wiederkehrender Absturz).

**Themen-Wahrzeichen aus Blender (art/r44/create_landmarks.py, assets/landmarks.glb):**
- Pilz-Promenade mit Bayern-Note: Maerchenschloss im Neuschwanstein-Stil (weisse Mauern, schlanke Tuerme mit
  schieferblauen Kegeldaechern, roter Torbau) auf einem Felssockel am Inselrand, Maibaeume, blau-weisse Wimpel.
- Neon-Pilzwald mit Oktoberfest: Festzelt mit blau-weiss gestreiftem Dach und Leuchtschild "O'ZAPFT IS!",
  Maibaeume, Lebkuchenherzen und Riesenbrezeln als Neonschilder am Streckenrand.
- Sonnen-Canyon: Dampf-Gueterzug (Lok mit Schlot, Dampfdom, roten Speichenraedern und Dampfwolken, drei Wagen mit
  Kisten und Faessern) auf einem Gleisring - eine Sehne quer durch die Insel mit zwei Bahnuebergaengen ueber die
  Strasse, zurueck am Inselrand. Blinksignale und Glocke, wenn er kommt; wer erwischt wird, fliegt seitlich weg.
  Die KI wartet am Uebergang. Die Uebergaenge werden automatisch auf freie Strecke gelegt (keine Luecken,
  Loopings, Tunnel, Rampen, Abzweigungen).

**Neon-Pilzwald:** die enge Ecke wieder entfernt - direkt dahinter liegt eine Schanze, das fuehrte zu Abstuerzen
(Regression 3 -> 0).

**Fehler behoben:** Der Portal-Knopf der Open World ("... fahren") blieb nach dem Antippen im Rennen
und sogar im Hauptmenue sichtbar.

**Verifikation:** 72/72 Unit-Tests (neue Hop-Tests), Rennregression aller Strecken normal und im
Leicht-Modus ohne Fehler, Screenshot der Touch-Steuerung in Handy-Emulation.

**Teil 11 - Pilze, Baeume und Wolken neu (art/r44/create_nature.py, Vorschau art/r44/render_nature.py):**
- Pilz: gewoelbter Hut mit eingerolltem Rand, helle Unterseite mit 20 Lamellen, halb eingelassene Tupfen in
  verschiedenen Groessen, die der Woelbung folgen, leicht geschwungener Stiel mit Knolle und Manschette.
- Baum: Stamm mit Wurzelansatz, vier Wurzeln und Seitenast, Krone aus sechs knubbeligen Bueschen statt zwei
  gestapelter Scheiben (ohne die alten Tupfen).
- Wolken: drei Comic-Wolkenformen aus Blender (assets/clouds.glb) mit flachem Boden und runden Hauben statt
  Kugel-Klumpen, instanziert; die farbigen Wetterwolken (Canyon, Lava) nutzen dieselben Formen flacher.
- Weiche Hoehenschattierung beim Laden als Vertexfarbe (Krone und Hut unten dunkler, Wolken unten kuehl-blau):
  gibt Tiefe, bleibt je Instanz einfaerbbar und wirkt auch im Leicht-Modus. Materialnamen und Groessen wie
  bisher, alte Modelle als art/r44/*_r43_backup.glb gesichert, Low-Poly-Fassungen neu (Pilz 0,9k, Baum 0,7k,
  Wolke 0,8k Dreiecke; eigene Zielanteile in art/r44/make_lod.py).
- Die Hut-Unterseite zeigt nach unten und bekam fast nur das gruene Bodenlicht (wirkte dunkelgruen): beim Laden
  werden ihre Normalen schraeg nach aussen/oben gebogen, Lamellen und Hutrand wirken hell wie im Seitenlicht.
- Werkzeug: `fix_normals` in art/lib/blib.py berechnet die Flaechennormalen jetzt vor der Pruefung (bmesh setzt sie
  bei neuen Flaechen nicht) - vorher konnten Teile innen-aussen verkehrt exportiert werden.

## Runde 43 (24.09.2026): Karts und Fahrer neu in Blender - jede Figur mit eigenem Bausatz

**Neue Karosserie (Blender, art/r43/create_karts.py):** Statt flacher Wanne mit dickem
Rammrohr eine gerundete Karosserie aus Superellipsen-Querschnitten: gewoelbte Haube mit
Zierstreifen und Pilz-Emblem, zwei leuchtende Scheinwerfer, flacher Frontfluegel mit
Endplatten, Seitenkaesten mit Lufteinlass, Cockpitwangen, gepolsterter Sitz, Lenkrad mit
Goldnabe, sichtbare Radaufhaengung, Chrom-Motorblock mit Kuehlrippen, Auspuffrohre genau an
den Flammenpunkten, Rueckleuchten-Gehaeuse unter den Bremslichtern, schmale Heckstange.
Masse, Radpositionen und Fahrerplatz unveraendert (Physik, Transformationen und Gleiter passen).

**Neue Raeder:** Reifen mit gerundeter Schulter und flachem Pfeilprofil, weisser Flankenring,
Fuenfspeichen-Felge mit Goldnabe (1352 Dreiecke).

**Jede Figur faehrt ihr eigenes Kart (assets/kartkit.glb):**
- Pilzi "Sporenflitzer": Heckspoiler als Pilzhut auf Stiel mit weissen Tupfen, Tupfen auf den Seitenkaesten
- Schildi "Panzerwagen": schwerer Heckfluegel, Sechseck-Panzerplatten, Rammschild mit Goldnieten, Panzerkuppel ueberm Motor
- Volt "Voltstoss": zwei Raketenbooster mit leuchtenden Duesen und Heckflossen, Blitzfinne
- Mochi "Kurvenkatze": Pfeilfluegel mit Katzenohr-Endplatten, geschwungene Schwanzantenne, Pfotenabdruecke

Die Bausaetze werden beim Laden mit der Karosserie zu einem Prototyp je Figur verschmolzen
(auch fuer die instanzierten KI-Karts: Karosserie-Instanzen jetzt je Fahrertyp). Die alten
Box-Anbauteile hingen am Fahrer und schwankten mit ihm - bei KI-Karts lagen sie wegen der
Instanzierung sogar ohne Versatz mitten im Fahrer; beides ist damit weg. Die Siegerehrung
zeigt jetzt jede Figur in ihrem eigenen Kart (vorher immer Pilzi).

**Fahrer-Feinschliff (art/r43/driver_touchup.py):** Pilzi laechelt jetzt (gebogener Mund auf
der Kopfoberflaeche mit Zungenspitze statt erschrockenem "O"), Volt hat gefaste Kastenteile
mit gehaerteten Normalen, leuchtende LED-Augen und ein LED-Pixel-Laecheln.

**Verifikation:** Blender-Workbench-Renders vorher/nachher (art/r43/before_*.png, v2_*.png),
Kopflos-Chrome-Screenshots von Startaufstellung vorn/hinten, 71/71 Unit-Tests,
Rennregression aller sieben Strecken. Blender-MCP war nicht erreichbar (Verbindungs-Timeout),
deshalb Blender 5.2 ueber die Kommandozeile.

## Runde 42 (24.09.2026): Open World "Wiesnland" mit Missionen, lange Boots- und Flugparcours

Neuer Modus **Wiesnland** im Menue: eine grosse Insel (680 m Radius) mit einer 3,7 km langen
Rundstrasse, die die Rennstrecken verbindet. Kein Zieleinlauf, frei
fahren, Missionen erledigen, Rennen ueber Portale starten.

- **Portale zu allen 7 Rennstrecken:** Torbogen in der Farbe der Strecke mit Namensschild und
  leuchtendem Schleier. Beim Durchfahren erscheint "▶ Strecke fahren" (Enter oder tippen) und
  startet direkt das Rennen. Neben jedem Portal das Wahrzeichen der Strecke (Wurzelbaum,
  Felsen, Neon-Tor, Villa, Burg, Kristalle, Riesenrad), in der Inselmitte der Pilzberg.
- **Missionen (7, Fortschritt gespeichert):**
  - **Glockenschalter (4x):** Ueberfahren -> 8 Muenzen erscheinen als Schlangenlinie auf der
    Strasse, alle in 22 s einsammeln. Zeit um: Schalter setzt sich nach 3 s zurueck.
  - **Bojen-Slalom (2x):** als Rennboot auf den Fluessen die Bojentore der Reihe nach
    durchfahren; ein verpasstes Tor startet den Slalom neu.
  - **Ringflug:** in der langen Flugschneise alle 8 Ringe in einem Flug.
  Belohnung je Mission: Turbo und 3 Sporen, Anzeige oben links ("★ 3/7").
- **Lange Bootsfahrten an der Wasseroberflaeche:** zwei Fluesse mit 293 m und 245 m Boot.
- **Langer Flugparcours:** 314 m Flug in 26 m Hoehe mit 8 Ringen (Ringe jetzt alle ~34 m, auch
  auf den Rennstrecken bei laengeren Fluegen).
- Dazu See mit Tauch-Spirale, Looping, gekruemmte Dreifach-Helix, Wandfahrt und Rundgang.
- Logik in `ow.mjs` (Tests `ow.test.mjs`), Modelle aus Blender (`art/r41/create_ow_assets.py`,
  `assets/ow.glb`: Glockenschalter mit eindrueckbarer Kappe, Muenze mit Pilz-Emblem).

Technik: Inselgroesse, Meer, Streufelder, Kulisse und Kart-Inselgrenze haengen jetzt am
Weltradius je Strecke (Rennstrecken unveraendert 210 m). Bojen als Instanzen (vorher bis 280
Draw-Calls an langen Fluessen; Wiesnland jetzt 150-230). Item-Boxen und Sporen lassen sich auch
im Flug und auf dem See einsammeln. Autopilot 120 s durch Wiesnland: 2,97 km, keine Stuerze, keine
Fehler; alle 7 Rennstrecken weiter im Ziel. Tests: 71.
## Runde 41 (24.09.2026): Fenster im Menuestil, Handy-Menue repariert

- **Pause, Ergebnis, Siegerehrung, Fehler- und Ladeanzeige** im Stil des neuen Menues: helle Karte
  mit Zielflaggen-Streifen, kursive Titel mit dicker Kontur und rotem Versatzschatten, roter
  schraeger Hauptknopf, weisse Nebenknoepfe, Rangliste als kleine Karten (eigene Zeile gelb),
  Sterne gelb mit Kontur. Vorher waren diese Fenster noch im alten Dunkelgruen.
- **Ergebnis auf dem Desktop kompakter:** Werte in drei Spalten, damit "Nochmal" ohne Scrollen
  sichtbar ist.
- **Handy-Menue:** Ton- und Vollbild-Knopf lagen ueber dem Titel, Kartfarben stapelten sich
  senkrecht und "Grafik" lief rechts aus dem Bild. Jetzt beginnt das Menue unter der Kopfleiste,
  die Auswahl steht im Raster (Grafik eigene Zeile), das Menue scrollt.
- **Gewaehlte Streckenkarte** wurde oben und links vom scrollenden Raster abgeschnitten - das Raster
  hat jetzt Luft fuer die angehobene Karte.
- Doppelte `#speedlines`-ID in `index.html` entfernt.
- **Startknopf wirkte grau:** Die Rand-Vignette des Renn-HUD lag ueber dem Menue und dunkelte
  die Panel-Ecken ab - "Los geht's" unten links war dadurch grau statt weiss. Menue liegt jetzt
  darueber.
- **Countdown und Einblendungen** (3-2-1, LOS!, RUNDE 2) in der Display-Schrift mit Kontur und
  rotem Schatten, springen bei jedem Wechsel auf, stehen tiefer und ueberlappen die
  Streckeneinblendung nicht mehr.
- **Handy:** "Los geht's" klebt unten am Menue, auch beim Scrollen der Streckenliste; "Grand Prix"
  bricht nicht mehr um; im Rennen zeigt die Kopfleiste nur das Icon, Ton/Pause/Vollbild sind
  einzeilige kleine Knoepfe statt gestreckter Ovale.

## Runde 40 (24.09.2026): Menue im Arcade-Stil, Drache durchsichtig, keine Ruckler in Runde 1

- **Menue und Schrift:** fette kursive Display-Schrift (Rubik 900) mit dicker dunkler Kontur und
  rotem Versatzschatten, helle Karte mit Zielflaggen-Streifen, schraege Knoepfe (Auswahl
  gelb-orange), Strecken-Karten mit weissem Rand und Glanzlauf, grosser roter "LOS GEHT'S"-Knopf
  mit Zielflagge. Platz, Runde, Zeit und Einblendungen im HUD in derselben Schrift.
- **Streckenliste ueberlappte:** das Raster durfte schrumpfen und quetschte die Zeilen auf 77 px
  (Karten 152 px) - jetzt vier Spalten, schmal zwei, das Menue scrollt statt zu quetschen.
- **Drache durchsichtig**, solange man in seiner Achterbahn faehrt (12 %); von aussen bleibt er
  voll sichtbar.
- **Ruckler nur in Runde 1:** das On-Ride-Foto kostete einen Frame mit zwei Zusatz-Bildern,
  blockierendem Pixel-Ruecklauf und JPEG-Kodierung. Jetzt ein Bild, asynchroner Schnappschuss,
  Kodierung im Leerlauf. Dazu werden ausgeblendete Kartteile (Boot, Tauchboot, Flugzeug, Schild,
  Gleiter) und alle Texturen beim Start vorab kompiliert bzw. hochgeladen.

## Runde 39 (24.09.2026): Elemente-Parcours, Schraeg- und Mehrfach-Loopings, Drache, Flow

**Elemente-Parcours** (Logik in `elem.mjs`, ohne Browser getestet): Das Kart verwandelt sich je
nach Element - auf dem Wasser in ein **Rennboot** (V-Rumpf, Duese, Gischt, schaukelt), unter
Wasser in ein **Tauchboot** (Propellerring, Flossen, Blasen), in der Luft in ein **Flugzeug**
(Tragflaechen mit Pilzpunkten, Luftschraube, Kondensstreifen). Beim Durchstossen der
Wasseroberflaeche spritzt es, jede Verwandlung hat ihren Klang. Teile und Deko aus Blender
(`art/r39/create_elements.py`, `assets/transform.glb`, `assets/elements.glb`).

- **Seen:** echtes Loch im Inselboden (Alpha-Maske im Bodendeckel), Becken mit animiertem
  Kaustik-Licht, Uferstrand, Wasseroberflaeche, Seetang, Korallen, Fischschwaerme, Bojen an der
  Bootsspur. Unter Wasser faerbt sich die Sicht (Nebel, Hintergrund), die Musik klingt gedaempft.
- **Tauch-Spirale:** Auf der Magnet-Kirmes (Wildwasser-Spirale) und im Neon-Pilzwald (Neon-Riff)
  liegt ein Mehrfach-Looping am Seegrund - die unteren Boegen jeder Windung tauchen ein, die
  oberen ragen in die Luft: Boot, abtauchen, Spirale durch Wasser und Luft, auftauchen, an Land.
- **Geistersee** (Geisterhaus) mit Tauchgang, **Pilzbach** (Pilz-Promenade) als Bootsstrecke.
- **Flug:** Startrampe mit Leuchtkante, dann traegt die Luft - die Fahrbahn verschwindet,
  Flugringe geben Turbo, Landung auf der Gegenrampe. **Feuerflug** (Lava-Feste) und
  **Sternenflug** (Sternenbahn).

**Loopings neu** (`loop.mjs`): Jede Windung ist zur Seite geneigt - Ein- und Ausfahrt laufen
aneinander vorbei, statt sich zu schneiden (ein ebener Looping mit Ausfahrt vor der Einfahrt
kreuzt sich zwangslaeufig selbst). Die Ausfahrt schliesst jetzt ohne den bisherigen 9-m-Sprung
an die Strasse an. Bis drei Windungen hintereinander ergeben Spiralen, auch in Kurven
(gekruemmte Spirale). Ein Test prueft fuer alle Groessen mindestens 4 m Abstand zwischen den
Bahnteilen, im Spiel werden 3,65 bis 5,5 m gemessen. Kart und Kamera folgen der geneigten Bahn.
Jede Strecke hat ihren eigenen Looping-Charakter: Doppel-Looping (Pilz-Promenade, Geisterhaus,
Lava-Feste), Looping-Kette aus drei Einzel-Loopings (Sonnen-Canyon), gekruemmte
Dreifach-Helix (Neon-Pilzwald), Sternenspirale (Sternenbahn).

**Laengere Wand- und Ueberkopffahrten:** Rollzonen sind jetzt Folgen aus Drehungen und
Haltephasen - lange 90-Grad-Wandfahrt, lange Ueberkopffahrt, Wandwechsel ueber Kopf und der
Rundgang ueber alle vier Seiten (Lava-Feste).

**Drachen-Achterbahn** (Magnet-Kirmes): Fliegenpilz-Drache aus Blender, die Bahn schraubt sich
im Korkenzieher um seinen Leib, am Ausgang speit er Feuer. Dazu Steilkurven aus der Kruemmung.

**Flow (Spielgefuehl):**
- **Glatter Belag:** Kurvenueberhoehung und Kurvenhub kamen aus der rohen Kruemmung des
  Streckenzugs, die von Stuetzpunkt zu Stuetzpunkt schwankt - die Fahrbahn hob und senkte sich in
  jeder Kurvenfolge um bis zu 1,2 m (Buckelpiste). Jetzt ueber die Strecke geglaettet.
- **Kein Hueperln mehr auf dem Handy:** Der Kuppenabsprung wurde je Frame entschieden - bei
  20 fps hob das Kart schon an sanften Wellen ab. Jetzt aus der Hoehenkruemmung, unabhaengig von
  der Bildrate.
- **Lenkhilfe** (Menue, Standard an): das Kart folgt der Kurve auf der eigenen Spur, die eigene
  Lenkung kommt obendrauf; vor zu engen Kurven geht sie vom Gas. Freihaendig auf dem
  Neon-Pilzwald: 982 m statt 321 m in 45 s, keine Stuerze statt zwei.
- **Leitplanken** schon ab 65 m Kurvenradius und in jeder Landezone hinter Schanzen.
- **Handy:** Touch-Geraete starten mit Aufloesungsdeckel 1,0 und Schatten jeden zweiten Frame.

Rundenzeiten werden durch die Spiralen laenger - Medaillen neu, Rekorde aller Strecken einmalig
zurueckgesetzt. Autopilot-Rennen auf allen sieben Strecken: alle im Ziel, keine JS-Fehler.
Tests: 65 (neu `loop.test.mjs`, `elem.test.mjs`).

## Runde 38 (23.09.2026): Magnet-Achterbahn, neue Strecke Magnet-Kirmes, On-Ride-Foto

Die Magnetbahn wird zur Super-Achterbahn. Neues Streckenelement `coaster` (Logik in
`coaster.mjs`, ohne Browser getestet), gefahren wie Rollzone und Looping flach, gezeichnet als
Achterbahn:

- **Magnet-Katapult:** sechs Hufeisen-Magnetboegen ueber einer Abschussstrecke. Jeder Bogen gibt
  beim Durchfahren genau einmal +7 m/s Schub, gedeckelt bei 46 m/s (Turbo sonst 40). Die
  Pol-Leuchten laufen als Lauflicht in Fahrtrichtung und blitzen beim Durchfahren auf. Danach
  traegt die Magnetbahn das Tempo durch die ganze Achterbahn.
- **Airtime-Huegel:** Top-Hat, Kamelruecken, Bunny-Hop. Jeder Buckel ist (1-x^2)^3, also C2-glatt
  (auch die Kruemmung ist an den Raendern null, kein Ruck), Steigung hoechstens ~45 Grad. Auf
  kurzen Zonen wird die Hoehe automatisch gedeckelt; das hat der Unit-Test gefunden.
- **Energietempo:** bergauf langsamer, bergab schneller (Energieerhaltung relativ zu 44 m/s, oben
  nie unter 52 %), dazu der laengere Bildweg am Hang. Der Tacho zeigt das Bildtempo: auf der
  Top-Hat-Kuppe gut 80 km/h, bergab wieder ueber 100.
- **Airtime:** Faellt das Lastvielfache an der Kuppe unter 0,35, schwebt das Kart bis 0,5 m ueber
  der Bahn, der Fahrer lehnt sich zurueck, das Sichtfeld weitet sich. "AIRTIME!" je Huegel.
- **Wertung bei der Ausfahrt:** sauber (nie an der Magnetbande) und mindestens zwei Airtimes =
  SUPER-ACHTERBAHN (1,25 s Turbo, 2 Sporen), sonst ACHTERBAHN-SCHWUNG (0,9 s, 1 Spore). Wer per
  Rettungspilz aus der Zone kommt, bekommt nichts.
- **On-Ride-Foto:** An der ersten Abfahrt blitzt es: eine Streckenkamera VOR dem Kart schaut
  zurueck aufs Gesicht (mit Sichtlinien-Pruefung, damit kein Rivale davor steht), das Bild landet
  als Polaroid im Ergebnisschirm ("ON-RIDE-FOTO · MAGNET-KIRMES").

**Neue Strecke 7 "Magnet-Kirmes"** (Kirmes in der Abenddaemmerung): 266-m-Super-Achterbahn mit
23-m-Top-Hat, Looping auf der rechten Geraden, Korkenzieher links, Lichterketten und ein
drehendes **Riesenrad** im Innenfeld (zwoelf Gondeln mit Pilzhut, haengen immer senkrecht).
Medaillen 100 / 106 / 117 s.

**Auch auf bestehenden Strecken:** Geisterhaus bekommt Geisterbahn-Wellen hinter der Villa
(violette Boegen, giftgruenes Leuchten), die Sternenbahn eine Sternen-Achterbahn vor dem Ziel
(Glasbahn ohne Unterseite, keine Stuetzen im All). Rekorde und Geister werden seit dieser Runde
**nur fuer geaenderte Strecken** verworfen (`TRACK_VER` je Strecke statt globalem `LAYOUT_VER`),
hier also nur Geisterhaus und Sternenbahn.

**Blender (MCP, Blender 5.2):** `magnetarch.glb` (Hufeisenmagnet mit Stahl-Polschuhen, Feldringen,
Blitz-Emblem; 1.332 Dreiecke, 62 KB), `coastertruss.glb` (4-m-Fachwerksegment, im Spiel gestapelt
statt gestreckt, plus Betonfuss; 764 Dreiecke, 20 KB), `ferriswheel.glb` (Gestell, Rad und
Gondel-Vorlage in einer Datei, im Spiel ueber die Materialnamen getrennt; ~8.000 Dreiecke,
171 KB). Quellen und Vorschauen in `art/r38/`.

**ElevenLabs (claude.ai-Connector):** Katapult-Sound (Sound Effects v2) und zwei Ansagen mit
Stimme Leo: "Magnet-Katapult!" (erster Abschuss im Rennen) und "Super-Achterbahn!" (erste
Super-Wertung und letzte Runde). Danach waren die Credits aufgebraucht; der Airtime-Klang nutzt
den vorhandenen Schanzen-Whoosh plus Synth-Schimmer. Der lokale ElevenLabs-MCP-Server war nicht
verbunden.

**Unreal (5.8):** Import aller drei Modelle validiert (29 / 3 / 8 Static Meshes unter
`/Game/MushroomRally/*_r38/`). Showcase "Magnet-Katapult" (Tunnel aus fuenf Boegen, Hero-Kart,
18-m-Huegel auf Fachwerkstuetzen, Riesenrad) abseits im Keyart-Level aufgebaut, ueber eine eigene
SceneCapture gerendert (`media/r38_magnet_katapult.jpg`) und danach wieder entfernt. Der Level
wurde nicht gespeichert: Er hatte schon vorher ungespeicherte Aenderungen (u. a. einen Ordner
`R38_HauntedKeyart`), die unangetastet bleiben. Neu aufbauen: `art/r38/unreal_coaster_r38.py`.

**Fixes nebenbei:** Der Strecken-Cache sicherte Achterbahn-Daten und die Energiewaende der
Rollzonen nicht mit (beim Zurueckwechseln lief die Animation der zuletzt gebauten Strecke).
Bananen in Magnetzonen liegen im Bild jetzt auf der gehobenen Bahn statt darunter; Item-Boxen und
Sporen auf Huegeln lassen sich einsammeln.

**Gameplay-Video (Nachtrag):** `media/r38_magnet_achterbahn.mp4` (Hochformat 1080x1920, 30 fps,
mit Ton) plus `..._small.mp4` (810x1440) unter 10 MB. Kopflos-Chrome rendert ohne GPU (~130 ms je Bild), deshalb
wird nicht in Echtzeit aufgenommen, sondern Bild fuer Bild in Spielzeit (`art/r38/capture_frames.mjs`,
`performance.now` laeuft virtuell mit). Die Spielereignisse werden mitprotokolliert; Schnitt,
Endkarte (On-Ride-Foto, Link, Credits) und Ton (Musik, Katapult, Ansagen, Airtime-Whoosh exakt auf
die Ereignisse gelegt) entstehen im Blender-Videoschnitt (`art/r38/edit_video_blender.py`), Export
als H.264/AAC. Post-Texte je Plattform: `media/social-texte-r38.md`.

**Verifikation:** 46/46 Unit-Tests (9 neue fuer `coaster.mjs`). Autopilot-Regression auf allen
sieben Strecken bei 100 ccm: alle im Ziel, 0 JS-Fehler, 0 fehlende Dateien, je Runde eine
Achterbahn-Wertung auf den drei Achterbahn-Strecken; zusaetzlich 150 ccm auf Geisterhaus,
Sternenbahn und Kirmes. Draw Calls im Rennen 118-183. Fahrt-Screenshots von Katapult, Kuppe
(Airtime) und Abfahrt sowie des On-Ride-Fotos gesichtet.

## Runde 37 (23.09.2026): Keyart mit allen Facelift-Assets erneuert

Das Teaserbild (og:image) und die Hochformat-Variante fuer Story-Posts zeigen jetzt die
faceliftete Ausstattung: drei schwebende Item-Boxen mit goldenen Eckkappen vor dem Sporentor,
zwei Sprungpilze mit welliger Krempe am Strassenrand und die Pilzschanze mit Fussbalken
seitlich - dazu Tor, Ballonbogen und Kart wie gehabt. Aufnahmen aus dem Unreal-Keyart-Level
(HighResShot quer 1920x1080 und hoch 1080x1920, JPG Qualitaet 88); alte Bilder in
art/r37/backup/. Level mit der neuen Deko-Gruppe R37_KeyartRefresh gespeichert.

**Verifikation:** Sichtpruefung beider Aufnahmen (Komposition teilbar, nichts abgeschnitten,
Belichtung gut); Dateien lokal 1920x1080 und 1080x1920 bestätigt.

## Runde 36 (23.09.2026): Tribuene, Geist, Trophaee, Podium

Vier Facelifts in einem Zug, alle rein dekorativ (Korpus, Materialzuordnung und alle
Mesh-Namen unveraendert, Backups in art/r36/):

- **Tribuene:** Festliche Wimpelgirlande ueber die Dachvorderkante (leicht durchhaengende
  Linie mit 14 Dreieckswimpeln, ein Mesh) und zwei Knaufe auf den Dachenden. 778 Dreiecke.
- **Geist:** Er hat vorher kein Gesicht gehabt - jetzt zwei dunkle ovale Augen und ein
  Mund-Oval auf der Vorderseite. Pendelt wie gehabt; das Gesicht liest sich aus jeder
  Schwenkrichtung. 4208 Dreiecke.
- **Trophäee:** Zwei klassische Pokal-Henkel (12-seitige Halbringe, TrophyGold). 1576 Dreiecke.
  Rotiert weiter auf Platz 1 der Siegerehrung.
- **Podium:** Goldene Fussleiste an der Front. 1068 Dreiecke.

Unreal: Importe validiert (grandstand 4, ghost 19, trophy 3, podium 2 Static-Meshes).

**Verifikation:** 37/37 Unit-Tests; Geisterhaus-Rennen ohne Fehler; Workbench-Previews:
Geist-Gesicht lesbar und auf der Fläche, Wimpel haengen korrekt.

## Runde 35 (23.09.2026): Sprungpilz-Facelift

Die Sprungpilze (mindestens zwei pro Strecke) bekommen eine gewellte Creme-Krempe am
Kapprand und vier zusaetzliche Sporen-Sprenkel auf dem Hut. Die Squash-Animation erfasst
die Deko automatisch (Gruppenskalierung). Korpus und Materialzuordnung unveraendert.
592 statt 536 Dreiecke, 48 KB. Blender-Quelle in art/r35/, Backup dort.

Unreal: Import validiert (/Game/MushroomRally/bouncepad_r35/, 6 Static-Meshes inkl. PadBrim).

**Verifikation:** 37/37 Unit-Tests; Kopflos-Chrome-Rennen ohne Fehler; Workbench-Preview mit
sauber sitzender Krempe.

## Runde 34 (23.09.2026): Item-Box-Facelift

Die schwebenden Item-Boxen (auf jeder Strecke, staendig im Blick) bekommen acht goldene
Eckkappen - als EIN gemergtes Mesh, also nur ein zusaetzlicher Zeichenaufruf fuer alle Boxen
einer Strecke. Bänder und Schleife sind jetzt sattes Gold mit leichtem Metallglanz statt
flachem Beige. Korpus, Masse und alle Mesh-Namen unveraendert (Instanz-System und
Drehradius greifen unverändert weiter). 492 statt 396 Dreiecke, 40 KB. Blender-Quelle in
art/r34/, Backup dort.

Unreal: Import validiert (/Game/MushroomRally/itembox_r34/, 7 Static-Meshes inkl. CornerCaps).

**Verifikation:** 37/37 Unit-Tests; Kopflos-Chrome-Rennen ohne Fehler; Workbench-Preview mit
sauber sitzenden Kappen.

## Runde 33 (23.09.2026): Schanzen-Facelift

Die Sprungschanzen (auf jeder Strecke, vor jedem grossen Sprung) bekommen Fussdeko: zwei
Holzbalken mit Streifenkante entlang der Flanken und je drei kleine Pilze (Stiel plus gewoelbte
Kappe) auf den Balken. Die Fahrflaeche, Masse und Materialzuordnung (RampPaint fuer die
Gelb-Toenung der Schluchtschanzen) bleiben unberuehrt - die Sprungphysik ist unveraendert.
680 statt 308 Dreiecke, 54 KB. Blender-Quelle in art/r33/, Backup des alten Modells dort.

Unreal: Import ins Showcase-Set (/Game/MushroomRally/ramp_r33/, 17 Static-Meshes mit aller
Deko) als Engine-seitige Strukturvalidierung.

Sound: Der ElevenLabs-Fundus (vier BGM-Loops plus SFX) ist vollstaendig im Spiel; neue
Generierungen waren nicht moeglich - in dieser Umgebung existiert kein ElevenLabs-Zugang
(API-Key/Werkzeug). Nachgereichte Clips lassen sich direkt einbinden.

**Verifikation:** 37/37 Unit-Tests; Kopflos-Chrome-Rennen ohne Fehler; Workbench-Preview mit
sauber sitzenden Balken und lesbaren Pilzen.

## Runde 32 (22.09.2026): Windringe und Praezisionsflug

Die Sprungringe haben ein eigenes Blender-Modell: ein schlanker tuerkiser Leuchtring,
sechs goldene Federpfeile und dunkle Verbindungen. Die Oeffnung bleibt frei; 1.536 Dreiecke,
44 KB GLB und zwei zusammengefuehrte Zeichenaufrufe pro Ring in der Browserfassung.
Die Ringe drehen langsam und leuchten beim Durchflug kurz auf.

Wer mit geoeffnetem Pilzgleiter hoechstens 1,35 m vom Ringmittelpunkt abweicht, bekommt
**Praezisionsflug**: 1,55 statt 1,30 Sekunden Ring-Turbo. Nur echte Gleitfluege zaehlen;
Rettungsdrops, Treffer und Anti-Grav-Ringe sind ausgeschlossen. Die Ergebnisanzeige zaehlt
Praezisionsfluege. Sprungweiten, Schwerkraft und Ring-Kontaktbereich bleiben erhalten.

Der Gleiter bekommt einen leisen Oeffnungsklang; Praezision nutzt einen weich gemischten
vorhandenen ElevenLabs-Effekt. Die normalen Ringtoene liegen tiefer und sind leiser.
Es wurden fuer dieses Update bisher keine neuen ElevenLabs-Generierungen berechnet.

**Lade-Fix R31:** Die vorhandenen drei Ladeversuche bleiben erhalten. Fehlende Prototypen
werden beim ersten Weltaufbau erfasst. Kommen sie nach dem Neun-Sekunden-Fallback doch an,
werden veraltete Strecken-Caches entfernt und das Menue einmal aktualisiert; im Rennen
wird der Neuaufbau bis zum Wechsel aufgeschoben. Ein dauerhafter Fehler loest keinen
nutzlosen Neuaufbau aus.

**Verifikation:** 37/37 Unit-Tests (Physik, Gleiter, Audio, Lader, Praezisionsflug).
Blender-Quellen und Unreal-Importskript liegen lokal unter `art/r32/`.

## Runde 30 (22.09.2026): Konfettistart, Ziel-Feuerwerk, Fahrer-Varianten

**Konfettiregen beim LOS!** Springt die Ampel auf Gruen, regnen 130 drehende Konfettizettel
(eigenes Instanz-System, nicht die kleinen Funken) ueber die Startaufstellung - acht Farben,
Schwanken und Taumeln im Fall, 2,6-3,8 s Lebensdauer. Erste Fassung mit 46 Funken-Partikeln war
zu blass; die Zettel-Version besteht die Sichtpruefung deutlich.

**Feuerwerk beim Zieleinlauf:** Wer ins Ziel kommt, bekommt drei gestaffelte Bursts ueber dem
Sporentor (Theme-Farben, weisse Glanzpunkte dazu) - sichtbar auch noch im Result-Schirm, weil
die Abarbeitung vor dem Spielzustands-Check laeuft.

**Fahrer-Varianten verjuengt:** Mochi (Katze) und Schildi (Schildkroete) bekamen groessere
Augen mit Highlights und rosige Wangen, Volt (Roboter) das breitere Mundband - derselbe
Charm-Pass wie Pilzi in Runde 29, per generischem Blender-Skript ueber die Mesh-Namen.
Backups aller drei Modelle in art/r29/.

**Verifikation:** 26/26 Unit-Tests; Kopflos-Chrome-Rennen ohne Fehler; Screenshots: Konfetti
klar als fallende Zettel lesbar, Feuerwerk als radiale Farbbursts ueber dem Tor.

## Runde 29 (22.09.2026): Glasbahn transparenter, Fahrer-Facelift

**Glasbahn:** 80 % Deckkraft war noch zu dicht - jetzt 60 % und die Emission von 0,85 auf 0,7
zurueckgenommen. Der Sternenhimmel scheint jetzt deutlich durch die Fahrbahn, auch unter den
Karts; Sichtpruefung bestaetigt: Glas-Lesbarkeit und Rennbarkeit bleiben erhalten.

**Fahrer-Facelift (Blender):** Die Fahrer wirkten aus der Distanz flach - Kappen lasen sich als
Blobs, Augen waren zu klein, Arme dünn. Pass auf dem bestehenden Modell (Struktur und Namen
unveraendert, damit Menue-Thumbnails und Podium-Referenzen weiterlaufen): Augen und Highlights
+38 %, Wangen +50 % und rosa statt blass, Mund 35 % breiter (Laecheln), Aermel +24 %, Ellbogen
und Handschuhe dicker, Kopf 4 % kleiner (Proportion), und ein Creme-Kappenrand (D_CapBrim,
20-seitiger Ring) gibt dem Pilzhut die fehlende Krempe. 6806 Dreiecke (+40), 252 KB. Backup
des alten Modells in art/r29/.

**Verifikation:** 26/26 Unit-Tests; Workbench-Preview (Front/Hero) und In-Game-Screenshots -
Augen mit Highlights von Startaufstellungs-Distanz lesbar, Krempe sitzt, keine Clipping- oder
Renderfehler.

## Runde 28 (22.09.2026): Sternenbahn als Glasbahn

Die Sternenbahn ist jetzt halbtransparent: Das Farbband bekommt `transparent:true` bei 80 %
Deckkraft, doppelte Seite und kein Tiefenschreiben - der Sternenhimmel (700 Punkte) scheint
durch die Fahrbahn, besonders in Kurven, an Kuppen und im Looping (Nutzerwunsch R28). Die
blickdichte dunkle Unterseite aus frueheren Runden entfiel dafuer; sie haette genau den Blick
auf die Sterne verbaut. Randsteine, Mittellinie und Energiebander bleiben opak, damit die Spur
lesbar bleibt. Sichtpruefung: Sterne durch die Bahn sichtbar, Farben kraeftig, keine
Transparenz-Artefakte.

**Verifikation:** 26/26 Unit-Tests; Regenbogen-Rennen im Kopflos-Chrome mehrfach ohne Spiel-
fehler durchlaufen.

**Nachtrag Hotfix (R28b):** Die Live-Seite hing danach im Ladeschirm fest. Ursache war ein Fehler
aus den Zielflaggen (R25), der beim Auslesen der sample()-Rueckgabe `p.x` statt `p.p.x` nutzte -
buildWorld crashte bei jeder Strecke, der Loader blieb stehen. Der isVector3-Fehler, den das
Verify-Skript schon vorher meldete, war genau dieser Bug (die Verwechslung als Skript-Artefakt
war falsch - die scheinbar sauberen Laeufe fingen ihn nur nicht ein). Nach dem Fix laedt das
Spiel lokal in ~10-15 s und live in ~10 s ohne Exceptions.

## Runde 27 (22.09.2026): Durchgaengige Bahnmagnetik in den Spiralen

In den Anti-Grav-Spiralen gab es innerhalb eines freien Bands (+/-7 m um die Ideallinie) keinerlei
Fuehrung - erst dahinter griff der starke Magnet. Wer in einem Korkenzieher lenkte oder getroffen
wurde, sackte seitlich weg und klebte an der Energiebande, bis die Zone endete (Nutzerbericht;
im deterministischen Sim-Test: Voll-Lenkung trieb das Kart auf 8,4 m Versatz, 5 von 6 Messpunkten
klebten am Rand).

Drei Aenderungen zusammen, jede allein ungenuegend:
- **Winkel-Klemme:** Das Kart steht in Rollzonen maximal 20 Grad schraeg zur Bahn. Die Lenkrate
  dort (Grip 2,3) schlug jede weiche Richtungsnachfuehrung - das Kart stand quer und sackte durch
  die Kurve. Mit Klemme fuehrt die Bahn, Lenken waehlt die Linie.
- **Freies Band von 7 auf 3,2 m verkleinert:** der bewaehrte starke Magnet greift frueher.
- **Grundzug im Band:** proportionaler Zug zur Mitte plus Cap der Drift nach aussen (~3,2 m/s).

Sim-Test (Neon-Korkenzieher, Zeitfahren, gesetzt Start, Dauer-Voll-Lenkung):
**maximaler Versatz 8,45 -> 6,08 m, Kleben am Rand 5/6 -> 0/5 Messpunkte**, Rueckkehr nach
Zonenende. Die Ideallinie bleibt unberuehrt (unter 0,4 m wirkt nichts): Autopilot-Regression auf
Neon, Geisterhaus und Lava-Feste mit 0 Respawns, Geisterhaus-Mindesttempo sogar 15,8 -> 26 m/s.

**Verifikation:** 26/26 Unit-Tests; deterministischer Zone-Sim (art/r27_sim.mjs) vorher/nachher;
Autopilot-Runden Neon/Geisterhaus/Lava ohne Zuruecksetzungen.

## Runde 26 (21.09.2026): Fahrflow - Kanten-Gnade, offene Looping-Spirale, glatte Rampenflanken

**Die Ursache fuer haengenbleibenden Fahrflow war messbar:** Der Autopilot stuerzte auf dem
Sonnen-Canyon 429- und auf der Sternenbahn 372-mal je Rennen in einen Respawn-Zyklus -
immer an derselben Stelle. Wer eine Schlucht knapp zu kurz sprang, kreuzte die Landekante UNTER
Kantenniveau, und die Absturzpruefung (y < ground-1.5) lief VOR der Landung: Respawn am
Rettungspilz, wieder anrollen, wieder zu kurz - Endlosschleife. Menschen merken dasselbe als
"bleibe haengen" und "kein smoother Flow".

**Kanten-Gnade:** Wer die Landekante weniger als 6 m unter Niveau kreuzt, knallt jetzt hart auf
die Fahrbahn und faehrt weiter (mit Squash und Kamera-Ruck - es soll weh tun, aber im Rennen
bleiben). Canyon: **429 -> 0** Respawns, Regenbogen: **372 -> 3**, Geisterhaus und Lava-Feste
bleiben bei 0.

**Looping-Spirale geoeffnet (Nutzerwunsch):** Der Looping war ein geschlossener Tropfen -
Einfahrt und Ausfahrt trafen sich im selben Punkt. Jetzt schiebt ein linearer Vorschub
(gap = 34 % des Radius, ~9 m) die Ausfahrt seitlich vorbei: eine echte Achterbahn-Spirale.
Sichtpruefung bestaetigt zwei getrennte Fahrbahnbaender am Boden; Zeiten unveraendert.

**Haengenbleiben generell:** Die Stuck-Befreiung (1,6 s Gas ohne Tempo -> Rettungspilz) gilt
jetzt auch fuer den Spieler (2,6 s, erst nach dem Countdown - der Raketenstart darf nicht
ausloesen). Wer irgendwo an Deko oder in einer Spirale festhaengt, kommt ohne Taste R frei.

**Zwei Glättungen gegen Holpern:** Der Sichthub der Anti-Grav-Bahn baut sich ueber die letzten
38 % statt 30 % der Zone ab - der gemessene Geschwindigkeitsruck am Zonenaustritt sank von 13
auf 9,2 m/s (Geisterhaus). Rampenflanken (Viadukte, Plateaus) steigen statt mit smoothstep
(C1) jetzt mit smootherstep (C2) - die Steigung ist an den Flankenenden stetig, Hoehen
unveraendert.

**Verifikation:** 26/26 Unit-Tests; Autopilot-Runden auf allen sechs Strecken (0-5 Rest-Respawns,
Rundenzeiten im Medaillenrahmen); Looping-Screenshot mit getrennter Ein-/Ausfahrt.

## Runde 25 (21.09.2026): Wehende Zielflaggen am Start-Ziel-Bereich

Links und rechts neben dem Sporentor stehen jetzt zwei sieben-Meter-Masten mit grossen
Schachbrett-Fahnen (3,0 x 1,8 m), die im Wind der Wimpel-Leinen wiegen - dieselbe
Vertex-Animation, mit eigener Amplitude (`amp`), weil die Tuecher groesser sind. Die Flaggen
ragen von aussen ueber die Streckenraender, ohne die Durchfahrt (Halbbreite 7,6 m) oder die
Ampelzone zu beruehren; die Masten haben Kollisionskreise. Zwei Draw Calls gesamt (Masten
gemergt, Fahnen gemergt), die Schachbrett-Textur teilt sich die Palette mit der Ziellinie.

Dazu: Hochformat-Keyart fuer Social-Posts erneuert (`media/keyart_hoch.jpg`, 1080x1920 aus
dem Unreal-Keyart-Level, gleiche Session wie Runde 24).

**Verifikation:** 26/26 Unit-Tests; Kopflos-Chrome-Start ohne JS-Fehler; Screenshot-Check -
beide Masten und Fahnen sichtbar, Textur richtig gemappt, kein Clipping mit Tor, Ballons oder
Karts.

## Runde 24 (21.09.2026): Keyart mit Sporentor und Ballonbogen

Das Vorschaubild beim Teilen (`assets/keyart.jpg`, og:image) zeigte noch den Stand vor Tor und
Ballonbogen. Im Unreal-Keyart-Level (`L_MR_Keyart`, Projekt test123 5.8) stehen jetzt sieben
Ballonhuellen im Bogen hinter dem Tor (Showcase-Materialvarianten `MI_Balloon_0..3`), und der
SceneCapture schaut neu: Kart mit Fahrer vorne, Sporentor mittig, Ballonbogen als Tiefenschicht
- Abendlicht, 1920x1080.

Der RT-Export fiel als Float-PNG unlesbar aus; gesetzt hat schliesslich der bewaehrte Weg aus
Runde 20: Viewport-Kamera auf die Capture-Pose (`set_level_viewport_camera_info`) und
`HighResShot` - der Viewport bringt seine eigene belichtete Nachbearbeitung mit. JPG-Umwandlung
per GDI+ (Qualitaet 88, 138 KB). Altes Bild als `art/r24/keyart_r19_backup.jpg` gesichert.

**Verifikation:** Sichtpruefung des Renders (Tor prominent, Ballonbogen lesbar, Belichtung
warm, Komposition share-tauglich); Level gespeichert.

## Runde 23 (21.09.2026): Ballonbogen am Start

Zwoelf Meter hinter dem Start-Ziel-Tor spannt sich jetzt ein Bogen aus sieben Heissluftballons
ueber die Fahrbahn, an einem Seil aufgehaengt, das an zwei Pfosten im Boden verankert ist. Beim
Countdown steht er hinter dem Sporentor im Bild, beim Zieleinlauf faehrt man durch ihn hindurch
ins Ziel. Die Ballonkoerbe haengen in Bogenform (Scheitel 12,6 m), die Farben rotieren durch die
Fan-Palette, auf Leuchtstrecken bekommen die Huete einen sanften Emissionsanteil.

Kosten: alle sieben Ballons teilen sich vier Instanz-Meshes (`scatterColored`, CapPaint je
Instanz gefaerbt), dazu Seil (CatmullRom-Tube) und Pfosten - **6 Draw Calls** gesamt.

**Verifikation:** 26/26 Unit-Tests; Kopflos-Chrome-Start ohne JS-Fehler, Bogen im
Startaufstellungs-Screenshot vollstaendig (bunt, verankert, kein Clipping mit dem Tor).

## Runde 22 (21.09.2026): Sporentor - neues Start-Ziel-Tor

Das Start-Ziel-Tor war das letzte einfache Bauwerk im Spiel: zwei duenne Pfosten, ein schmaler
Balken, zwei Pilzkappen. Jetzt steht dort das **Sporentor**: konische Creme-Pfeiler mit Sockel
und Wulstringen, breite Pilzkappen mit Lamellen und Sporenpunkten als Kapitell, ein gebogener
Rotbalken mit Konsolen und Creme-Bannerband, darueber eine ganze Pilzhut-Markise mit
hochgezogenen Traufen, Sporenpunkten und Finial, zwei warm leuchtende Haengelaternen und vier
kleine Fusspilze an der Basis. **1810 Dreiecke, 46 KB** - weniger als die Haelfte der alten
Datei (1412 Dreiecke, 114 KB), weil die alten Kugel-Sporen entfielen.

Die Kopplungen blieben unangetastet: Pfeiler bei +/-9,3 m (Kollisionskreise), Ampelzone
4,8-6,4 m frei, Balken nur 0,48 m dick, damit die MUSHROOM-RALLY-Labels bei z=+/-0,26 weiterhin
vor dem Bauwerk schweben. Einzige Codezeile: die Pilzkappen (Material `CapPaint`) werden je
Strecke auf `theme.caps[0]` getoent - das Tor traegt jetzt Waldrot, Canyon-Orange,
Neon-Pink, Geister-Violett, Lava-Orange und Regenbogen-Pink.

Blender-Quelle in `art/r22/` (create_gate.py, gate_r22.blend, Backup des alten Tors);
Workbench-Previews bestanden die Sichtpruefung nach zwei Iterationen (Kappen sind Gewoelbe,
keine Truechter - die Umkehr der Profilformel war der Knackpunkt).

Unreal: Tor als `gate_r22` ins Showcase-Projekt importiert (test123 5.8,
`/Game/MushroomRally/gate_r22/`), im Keyart-Level `L_MR_Keyart` bei (0, -1000) auf der
Strasse platziert und gespeichert; Viewport-Nachweis in `art/r22/unreal_gate_view.png`.

**Wetter-Wolken dazu:** Canyon und Lava-Feste waren die einzigen wolkenlosen Tageslicht-Strecken.
Jetzt haengen ueber dem Sonnen-Canyon warm leuchtende Abendwolken und ueber der Lava-Feste
dunkle Glutwolken (`theme.cloudCols`, flache Kugelhaufen mit Emissionsanteil, ein Draw Call je
Strecke). Forest behaelt seine weissen Wolken.

**Verifikation:** 26/26 Unit-Tests; Kopflos-Chrome-Rennen ohne JS-Fehler, Tor im
Startaufstellungs-Screenshot vollstaendig (Banner lesbar, Ampel sichtbar, keine Glitches);
Canyon-Screenshot mit Abendwolken verifiziert.

## Runde 21 (20.09.2026): Neon-Torbogen

Der Neon-Pilzwald war die letzte Strecke ohne Durchfahr-Bauwerk. Jetzt steht dort ein Torbogen:
zwei Pfeiler mit Leuchtroehren, drei gestaffelte Daecher mit hochgezogenen Traufen, ein Banner
ueber der Fahrbahn und Laternen an den Traufen. 40 m breit, 29 m hoch, **480 Dreiecke, 46 KB**.

Die Leuchtroehren bleiben als eigene Materialien stehen, weil `mergeByMaterial` emissive
Materialien nicht zusammenfasst - alles andere faellt in einen einzigen Zeichenaufruf. Die
Strecke kostet dadurch praktisch nichts: 151 statt 153 Draw Calls.

Das Bauwerk-System aus Runde 17 hat dafuer gereicht, es brauchte nur einen Eintrag in `BUILDINGS`
und `builds:[[11.45,'neongate']]` an der Strecke.

## Runde 20 (20.09.2026): Pilzgleiter

Nach einer Schanze oder einem Sprungpilz klappt jetzt ein Gleitschirm auf. Er ist **rein
optisch**: Sprungweite, Schwerkraft und Renngleichgewicht bleiben unveraendert - die Rundenzeit
auf der Pilz-Promenade liegt mit und ohne Schirm bei 86,3 s.

Die Ausloeselogik steht als eigenes Modul `glider.mjs` neben der Darstellung, damit sie ohne
Browser pruefbar ist:
- Nur Schanze und Sprungpilz spannen den Schirm vor, nichts anderes.
- Es braucht mindestens 0,12 s Flugzeit **und** 0,7 m Abstand zum Boden. Rettungssprunge,
  Treffer-Huepfer und kleine Bodenwellen loesen dadurch nichts aus.
- Landung, Treffer, Rollzone und Zieleinlauf falten ihn sofort wieder ein.
- Das Auf- und Zuklappen laeuft bildratenunabhaengig (`1-exp(-rate*dt)`).

Das Modell (`assets/glider.glb`, 56 KB, 2527 Dreiecke, vier Materialien) entsteht in Blender;
die Quellen liegen in `art/r20/`. Faellt die Datei aus, baut `fallbackGlider()` einen Ersatz im
Code - und der Schirm steht in der Signatur des Kart-Pools, damit nicht versehentlich der
Ersatzschirm zwischengespeichert wird.

Der Schirm uebernimmt die Lackfarbe des Karts. Beim ersten Aufklappen im Rennen erscheint der
Hinweis "PILZGLEITER! DRIFT = TRICK".

**Verifikation:** 20 Unit-Tests (Kern und Gleiter) plus 6 fuer die Tonmischung. Die Tonreihe lief
bisher nie mit - sie stand in keiner Testzeile und ist jetzt in `npm test` aufgenommen. Alle
sechs Strecken im Autopilot durchgefahren, der Schirm oeffnet auf jeder (6-18 Messpunkte je
Runde), 95-163 Draw Calls.

## Runde 19 (20.09.2026): Schluesselbild aus Unreal

Das Unreal-MCP war wieder erreichbar, also ist der Showcase dort nachgeholt worden. Im Projekt
`test123 5.8` liegt jetzt ein eigenes Set unter `/Game/MushroomRally/` mit dem Level
`L_MR_Keyart` - das vorhandene Level `L_Kristalljaeger` bleibt unberuehrt.

Die GLB-Modelle des Spiels (Kart, Fahrer, Rad, Pilz, Baum, Item-Box, Wurzeltor) sind importiert
und zu einer Szene zusammengesetzt: Fahrbahn mit Randsteinen und Mittellinie, das Wurzeltor
darueber, Pilze und Baeume am Rand, Abendsonne mit Himmelsatmosphaere und Bodennebel.

Zwei Stolpersteine dabei, beide nicht offensichtlich:
- **Der Himmel blieb schwarz**, bis am Richtungslicht `atmosphere_sun_light` gesetzt war. Ohne
  das beleuchtet die Sonne die Atmosphaere nicht, und damit fehlt auch das gesamte Umgebungslicht.
- **Die Aufnahme kam fast schwarz heraus**, weil eine SceneCapture ihre eigene Nachbearbeitung
  hat und das unbegrenzte PostProcessVolume nicht uebernimmt. Belichtung also direkt an der
  Aufnahme setzen (Histogramm, `always_persist_rendering_state`, mehrfach aufnehmen, damit sich
  die Belichtung einpendelt).

Das Ergebnis ersetzt `assets/keyart.jpg` - das ist das Vorschaubild, das beim Teilen des Links
angezeigt wird (`og:image`). Hochformat fuer Social-Posts liegt in `media/keyart_hoch.jpg`.

## Runde 18 (19.09.2026): Beschleunigungsstreifen, kein Tempoverlust mehr in den Spiralen

**Warum man in den Spiralen haengen blieb - drei Ursachen, alle gemessen.**

1. *Die Offroad-Bremse griff auf der schwebenden Bahn.* Neben einer Anti-Grav-Bahn gibt es kein
   Gelaende - sie schwebt, daneben ist nichts. Trotzdem galt dort das Offroad-Hoechsttempo von
   12,5 m/s. Wer einen Meter zu weit aussen fuhr, wurde also auf Schrittgeschwindigkeit gebremst.
2. *Die Seitenhaftung war die normale.* Auf einer magnetisch haltenden Bahn schob das Kart quer
   weg (gemessene Querbewegung bis 10 m/s) und landete damit erst recht zu weit aussen.
3. *Der Boden fiel neben der Bahn ab.* Dadurch loeste sich der Haltemagnet, das Kart fiel heraus -
   und der Rettungspilz setzte es auf die **Sichthoehe** der schwebenden Bahn, also 12,5 m ueber
   dem physikalischen Boden. Von dort fiel es wieder. Auf der Lava-Feste ergab das 28
   Zuruecksetzungen je Rennen und eine Rundenzeit von 184 statt 90 Sekunden.

Dazu kam ein Feuerball mitten im Korkenzieher: in einer Rollzone bildet der Querversatz auf die
Hoehe ab, das Pendel stand deshalb in x/z still auf der Mittellinie - genau auf der Ideallinie -
waehrend die Kollision weiter flach rechnete. Pendel und Geister werden jetzt aus Rollzonen
herausgeschoben.

Gemessen im Korkenzieher, vorher/nachher: **10,8 -> 30,5 m/s Mindesttempo**, Lava-Feste im
Zeitfahren **184 -> 89,9 s**, Zuruecksetzungen **28 -> 0**.

**Beschleunigungsstreifen:** drei je Rollzone, breiter als die normalen (12,4 m statt 11 m) und
mit groesserem Auffangband, weil man sie beim Drehen sonst verfehlt. Turbo liegt jetzt auf
71-96 % der Zonenlaenge an.

**Spiralen laenger:** alle Zonen noch einmal gestreckt, jetzt 85-147 m statt 59-113 m.

**Tempolinien beim Turbo** waren in CSS und im Code laengst vorhanden - nur das Element fehlte im
Markup, die Funktion war also tot. Jetzt ziehen die Striche wieder vom Bildrand nach innen.

**Verifikation:** Alle sechs Strecken im Autopilot bei 100 ccm durchgefahren (89,8 / 144,9 / 83,3
/ 106,4 / 97,6 / 117,5 s), Plaetze 1-5, keine Zuruecksetzungen, 92-157 Draw Calls, 15/15
Unit-Tests. Medaillenzeiten fuer Neon-Pilzwald, Lava-Feste und Sternenbahn neu kalibriert,
`LAYOUT_VER` auf 18.

## Runde 17 (19.09.2026): Wurzeltor, einseitige Korkenzieher, freie Sicht, lauterer Sound

**Looping mit Tropfenform.** Ein geschlossener Kreis liess Ein- und Ausfahrt uebereinanderliegen.
Jetzt Tropfen (unten enger, oben runder) und deutlich mehr Vorlage: der Fussabdruck ist von
R*1,26 auf R*1,85 gewachsen, Ein- und Ausfahrt laufen sichtbar auseinander.

**Korkenzieher drehen nur noch in eine Richtung.** Vorher drehten sie ein und wieder zurueck -
dieses Gegenlaufen war der Grund fuers Verkanten. Jetzt: eindrehen, den Winkel ein Stueck halten,
in derselben Richtung bis zur vollen Umdrehung weiterdrehen. Zwei Bauarten:
- `wall` haelt 90 Grad Wandfahrt,
- `over` haelt kopfueber.

Alle Anti-Grav-Abschnitte sind deutlich gestreckt (die Drehung war zu hastig), und im
Neon-Pilzwald liegt der Korkenzieher jetzt **im Neontunnel** - das Gewoelbe dreht mit.

**Freie Sicht in den Spiralen.** Die Fahrbahn ist ein 17,8 m breites Band, das um die Mittellinie
schwenkt. Alles, was naeher als die halbe Bahnbreite an dieser Achse sitzt, wird davon
ueberstrichen - und die Kamera sass 3,7 m ueber der Bahn, also mitten drin. Gemessen per
Strahlentest: in 19-45 % der Bilder lag etwas zwischen Kamera und Kart. Jetzt rueckt die Kamera
in Rollzonen nach aussen und dafuer naeher heran, folgt der Steigung der sichtbaren Fahrbahn und
setzt sich auf die Bahn an ihrer eigenen Stelle. Ergebnis: **0-8,8 %**. Stuetzen stehen nur noch
unter kaum gedrehter Fahrbahn.

**Wurzeltor** (neu, in Blender gebaut): zwei Baumstaemme mit Wurzelfaechern, ein Bogen aus
Wurzeln darueber, Laubdach, haengende Ranken, Pilze am Fuss - 95 KB. Das Bauwerk-System ist
dafuer verallgemeinert: `BUILDINGS` beschreibt Kollider und Sperrzone je Bauart, und eine Strecke
kann mehrere Bauwerke tragen (`course.builds`).

**Ein Fehler, der lange schlummerte:** weit neben der Fahrbahn wurde die gerollte Abbildung
benutzt. In einer Rollzone steht die Bahn senkrecht, dort zeigt die Querachse nach oben - ein
Querversatz von 19 m landete damit senkrecht ueber der Mittellinie. Tribuene und Baeume standen
also mitten auf der Strecke; die Pilz-Promenade brauchte dadurch 189,6 statt 99,4 s. `sample()`
rechnet ab 10,6 m Querversatz jetzt flach.

**Leichter:** 100 ccm von ai .91 / skill .68 auf .855 / .52, Aufholhilfe von .035 auf .055.

**Sound:** Effekte lagen auf .6 und gingen in der Musik unter. Jetzt Effekte auf 1,25, Musik von
.62 auf .46, und die Klangangleichung hebt auf Effektivpegel .20 statt .12 an. Neu von
ElevenLabs: Zuschauerjubel, Turbo, Rundenglocke, Rempler und Driftquietschen.
**Die Musik konnte nicht erzeugt werden - das ElevenLabs-Konto hat dafuer zu wenig Guthaben**
(Effekte 50 Credits, Musik 900).

**Tribuene** besteht jetzt aus drei Segmenten statt einem - rund 50 statt 16 m.

**Verifikation:** Alle sechs Strecken im Autopilot bei 100 ccm durchgefahren (99,4 / 127,1 /
98,3 / 108,0 / 95,6 / 123,9 s), Platz 1-5 statt durchweg hinten, 89-158 Draw Calls, 15/15
Unit-Tests. Medaillenzeiten fuer Sonnen-Canyon, Neon-Pilzwald und Sternenbahn neu kalibriert,
`LAYOUT_VER` auf 17.

## Runde 16 (19.09.2026): Looping neu gebaut, Anti-Grav ohne Ruckeln

**Looping: von Grund auf anders.** Bisher wurde eine 360-Grad-Kehre waagerecht in die Mittellinie
eingesetzt und nur im Bild aufgestellt. Gefahren wurde also eine unfahrbar enge Kurve. Gemessen:
das Kart brach zweimal je Runde von 28 auf 7,6 m/s ein, die Strecke kreuzte sich selbst, und am
Ausgang sprang das Kart 30 m weit.

Jetzt bleibt die Mittellinie unangetastet. Ein kurzes, moeglichst gerades Stueck Fahrbahn (34 m)
wird im Bild zu einem senkrechten Kreis aufgestellt — gefahren wird geradeaus. Damit das Bild
nicht im Zeitraffer laeuft, wird der Vorschub auf der Fahrbahn um genau den Faktor gebremst, um
den das Bild gestreckt ist (`moveMul` in `driveKart`). Der Winkel faehrt weich an und aus, sodass
die Bildgeschwindigkeit an beiden Enden stetig uebergeht.

Messung vorher/nachher im Looping: Tempo 7,6–28 → 30–38,6 m/s, groesster Bildsprung 30 m → 0,87 m,
Hoehe 55,6 m, Durchfahrt 7,9 s.

**Anti-Grav: vier Ursachen fuer das Ruckeln.**

1. *Darstellungswechsel.* Kart und Kamera schalteten erst bei Rollwinkel 0,004 auf die gehobene
   Fahrbahnabbildung um. Der Sichthub faehrt aber viel frueher hoch — die Fahrbahn stand schon
   4,2 m hoch, waehrend das Kart noch auf dem Boden gezeichnet wurde, und sprang dann in einem
   Bild hinterher. Jetzt laeuft immer derselbe Weg; ohne Rolle und Hub liefert er exakt die
   physikalische Lage, flach aendert sich also nichts.
2. *Bezugshoehe.* Als Hoehe wurde der Abstand zu `groundAt()` eingesetzt — das rechnet neben der
   Fahrbahn die Boeschung mit ein. Wer mit Querversatz ueber 8,9 m in eine Rollzone einfuhr,
   sprang 1,95 m nach oben. Bezug ist jetzt die Fahrbahnebene selbst.
3. *Tabellenraster.* Rollwinkel und Sichthub kamen aus einer Tabelle mit 2048 Stuetzstellen; linear
   dazwischen heisst treppenfoermige Drehrate. Jetzt analytisch und C2-glatt (smootherstep), damit
   auch die Drehbeschleunigung an den Raendern stetig ist.
4. *Projektion.* `project()` rechnete gegen die naechstgelegene Stuetzstelle. Die wechselt bei
   Tempo fast jedes Bild, und mit ihr springen Bezugspunkt und Tangente — gemessen bis 0,33 m
   Querversatz von Bild zu Bild. Flach faellt das kaum auf, senkrecht wird daraus eine Hoehe.
   Jetzt wird auf das Streckensegment projiziert und die Tangente interpoliert.

Groesster Bildsprung in den sieben Rollzonen aller Strecken: 4,1 m → 0,06–0,35 m.

**Fuehrung:** In Rollzonen wird die Fahrtrichtung gedreht statt das Tempo gedaempft — Daempfen
kostet Schwung, und genau dieser Tempoverlust fuehlte sich wie Anecken an.

**Grafik und neue Ideen:** Der Looping bekommt ein Traggeruest wie eine Achterbahn (zwei Holme
entlang der Bahn, Querstreben, Neonringe am Fuss) und ein Leuchtband auf der Fahrbahn. Das
Energieband der Anti-Grav-Bahn bekam seine Textur nie — `boostTex` entstand erst nach dem
Strassenbau; jetzt wandert es wieder. Neu: **Looping-Schwung** (sauber durchfahren gibt Boost)
und eine Funkenspur bei Ueberkopf-Fahrt.

**Verifikation:** Alle sechs Strecken im Autopilot durchgefahren (99,4 / 122,4 / 100,2 / 93,4 /
98,3 / 115,0 s bei 150 ccm), KI 0,5–9,3 % neben der Strecke, 49–141 Draw Calls, 15/15 Unit-Tests.
Medaillenzeiten fuer Sonnen-Canyon und Sternenbahn neu kalibriert (die Rundenlaenge hat sich
geaendert, weil der Looping keine 224 m mehr in die Mittellinie einsetzt), `LAYOUT_VER` auf 16.

## Runde 14/15 (19.09.2026): Looping, Sternenbahn, ruhigere Fuehrung

**Looping (neu):** Der Sonnen-Canyon hat jetzt ein echtes Looping — 55 m hoch, oben faehrt man
ueber Kopf. Technisch wird nach der Kurvenglaettung eine 360-Grad-Kehre in Tropfenform in die
Mittellinie eingesetzt (Tropfen statt Kreis, damit der Einlauf weich ist), und beim Zeichnen wird
diese Kehre senkrecht aufgestellt. Physik und Projektion arbeiten weiter flach, deshalb musste am
Rest nichts geaendert werden. Punkte, die die Schleife ueberholt, werden aus der Mittellinie
entfernt — sonst sprang die Linie am Ausgang 40 m zurueck.

**Sternenbahn (neu, 6. Strecke):** schwebt frei im Weltall — kein Boden, keine Boeschung, wer
herunterfaellt, faellt ins Leere. Leuchtende Farbbahn, die langsam wandert, schwebende
Kristallinseln, Sternenstaub. Mit Korkenzieher, Wandfahrt, Sprung und eigenem Looping.

**Ruhiger fahren:** Die Fuehrung in Spiralen und Looping wirkt jetzt wie Seitenhaftung statt wie
eine Wand: innerhalb von +-6 m ist das Lenken voellig frei, darueber zieht es ueber die
Geschwindigkeit zurueck statt die Position zu verschieben (ein Positions-Snap fuehlt sich beim
Fahren wie Verkanten an). In Roll- und Loopzonen greifen die Leitplanken nicht mehr zusaetzlich —
vorher korrigierten zwei Systeme gegeneinander.

**Kamera:** flach, Spirale und Looping laufen jetzt ueber *eine* Kameraführung. Position,
Hochachse und Blickpunkt kommen aus demselben Rahmen und werden durchgehend geglaettet; vorher
waren es drei Modi mit harten Umschaltern, genau dort ruckte das Bild.

**Gemessen** (Autopilot, Klasse Wild): alle sechs Strecken fahren durch — 94,3 / 140,6 / 88,4 / 101,6 /
100,8 / 129,4 s, KI 0,1–6,4 % neben der Strecke. Medaillenzeiten fuer Canyon und Sternenbahn
neu gesetzt, alte Rekorde einmalig verworfen (`LAYOUT_VER=15`).

## Runde 13 (18.09.2026): Korkenzieher, kein Haengenbleiben, vier Karts

**Anti-Grav, zweite Stufe:** Die Rolle wirkt jetzt nur noch auf die Darstellung — gefahren wird
weiter in der flachen Streckenebene, die Drehung und der Sichthub kommen erst beim Zeichnen dazu.
Damit sind Dinge moeglich, die die physikalische Neigung nicht konnte: **volle Korkenzieher
(360 Grad)** auf Neon-Pilzwald und Lava-Feste, eine **Ueberkopf-Passage** im Geisterhaus und
steilere Waende (bis 84 Grad) im Wald, Canyon und Neonwald. Dazu Energieband, Torringe an Ein- und
Ausfahrt und Pylonen unter der schwebenden Bahn. Wer sauber durchkommt, bekommt beim Ausgang einen
**Anti-Grav-Schub**.

**Kein Haengenbleiben mehr:** Die Felsen am Tunnel hatten Kollisionskoerper direkt hinter der
Tunnelwand — die sind weg. Leitplanken laufen jetzt auch durch Tunnel, Villa und Burg (dort standen
vorher Feuerschalen und Mauern ungeschuetzt). Aus dem Abprallen an Hindernissen ist ein
Entlanggleiten geworden (Rueckstoss 1,06 statt 1,4, Tempoverlust hoechstens 35 statt 60 Prozent),
und wer mit Gas laenger als 1,6 Sekunden fast steht, wird automatisch zurueckgesetzt.

**Drift haelt die Linie:** Seitenhalt im Drift von 2,6 auf 4,4 erhoeht, der Driftwinkel ist bei
etwa 27 Grad gedeckelt, der Schub nach aussen halbiert, Einstieg ab 9 statt 11 m/s und die
Drift-Turbos laden schneller (0,55 / 1,15 / 1,9 s statt 0,7 / 1,4 / 2,3 s). Driften traegt jetzt
nicht mehr von der Strecke, sondern zieht die Kurve enger.

**Vier Karts statt einem:** Jede Figur faehrt ihr eigenes Kart mit eigenen Werten und eigenem
Heckteil — Pilzi "Sporenflitzer" (ausgewogen), Schildi "Panzerwagen" (Hoechsttempo +9 %,
Beschleunigung -13 %, Heckfluegel), Volt "Voltstoss" (Beschleunigung +18 %, Auspuffrohre und
Ueberrollbuegel), Mochi "Kurvenkatze" (Lenkung +15 %, Diffusor und Seitenschweller).

**Item-Fenster:** Die Symbole sind jetzt gerenderte Bilder der echten Modelle (Panzer, Banane,
Item-Box, Bombe) bzw. extrudierte Formen fuer Blitz und Stern — kein Emoji und kein flaches Icon
mehr.

**Gemessen** (Autopilot, Klasse Wild): alle fuenf Strecken 93,1 / 104,5 / 95,1 / 102,2 / 102,5 s,
Medaillenzeiten neu gesetzt, alte Rekorde einmalig verworfen (`LAYOUT_VER=13`).

## Runde 12 (18.09.2026): Ruckler am Start behoben, Grafikschalter, Anti-Grav

**Rennstart:** Karts, Raeder und Fahrerinstanzen bleiben zwischen Rennen stehen, solange Figur,
Farbe und Feldgroesse gleich sind — der Start kostet damit 5–12 ms statt bis zu 600 ms, weil
nichts mehr neu gebaut und zur Grafikkarte geschoben wird. Schattenkarte von 1024 auf 768,
engerer Schattenausschnitt, Aufloesung standardmaessig auf 1,25 gedeckelt.

**Grafikstufe von Hand:** Im Menue gibt es jetzt Auto / Mittel / Sparsam. Gemessen auf einem
ausgelasteten Rechner (Unreal und Blender liefen parallel): 47 / 35 / 13 ms je Bild. Auto regelt
weiterhin selbst nach, jetzt schon waehrend des Countdowns und alle 1,2 s statt alle 2 s.

**Anti-Grav (neu):** Die Streckentabelle hat eine Rollachse (`TP.rl`). Markierte Abschnitte kippen
die Fahrbahn um die Fahrtrichtung, die Mittellinie hebt sich dabei an, sodass eine echte Wand
entsteht statt einer Grube. Die Fahrbahn haelt magnetisch fest (sonst wirft die Kuppe jeden ab),
die Kamera rollt zu 90 % mit, die Raeder klappen nach aussen, Leitplanken und Randsteine folgen
der Drehung, darunter liegt ein dunkler Kiel. Die Projektion rechnet den verkuerzten
Horizontalabstand wieder auf den echten Querabstand zurueck, damit Physik und Optik zusammenpassen.
Abschnitte: Neon-Pilzwald (75 m, 58°) und Lava-Feste (ca. 48 m, 56°).

**Gemessen** (Autopilot, Klasse Wild, 3 Runden): alle fuenf Strecken fahren durch — 92,2 / 109,9 /
100,8 / 99,8 / 95,6 s, KI 0,3–5,6 % neben der Strecke. Medaillenzeiten fuer Neon-Pilzwald und
Lava-Feste neu gemessen, alte Rekorde einmalig verworfen (`LAYOUT_VER=12`).

**Noch offen:** Echte Loopings und Korkenzieher (Fahrbahn ueber Kopf) brauchen eine
Streckentabelle in 3D — die aktuelle Tabelle ist eine Funktion ueber x/z und kann sich nicht
selbst ueberlagern. Die Wandfahrten sind der erste Schritt dahin.

## Runde 11 (18.09.2026): Lava-Feste, Fahrer-Vorschau, neues Item-Fenster

**Neue Strecke "Lava-Feste"** (eigene Welt, kein fremdes Markenmaterial): schwarze Basaltnadeln,
gluehende Lavaseen, Vulkane am Horizont, Glutflocken in der Luft und ein Lavameer statt Wasser.
Die Strecke fuehrt durch eine **Torburg** mit Spitzbogen, Zinnen, Fallgitter, Bannern und
Feuerschalen (in Blender gebaut, nach Material zusammengefasst). Dazu ein Magmaschacht-Tunnel,
ein Sprung ueber eine Lavaschlucht, ein Viadukt und drei **Feuerbaelle**, die quer ueber die
Fahrbahn pendeln. Layout mit zwei langen Geraden und einer S-Passage: KI faehrt 0,4 % der Zeit
neben der Strecke (erster Entwurf lag bei 10,5 %), engster Radius 23,7 m, Rundenzeit 91,8 s.

**Fahrer-Vorschau:** Die Auswahl im Menue zeigt die Figuren jetzt als kleine gerenderte Bilder
(Render-Target aus dem laufenden Renderer, einmal beim Start und bei jedem Farbwechsel neu) statt
als Emoji — inklusive der gewaehlten Kartfarbe.

**Item-Fenster:** Statt Emoji jetzt gezeichnete SVG-Symbole (Turbo, Panzer, Banane, Schild,
Bombe, Dreifach-Turbo mit Zaehler), Rahmen und Schein in der Item-Farbe, Pop-Animation beim
Erhalten und ein Zittern waehrend die Item-Walze laeuft.

**Nachladen:** Villa und Burg (zusammen ~2 MB) werden erst nach dem Spielstart geladen; die
betroffenen Strecken bauen sich danach automatisch neu. Der Start wartet nicht mehr darauf.

## Runde 10 (18.09.2026): Menue im Spiel-Look, Tunnel & Bruecken, vier Fahrerfiguren

**Menue:** Statt Formularleisten jetzt eine Karte mit Glas-/Schattenrand, Marken-Kopf und eigener
Schrift (Baloo 2). Jede Strecke ist eine Bildkarte: Der Mini-Streckenplan wird aus derselben
Mittellinie gezeichnet, die auch im Spiel gefahren wird (Canvas, einmal pro Strecke), dazu Icon,
Name, Bestzeit/Medaille und die Themenfarben der Welt als Verlauf. Neu ist eine Fahrerauswahl
neben der Kartfarbe; die Wahl wird gespeichert und sofort im Startfeld gezeigt.

**Fahrerfiguren:** Es gibt vier statt einer: Pilzi (Pilz), Schildi (Schildkroete mit Panzer und
Schwimmbrille), Volt (Roboter mit Visier und Antenne) und Mochi (Katze mit Helm). Alle in Blender
gebaut, gleiche Masse wie die alte Figur, faerbbare Flaeche (`CapPaint`) fuer die Kartfarbe. Das
KI-Feld mischt die Figuren; die Instanzierung baut pro Figurtyp einen eigenen Satz Instanzen,
Zeichenaufrufe bleiben dadurch bei 79–133 je Strecke.

**Geisterhaus:** Die Villa ist neu gebaut — Torbogen aus Keilsteinen ueber der Fahrbahn (Durchfahrt
24 m breit, 17 m hoch), Fensterrose, Balkon mit Eisengelaender, zwei Fluegel mit Fachwerk, Erkern,
Gauben und schiefen Schornsteinen, dazu zwei Tuerme mit Zinnen und krummen Spitzen sowie Laternen
in der Durchfahrt. Nach Material zusammengefasst: 9 Meshes, 18,5k Dreiecke, 720 kB.

**Tunnel (neu):** Gewoelbe ueber der Strecke mit Portalen, Wandlichtern und Fels aussen herum.
Vier Ausfuehrungen: Pilzstamm (Wald), Felstunnel (Canyon), Neonroehre mit Leuchtringen (Neonwald),
Gruft (Geisterhaus). Drinnen sinkt die Belichtung um ein Viertel und der Scheinwerfer geht an;
Leitplanken laufen durch den Tunnel mit, Deko haelt Abstand.

**Mehr Bruecken und Spruenge:** Canyon und Neonwald bekommen je einen Viadukt-Abschnitt (Deck,
Seitenwaende, Pfeiler), das Geisterhaus einen Viadukt ueber die Senke; Wald und Neonwald bekommen
je einen Sprung ueber eine Schlucht mit Anlauframpe und Boostfeld davor. Schluchten sind jetzt
eine Liste statt einer einzelnen Stelle.

**Gabelungen muenden sauber:** Die Abzweigung waechst als Keil aus der Aussenkante der
Hauptstrecke heraus und laeuft dort auch wieder hinein (variable Breite je Stuetzpunkt), statt als
Rechteck mitten auf der Fahrbahn zu enden. Randsteine laufen aussen durch, innen nur dort, wo
wirklich eine Insel dazwischen liegt. Die Fahrphysik nutzt dasselbe Band (`forkBand`), damit
Fahrbahn und Kollision zusammenpassen.

**Sonstiges:** Gras wiegt sich im Wind (Vertex-Shader auf den Gras-Instanzen), Streckenlayouts von
Canyon und Geisterhaus haben eine echte Haarnadel bzw. einen schaerferen Haken bekommen,
Medaillenzeiten neu gemessen (85/93/99/92 s Gold), alte Rekorde einmalig verworfen
(`LAYOUT_VER=10`).

**Gemessen** (Autopilot, Klasse Wild, 3 Runden): alle vier Strecken fahren durch, KI ist 0,1–4,4 % der
Zeit neben der Strecke; 79–133 Zeichenaufrufe, 205k–370k Dreiecke. Die CPU-Zeit pro Bild war
waehrend der Messung 48–62 ms — auf diesem Rechner liefen parallel Unreal Editor und Blender, die
sich die GPU teilen; ohne sie lagen dieselben Szenen in Runde 9 bei 10–22 ms.

## Runde 9 (17.09.2026): Leitplanken, Viadukt, Abzweigungen, schnelle Streckenwahl

**Ladezeiten im Menue:** Jede gebaute Strecke bleibt als eigene Szenengruppe im Speicher; ein
Wechsel tauscht nur die Gruppe (gemessen 11–45 ms statt 1–2 s). Waehrend das Menue im Leerlauf
ist, werden die restlichen Strecken im Hintergrund vorgebaut (~215 ms je Strecke) und ihre Shader
per `compileAsync` kompiliert. Eine frisch gebaute Strecke wird ausserdem ueber mehrere Frames
schrittweise eingeblendet, statt den ersten Frame ~500 ms blockieren zu lassen. Dazu schnellere
Bauschritte: Projektion grob→fein (statt 2048 Vergleiche), Streifen-Geometrie ohne
Zwischenobjekte, gecachte Boden-/Strassen-Texturen.

**Leitplanken:** Aussen an kritischen Kurven (Radius < 48 m) und beidseitig auf erhoehten
Abschnitten stehen durchgehende Planken mit Pfosten (Farben je Welt, im Neon-/Spuk-Wald
leuchtend). Die Kollision laesst das Kart entlanggleiten statt zu stoppen: Rueckstellung an die
Plankenlinie, kleiner Geschwindigkeitsverlust, Funken und Kratzgeraeusch — harte Treffer setzen
die Drift-Combo zurueck.

**Unterfuehrung:** Die Pilz-Promenade ist jetzt eine Acht. Die Strecke kreuzt sich selbst, der
zweite Durchgang laeuft als Viadukt (8 m hoch, Deck, Seitenwaende, Pfeiler) ueber den ersten.
Dafuer: hoehenbewusste Projektion (die Ebene mit passender Hoehe gewinnt), keine Boeschung unter
der Bruecke, Pfeiler nur ausserhalb der unteren Fahrbahn, und Hoehenpruefung bei Bananen und
Bomben, damit von oben nichts nach unten trifft.

**Weggabelungen:** Sonnen-Canyon und Neon-Pilzwald haben eine Abkuerzung: eine tangential
anschliessende Bezier-Innenlinie mit eigener (schmalerer) Fahrbahn, Curbs, Insel mit Pilzen und
Schild. Canyon spart 25 m (Radius 63 m), der Neon-Pilzwald 20 m (Radius 132 m); die Hauptlinie
behaelt dafuer Boost-Pad bzw. Pendelpilz. Sporen und zwei Item-Boxen liegen auf der Abkuerzung.
Die KI entscheidet sich je nach Koennen fuer eine Route und bremst auf der Innenlinie passend.

**Flow:** Die Mittellinie wird beim Bauen automatisch geglaettet — enge Stellen (< 24 m Radius)
werden iterativ aufgeweitet, der Rest bleibt wie entworfen. Ergebnis: kleinster Radius auf allen
vier Strecken 23,6–24 m (vorher 6–14 m), KI-Anteil abseits der Strecke 0–7 % (vorher 7–17 %).
Fahnen, Laternen, Pfeiltafeln und Kuerbisse stehen weiter aussen (12,6–13 m statt 9,8–12 m), damit
man am Rand nicht mehr haengen bleibt; Item-Boxen liegen nicht mehr im Startfeld. Die Zaeune sind
durch die Leitplanken ersetzt.

Weil sich die Layouts geaendert haben, werden alte Bestzeiten, Geister und Medaillen einmalig
verworfen (`LAYOUT_VER`); die Medaillenzeiten sind per Autopilot neu kalibriert. Draw-Calls im
Rennen 56–128, Frame-CPU 10–22 ms.

## Runde 8 (17.09.2026): Fluessiger, minimales Menue, Pilzbombe & Drift-Combos

**Performance (gemessen auf Intel UHD, `rallyTest.bench()`):** Draw-Calls im Rennen von 310–460 auf
70–150, Render-Zeit pro Frame auf der Pilz-Promenade von ~39 ms auf 8–15 ms (bei freier GPU). Die
wichtigsten Schritte:
- Schattenkamera nur noch ±62 m um den Spieler statt der ganzen Insel, einfacher PCF-Filter. Auf
  Touch-Geraeten und bei niedriger FPS werden Schatten nur jeden zweiten Frame aktualisiert.
- GLB-Teile ohne Einfaerbung werden beim Laden in Vertexfarben gebacken (ein Mesh statt vieler).
- Baeume, Pilze, Felsen, Zaeune, Grabsteine, Kuerbisse und Gras laufen instanziert in raeumlichen
  Kacheln. Die Lackfarbe kommt pro Instanz, das Leuchten wird per Shader mit eingefaerbt.
- Die 7 KI-Karts teilen sich je Bauteil ein InstancedMesh (Karosserie, Lack, Fahrer, Kappe, Raeder).
- Funken, Reifenspuren und Staubwolken sind je ein InstancedMesh. Fahnen, Pfeiltafeln, Wolken,
  Huegel und Tafelberge sind zu wenigen Meshes verschmolzen.
- **Ruckler am Anfang:** Ein Neustart auf derselben Strecke baut die Welt nicht mehr neu auf
  (vorher ~1 s, jetzt ~20 ms). Shader werden per `compileAsync` im Hintergrund kompiliert; bis dahin
  zeigt das Menue „Strecke lädt …“ und der Countdown wartet. Flammen, Schild, Banane, Panzer, Bombe
  und Geist werden vorab mitkompiliert. Audio wird nacheinander dekodiert, Rausch-SFX nutzen einen
  gemeinsamen Puffer, und die Minimap zeichnet ihre statische Ebene nur einmal.
- Hinweis: Ein laufender Unreal Editor belegt auf demselben Rechner dauerhaft GPU und CPU. Damit
  schwankten die Messungen um den Faktor 5–10. Zum Spielen Unreal schliessen.

**Menue minimal:** Titel, Modus (Rennen/Grand Prix/Zeitfahren), Klasse, vier Strecken-Kacheln,
Kartfarben als Kreise, Start-Knopf, eine Zeile fuer Pokale/Medaillen. Behoben: Die normalen
Kartfarben wurden faelschlich als gesperrt markiert (`classList.toggle` mit `undefined`).
Kart- und KI-Farben sind jetzt kraeftiger.

**Neu im Spiel:** **Pilzbombe 💣** (vor allem Mittelfeld-Item): fliegt im Bogen voraus, zischt
nach der Landung und explodiert nach 1,1 s oder bei Kontakt. Die Druckwelle (6,5 m) schleudert
Karts hoch und kostet Sporen, das Herzschild blockt. **Drift-Combo:** Drift-Turbos im Abstand von
hoechstens 4,5 s zaehlen hoch (×2, ×3 …) und geben je eine Spore. Wiese, Wand oder Treffer setzen
die Combo zurueck, die beste Combo steht im Ergebnis. Dazu Grasbueschel am Strassenrand je Welt
und ein Druckwellen-Ring bei Explosionen. Tests: 15 (neu: Bombe, Combo).

## Runde 7 (17.09.2026): Koennen statt Schienen, Geisterhaus, Zeitfahren

**Fahrphysik neu (`core.mjs`):** Das Kart faehrt nicht mehr auf der Strecke entlang, sondern frei
(Position, Richtung, Geschwindigkeit). Die Strecke wird nur noch fuer Rundenfortschritt und Offroad
projiziert. Wer nicht lenkt, faehrt geradeaus in die Wiese. Arcade-Tempo: 30 m/s
Spitze (108 km/h), Turbo 40 m/s. Offroad bremst hart auf 12,5 m/s. Driften ist steuerbar: Gegenlenken
ergibt einen weiten Bogen, Einlenken einen engen. Drift-Turbos laden in drei Stufen
(blau/orange/lila). Karts rempeln sich, Baeume/Felsen/Zaeune sind Hindernisse, grosse Abkuerzungen
zaehlen nicht. Ein Rettungspilz setzt nach Schluchtstuerzen zurueck.

**KI mit Koennen:** Ideallinie, Pure-Pursuit-Lenkung, Bremspunkte aus einer
Kurvengeschwindigkeits-Tabelle und Drift-Einsatz je Klasse (Locker/Flott/Wild). Das Gummiband ist
nur noch mild, der Spieler startet von Platz 6.

**Erfolgserlebnis:** Klassenwahl, Grand-Prix-Pokale je Klasse, freischaltbares Goldpilz-Kart,
Sterne (bei Sieg ohne Treffer: „Perfekt"), Ergebnis-Statistik (beste Runde, Drift-Turbos, Tricks,
Ringe, Windschatten, Ueberholmanoever, Treffer), Rundenzeiten-Einblendung. **Zeitfahren 👻**: Deine
Bestfahrt wird aufgezeichnet und faehrt als Geist mit; im HUD steht der Abstand zum Geist, dazu
Gold-/Silber-/Bronze-Medaillen je Strecke.

**Strecken:** Pilz-Promenade (sattes Gruen), Sonnen-Canyon (Abendrot, rote Felsnadeln, Kakteen,
Plateau mit Schluchtsprung), Neon-Pilzwald (Pendel-Pilze, leuchtende Curbs, Gluehwuermchen) und neu
das **Geisterhaus**: Die Strasse fuehrt mitten durch eine Spukvilla (Blender: Halle mit
Kronleuchtern und Portraits, zwei schiefe Tuerme). Buh-Geister schweben quer ueber die Fahrbahn
(Dreher + Sporenverlust), dazu Friedhof, Kuerbislaternen und Fledermaeuse. Schanzen, Pads und
Boost-Felder suchen sich automatisch gerade Abschnitte. Die Strassen-Ueberhoehung kippt jetzt um die
Innenkante, damit die Wiese die Strecke nicht mehr verschluckt. Pfeiltafeln kuendigen enge Kurven
frueh an, eine Startampel zeigt das Raketenstart-Timing.

**Fahrermodelle (Blender):** Pilzkinder mit Gesicht, gepunkteter Kappe in Kartfarbe, Schal,
Latzhose und Handschuhen. Kart, Raeder (`kartwheel.glb`) und Fahrer (`driver.glb`) sind getrennt:
Raeder drehen und lenken, der Fahrer lehnt sich in Kurven, wackelt bei Treffern und jubelt im Ziel
und auf dem Podest. Neu sind ausserdem Windschatten-Boost, Speedlines beim Turbo,
Landungs-Stauchung und Scheinwerfer auf Nachtstrecken.

**Mobile:** DRIFT sitzt direkt ueber GAS in der rechten Daumenspalte und gibt selbst Gas. Der Daumen
darf zwischen den Tasten gleiten (Toleranz zwischen den Tasten). Mit Auto-Gas (Menue oder Pause)
wird DRIFT zur grossen Einzeltaste. Die Stimme ist lauter, die Musik wird beim Sprechen staerker
abgesenkt. `assets/keyart.jpg` ist jetzt eine Spielszene aus dem Geisterhaus.

Tests: `node --test core.test.mjs` (13 Tests: Beschleunigung, freies Lenken, Offroad, Drift-Stufen,
Kurventabelle, Abkuerzungen, Kollision, Items, Sterne). Unter `?test=1` faehrt
`rallyTest.autopilot(true)` alle vier Strecken durch; damit wurden Rundenzeiten, Offroad-Anteile
der KI und die Medaillenzeiten kalibriert.

## Mobile-Nachbesserung 16.09.2026 (diese Session)

Long-Press auf GAS erzeugte Textmarkierung: jetzt `user-select:none` + `-webkit-touch-callout:none`
global, `touch-action:manipulation` auf allen Buttons und `oncontextmenu`-Block auf den
Touch-Tasten (per Touch-emuliertem Browser-Test bestaetigt: 1,8-s-Hold, Selektion bleibt leer).
Das Hochformat-Layout dieser Sektion unten wurde pixelgenau bei 390x844 nachgeprueft: zwei
Vollbreiten-Reihen, alle Tasten ~98 px, GAS anteilig breiter, Tacho/Minimap darueber, kein
Overflow, safe-area-Abstand. Offener Punkt: `assets/keyart.jpg` ist in og:image referenziert,
existiert aber noch nicht (nur Share-Vorschau betroffen).

## Runde 5 (16.09.2026): ElevenLabs-Sound, neue Items, Unreal-Showcase

**Musik (ElevenLabs Music v2, instrumental):** drei neue BGM-Tracks ersetzen die selbst
synthetisierten Loops — `assets/audio/bgm_race.mp3` (Funk/Chiptune, 150 BPM, 96 s) fuer die
Tag-Kurse, `bgm_night.mp3` (Synthwave, 140 BPM, 96 s) fuer den Nacht-Kurs Sternen-Garten und
`bgm_menu.mp3` (Ukulele/Marimba-Cafe, 104 BPM, 64 s). KI-Musik loopt nicht nahtlos, deshalb hat
jeder Track zwei `<audio>`-Elemente, die 2,2 s vor dem Ende per Equal-Power-Kurve ueberblenden
(`bgmTick`). Die Renn-Tracks laufen weiter durch den tempoabhaengigen Tiefpass. Im Ziel stoppt die
Rennmusik, eine Siegesfanfare (`sfx/jingle.mp3`) spielt, danach setzt die Menue-Musik ein.
Die alten Loops (`race_own.wav`, `menu_own.wav`) liegen noch im Ordner, werden aber nicht geladen.

**Sprecher (ElevenLabs TTS, Stimme "Leo", deutsch):** 14 Ansagen unter `assets/audio/voice/`
(Start, Runde 2, letzte Runde, Turbo, Volltreffer, Autsch, Banane, Herzschild, Fuehrung,
Sieg/Podium/Ziel, Bestzeit, Willkommen). Sie laufen als WebAudio-Puffer; die Musik wird waehrend
einer Ansage abgesenkt (Zeitstempel statt `onended`). Wichtige Ansagen werden von Item-Rufen nicht
unterbrochen, zwei wichtige laufen nacheinander. Web-Speech bleibt nur als Ersatz, falls eine Datei fehlt.

**SFX (ElevenLabs Text-to-Sound):** Item-Pickup, Bananen-Rutscher, Panzer-Treffer, Jubel im Ziel
(Platz 1–3). Solange ein Puffer noch nicht dekodiert ist, greift die alte WebAudio-Synthese.

**Neue Item-Modelle (Blender-MCP, Blender 5.2):** `assets/banana.glb` (Bananenschale, 3 Materialien)
und `assets/shell.glb` (Such-Brezn mit Sechseck-Flecken). Der Such-Brezn fliegt jetzt sichtbar
entlang der Strecke zum Ziel; der Treffer (Dreher) wirkt erst bei Ankunft. **Auch die KI legt jetzt
Bananen und schiesst Panzer auf den Spieler** — Bananen treffen jeden ausser dem Leger (Spieler
1,5 s Dreher, KI 2 s), das Herzschild wehrt beides ab. Kamerawackler bei Treffern, Ansage
"Du fuehrst!" beim Uebernehmen von Platz 1.

**Mobile Hochformat:** Touch-Tasten in zwei Vollbreiten-Reihen; Runde/Zeit sitzen rechts oben, damit
die Positionsanzeige bei 375 px nicht mehr unter der Zeit-Box liegt.

**Unreal (UE 5.8, Projekt `test123 5.8`):** Alle GLBs (Kart, Tor, Baum, Pilz, Fels, Zaun, Ballon,
Item-Box, Banane, Panzer) liegen unter `/Game/MushroomRally`. Neu ist das Showcase-Level
`/Game/MushroomRally/Maps/L_MushroomRally`: Insel mit ovaler Strecke, Curbs, Boost-Pads,
Start-Ziel-Tor mit Schild, Startgitter aus 8 eingefaerbten Karts, Item-Boxen, Bananen/Panzern,
34 Pilz-Baeumen, Riesenpilzen, Felsen, Zaeunen, Ballons, Huegeln, Himmel/Nebel und drei
CineCameras (`MR_Cam_StartGrid`, `MR_Cam_Overview`, `MR_Cam_Infield`).

Testschnittstelle (`?test=1`): `rallyTest.tick(n)` treibt die Simulation ohne `requestAnimationFrame`
voran (noetig in nicht sichtbaren Fenstern), dazu `aiUse(id,item)`, `items()`, `voice()`,
`bgmTrack()`. `server.cjs` beantwortet jetzt Range-Requests wie GitHub Pages (sonst kann `<audio>`
beim Ueberblenden nicht zurueckspringen).

## Grafik & Musik Runde 4 (16.09.2026)

Item-Boxen sind jetzt Geschenk-Modelle aus Blender (`assets/itembox.glb`, goldene
Rundbox mit rotem Band und Schleife, 396 Dreiecke) mit einem schwebenden roten
„?"-Sprite darueber (billboardet, bleibt also immer lesbar). Der Spieler-Kart pustet
beim Anfahren graue Auspuff-Puffs (Pool, max. 24, steigen auf und verwehen). Der
Nacht-Kurs Sternen-Garten hat zusaetzlich zum Sternenhimmel jetzt einen Mond, und um
die Insel pulsiert ein heller Kuestenschaum-Ring auf dem Wasser.

Musik komplett eigenständig: Auch das Menue läuft jetzt mit einem eigenen Track
(`assets/audio/menu_own.wav`, „Pilz-Cafe", 100 BPM, C-Dur, 58 s) — Dreieck-Melodie
ueber Cmaj7/Am7/F/G7, weicher Bass, Besen-Percussion. Die Rennmusik laeuft zudem
durch einen dynamischen Tiefpass (WebAudio), der sich mit dem Tempo oeffnet: Im
Stand klingt die Musik geschlossen, bei Vollgas und Turbo voll auf. Neu ist auch
ein Bestzeiten-Jubel (goldene Konfetti, Ansage und Einblendung bei neuer Bestzeit).

## Grafik- & Sound-Update 16.09.2026, Runde 2

Drei neue Blender-Assets (headless gebaut, numerisch geprueft, EEVEE-Rendercheck):
`rock.glb` (Felsformation mit Mooskappe, per InstancedMesh ueber die Landschaft gestreut),
`fence.glb` (Zaunstueck; wird automatisch auf die Aussenseiten scharfer Kurven gesetzt,
Kurvenkruemmung aus den Streckensamples berechnet, instanziert = 1 Draw-Call je Material)
und `balloon.glb` (Heissluftballon mit Bannern, Korb und Seilen; 4 pro Kurs, getintet,
schweben langsam). Dazu im Code: dunkle Reifenspuren (Skid marks) beim Driften aus einem
90er-Quad-Pool ohne Allokierung im Frame-Loop, und ein 500-Punkte-Sternenhimmel fuer den
Nacht-Kurs Sternen-Garten (weiter Nebel dort). Draw-Calls im Rennen blieben bei ~378.

Musik und SFX sind jetzt komplett selbst erstellt: Die Renn-BGM `assets/audio/race_own.wav`
ist ein eigener Chiptune-Track („Pilz-Grand-Prix", 150 BPM, A-Moll, 51 s Loop) — komponiert
als Notendaten und per Node.js-Skript synthetisiert (Square-Lead mit Delay, Triangle-Bass,
Arp-Flaeche, Kick/Snare/Hat), 32 kHz Mono, 3,1 MB, numerisch geprueft (RMS/Peaks, Loop-Fade).
Die SFX-Suite ist reines WebAudio ohne Dateien: geschichteter Motor-Sound (Saegenzahn +
Sub-Square durch Tiefpass, drehzahlabhaengig geglaettet), Drift-Screech (Bandpass-Rauschen),
Turbo-Whoosh, Item-Klaenge, Runden-Chime und Ziel-Fanfare. ElevenLabs war nicht einbindbar:
Der MCP-Server ist konfiguriert, aber in dieser Session nicht verbunden und ein API-Key
liegt nicht vor; sobald beides vorhanden ist, koennen Musik/Sprachausgabe dort erzeugt werden.

## Sound-Update 16.09.2026

Musik steht jetzt standardmaessig auf AN (♪ AN); Browser-Autoplay-Beschraenkungen werden
abgefangen: Der Ton startet mit der ersten Nutzereingabe (Klick oder Taste), fruehere
Autoplay-Blockaden werden beim Arming aufgeraeumt und erneut versucht. Die Renn-BGM ist
jetzt `Five Star Mayhem` (A-Variante, aus dem Shuffle-Bestand des Nutzers) statt des
entspannteren Boulevard-Heat-Loops; im Menue bleibt Radio Chrom. Neu sind deutsche
Ansagen ueber die lokale Web-Speech-API (kein Netz, keine Kosten): Startfreigabe,
Rundenwechsel, Volltreffer, Turbo und Endplatzierung; pausierbar ueber den Ton-Schalter.
Die Sprecherqualitaet haengt vom installierten Windows-Stimme ab. ElevenLabs war in
dieser Session nicht erreichbar (MCP nicht verbunden, kein API-Key) — fuer Eleven-Music-
Tracks oder hochwertiges TTS muss der ElevenLabs-MCP erst wieder verbunden werden.
Entfernt: das Speedlines-Overlay (gleichmaessige senkrechte Streifen beim Turbo), das
als Renderfehler wahrgenommen wurde; Boost-Feedback kommt jetzt nur aus FOV-Kick,
Kamerabeben, Funken und HUD.

## Asset-Update 15.09.2026, Runde 2 (Blender-CLI)

Start-Ziel-Tor und Streckenbaeume sind jetzt echte Blender-Modelle: `assets/gate.glb`
(Pfeiler mit Pilzkappen, dunkler Ellipsenbogen, rotes Bannerbrett fuer das MUSHROOM-RALLY-
Schild, 1.412 Dreiecke, 5 Materialien) und `assets/tree.glb` (Pilz-Baum mit zweistoeckiger
Krone, 828 Dreiecke, 3 Materialien). Gebaut headless per Blender 5.2 (`--background`),
numerisch verifiziert (Dreiecke, Boundingbox, Materialnamen) und per EEVEE-Rendercheck
geprueft; exportiert als glTF. Der Pilz-Baum ersetzt pro Instanz den frueheren
Prozedural-Bau (gleiche Draw-Call-Zahl, drei Kronengruentoene per `CapPaint` getintet);
das Tor loest den alten Kasten-Bogen ab, das MUSHROOM-RALLY-Textschild bleibt Canvas-
basiert liegen. Bei fehlenden Dateien greift weiter der prozedurale Fallback. `npm test`
unveraendert gruen (4/4). Beide neuen GLB-Dateien wurden ebenfalls per offiziellem
Unreal-MCP (UE 5.8, Testprojekt test123, /Game/MushroomRally) importiert und dort als
StaticMeshes mit Materialinstanzen verifiziert; im Spiel geaendert hat das nichts.

## Asset-Update 15.09.2026 (Blender-MCP)

Kart und Pilz-Requisite sind kein reiner Code mehr: Beide wurden am 15.09.2026 per Blender-MCP (Blender 5.2, Collection `MushroomRally`) als Low-Poly-Modelle gebaut, numerisch verifiziert, visuell per Render geprüft und als glTF exportiert (`assets/kart.glb` 38 Teile, `assets/mushroom.glb`, zusaetzlich `assets/kart_merged.glb` als Ein-Mesh-Variante, 3.644 Dreiecke). `vendor/GLTFLoader.js` und `vendor/BufferGeometryUtils.js` (three.js r165) wurden als lokale Kopien ergaenzt; es bleibt bei einer lokalen Runtime ohne CDN. Das Spiel laedt die Prototypen beim Start und faerbt `BodyPaint` pro Fahrer bzw. `CapPaint` pro Pilz; faellen die Dateien aus, greift automatisch der bisherige prozedurale Bau als Fallback. `npm test` bleibt unberuehrt (4/4). Dieselben GLB-Dateien wurden zusaetzlich per offiziellem Unreal-MCP (UE 5.8) in ein Testprojekt importiert, um die Pipeline Blender -> glTF -> Unreal zu validieren; im Spiel geaendert hat das nichts.

## Performance und Mobile (15.09.2026)

Das Spiel ist auf FPS und schwache Hardware ausgelegt: GLB-Prototypen werden beim Laden
nach Material zu wenigen Meshs verschmolzen (Kart 38 Teile -> ~8 Meshs, Rennen ~356 Draw-
Calls statt ~600), die Schattenkarte ist auf 1024 px begrenzt, auf Touch-Geraeten startet
der Renderer ohne Antialiasing mit hoechstens 1.25x Pixel-Ratio. Eine adaptive Qualitaet
misst alle 2 Sekunden die FPS im Rennen und senkt unter 45 FPS zuerst die Aufloesung,
dann die Schatten. Unter `?test=1` liefert `window.rallyTest.perf()` Draw-Calls, Dreiecke,
DPR und Qualitaetsstufe fuer Messungen. Touch-Steuerung ist enthalten.

## Musik (15.09.2026)

Echte BGM statt nur Synthese: `assets/audio/menu.mp3` (Radio Chrom, 18-s-Loop) im Menue
und `assets/audio/race.mp3` (Boulevard Heat Loop, 2:52, als Web-MP3 auf 96 kbps komprimiert)
im Rennen, als `<audio>`-Loops mit 15 % Lautstaerke. Beide stammen aus vom Nutzer
bereitgestellten Musikdateien (Downloads-Ordner); Lizenzen vor spaeterer kommerzieller
Nutzung pruefen. Der Ton-Schalter steuert Musik, Motor und Effekte zusammen; fehlen die
Dateien, springt automatisch der prozedurale Chiptune-Sequencer ein. Weitere Kandidaten
fuer schnellere Tausch-Aktionen liegen unter `Downloads/assets/audio/shuffle/`
(Five Star Mayhem, Neon Heist Run, Vice Coast Run — je A/B-Variante) und
`Downloads/assets/audio/` (basskeller, betonhain-night, funk-88-8, nachtfalter-fm).

## Start

Im Projektordner `npm start` ausfuehren und http://127.0.0.1:4218 oeffnen. Node.js wird benoetigt. Das Spiel verwendet eine lokale Three.js-Datei und benoetigt keine CDN-Verbindung, API-Keys oder Build-Installation.

## Steuerung

- **Tastatur:** WASD / Pfeiltasten: Gas, Bremse, Lenken. Shift: Hops; beim Lenken halten = Drift, loslassen =
  Drift-Turbo (Funken → Glut → Blitz); in der Luft Shift = Trick-Turbo. Leertaste oder Item-Feld: Item. P / Escape:
  Pause. R: auf die Strecke zuruecksetzen. Enter: Start im Menue, Portal im Wiesnland.
- **Controller:** Stick/Steuerkreuz lenken, A/RT Gas, B/LT Bremse, LB/RB Hops & Drift, X/Y Item, START Pause,
  VIEW zuruecksetzen; im Menue Steuerkreuz fuer Strecke und Klasse, LB/RB Modus, A los.
- **Handy:** hochkant Ein-Hand-Wischsteuerung (wischen = lenken, tippen = Hops, weit wischen = Drift, nach oben =
  Item), quer Bildschirmknoepfe (Gas, Bremse, Hops, Item). Umschalten und Auto-Gas in der Pause.
- Ton-Schalter oben rechts (Musik, Motor und Effekte zusammen), Vollbild daneben.

## Umfang

Sieben Rennstrecken (Pilz-Promenade, Sonnen-Canyon, Neon-Pilzwald, Geisterhaus, Lava-Feste, Sternenbahn,
Magnet-Kirmes) mit je eigener Idee, dazu die Open World "Wiesnland" mit Missionen. Modi: Rennen, Grand Prix,
Zeitfahren (Geist und Medaillen) und Wiesnland; Klassen Locker/Flott/Wild und Spiegel-Modus. Vier Fahrerfiguren (Pilzi,
Schildi, Volt, Mochi) mit eigenem Kart und eigenen Werten, acht Karts je Rennen, drei Runden. Neun Items: Turbo,
Dreifach-Turbo, Such-Brezn, Banane, Herzschild, Pilzbombe, Gewitterwolke, Riesenwuchs, Tintenpilz. Loopings,
Achterbahnen, Elemente-Parcours (Boot, Tauchboot, Flugzeug), Wetter und Tageszeit von Runde zu Runde, Rivale je
Rennen, Tagesaufgabe, Fahrerstufen mit XP, 32 Erfolge und freischaltbare Lackierungen. Kein Multiplayer und keine
native Store-App.

Die Modelle entstehen in Blender (Skripte unter `art/`), Landschaft, Effekte und UI im Code; lokale Three.js-Runtime
unter `vendor/`, keine Build-Installation und keine CDN-Abhaengigkeit fuer das Spiel selbst.

## Verifikation

`npm test` (Node) prueft Fahrphysik, Drift-Turbo, Items, Zieleinlauf, Achterbahn, Loopings, Elemente, Hindernisse,
Wiesnland-Missionen, Fortschritt/Erfolge, Controller-Belegung und Wetterplan (zusammen 110 Tests). Im Browser
liefert `?test=1` die Test-Schnittstelle `window.rallyTest` (Rennen starten, Zeit vorspulen, Wetter erzwingen,
Standbilder); damit laufen die Autopilot-Rennen und Bildvergleiche. Das ersetzt keinen menschlichen Langzeit-Spieltest.

# Projektdokumentation – [Karate Performance Evaluator]

## Inhaltsverzeichnis

1. [Einordnung & Zielsetzung](#1-einordnung--zielsetzung)
2. [Zielgruppe & Stakeholder](#2-zielgruppe--stakeholder)
3. [Anforderungen & Umfang](#3-anforderungen--umfang)
4. [Vorgehen & Artefakte](#4-vorgehen--artefakte)
    - [Understand & Define](#41-understand--define)
    - [Sketch](#42-sketch)
    - [Decide](#43-decide)
    - [Prototype](#44-prototype)
    - [Validate](#45-validate)
5. [Erweiterungen [Optional]](#5-erweiterungen-optional)
6. [Projektorganisation [Optional]](#6-projektorganisation-optional)
7. [KI‑Deklaration](#7-ki‑deklaration)
8. [Anhang [Optional]](#8-anhang-optional)

> **Hinweis:** Massgeblich sind die im **Unterricht** und auf **Moodle** kommunizierten Anforderungen.

<!-- WICHTIG: DIE KAPITELSTRUKTUR DARF NICHT VERÄNDERT WERDEN! -->

<!-- Diese Vorlage ist für eine README.md im Repository gedacht. Abschnitte mit [Optional] können weggelassen werden, wenn in den Übungen nichts anderes verlangt wird. -->

## 1. Einordnung & Zielsetzung
- **Kontext & Problem:** Im Trainings- und Sportumfeld fehlt oft eine einfache, digitale Lösung, um Athlet:innen zu verwalten, Trainingsinformationen bereitzustellen und Rollen klar zu trennen. Bestehende Lösungen sind häufig zu komplex oder nicht auf kleinere Organisationen zugeschnitten.  
- **Ziele:** Ziel des Projekts ist die Entwicklung eines klickbaren und funktionalen Web-Prototyps, der es Coaches ermöglicht, Athlet:innen zu verwalten, und Athlet:innen erlaubt, ihre eigenen Informationen einzusehen. Der Fokus liegt auf klaren Workflows, Rollenlogik und einer funktionierenden Datenanbindung.  
- **Abgrenzung [Optional]:** Nicht Bestandteil des Projekts sind Zahlungsfunktionen, komplexe Auswertungen, Rechteverwaltung auf Unternehmensebene oder produktiver Betrieb mit hohen Sicherheitsanforderungen.

## 2. Zielgruppe & Stakeholder
- **Primäre Zielgruppe:** Coaches und Athlet:innen in grossen sowie kleinen Sportvereinen oder Trainingsgruppen.  
- **Weitere Stakeholder [Optional]:** Dozierende (Bewertung des Projekts), Modulverantwortliche, Kommiliton:innen.  
- **Annahmen [Optional]:** Nutzer:innen verfügen über grundlegende Web-Kenntnisse, die Anwendung wird primär auf Desktop genutzt und Coaches verwalten mehrere Athlet:innen

## 3. Anforderungen & Umfang
- **Kernfunktionalität (Mindestumfang):** Rollenbasierte Navigation (Coach / Athlete), Anzeigen von Athlet:innen aus einer Datenbank, Detailseiten für Athlet:innen, durchgängige Workflows ohne Mock-Daten und Deployment als Web-Applikation  
- **Akzeptanzkriterien:** Athlet:innen werden aus der MongoDB korrekt geladen und angezeigt, Coach-Workflow ist von Start bis Abschluss ohne Fehlermeldung nutzbar und die Anwendung ist über eine öffentliche URL erreichbar  
- **Erweiterungen [Optional]:** Separate Views für unterschiedliche Rollen, strukturierte Navigation mit Navbar und Anbindung einer echten Datenbank statt statischer JSON-Daten  

## 4. Vorgehen & Artefakte

### 4.1 Understand & Define
- **Ausgangslage & Ziele:** Entwicklung eines funktionalen Prototyps gemäss Übungsanforderungen mit Fokus auf Usability und klaren Workflows.
- **Zielgruppenverständnis:** Analyse typischer Aufgaben eines Coaches (Verwalten von Athlet:innen) sowie der Bedürfnisse von Athlet:innen (Einsehen eigener Daten)
- **Wesentliche Erkenntnisse:** Klare Rollentrennung ist zentral, Navigation muss einfach und selbsterklärend sein und Fokus auf wenige, aber durchgängige Funktionen

### 4.2 Sketch
- **Variantenüberblick:** Es wurden mehrere Skizzen für die Navigation und Seitenstruktur erstellt (Coach-zentriert vs. Rollenwahl beim Einstieg).
- **Skizzen:** Die Skizzen zeigen zunächst eine einfache Startseite mit einer klaren Rollenwahl (Coach, Schiedsrichter, Athlet). Darauf aufbauend wurden separate Ablaufskizzen für die Coach-Rolle entwickelt, inklusive Auswahl einer Disziplin (z. B. Kumite oder Kata/Kihon), der Athlet:innenübersicht sowie der Bewertungsansicht mit verschiedenen Kategorien (Technik, Taktik, Mental).

<table align="center">
  <tr>
    <td><img src="images/Übung-8.png" width="380"></td>
  </tr>
  <tr>
    <td align="center">Skizze – Übung 8</td>
  </tr>
</table>


### 4.3 Decide
- **Gewählte Variante & Begründung:** Aus den erstellten Skizzen wurde bewusst nur das Konzept der Rollenwahl als verbindliche Entscheidungsgrundlage übernommen. Die klare Auswahl der Funktion (Coach, Athlet:in, Schiedsrichter) beim Einstieg wurde als zentraler Bestandteil definiert, da sie die Anwendung verständlich strukturiert und die unterschiedlichen Nutzungskontexte sauber trennt.
Weitere Skizzen (z. B. zu Disziplinwahl, Athlet:innenlisten oder Bewertungsansichten) dienten primär der Exploration möglicher Abläufe und wurden nicht als fixe Mockups festgelegt.  
- **End‑to‑End‑Ablauf:** Der verbindliche End-to-End-Ablauf beschränkt sich auf den Einstieg in die Anwendung:
Startseite → Auswahl der Rolle → Weiterleitung in den entsprechenden Funktionsbereich.
Die konkrete Ausgestaltung der nachfolgenden Seiten und Workflows wurde bewusst offen gehalten und im weiteren Projektverlauf direkt im Prototyp iterativ umgesetzt und angepasst.  
- **Referenz‑Mockup:** 
## Startseite

<table align="center">
  <tr>
    <td><img src="images/Startseite.png" width="380"></td>
  </tr>
  <tr>
    <td align="center">Startseite</td>
  </tr>
</table>

---

## Anmeldung

<table align="center">
  <tr>
    <td><img src="images/Anmeldung (Coach).png" width="380"></td>
  </tr>
  <tr>
    <td align="center">Anmeldung</td>
  </tr>
</table>

---

## Coach – Mockups

<table align="center">
  <tr>
    <td><img src="images/Coach-Dashboard.png" width="380"></td>
    <td><img src="images/Coach-Analyse.png" width="380"></td>
  </tr>
  <tr>
    <td align="center">Dashboard</td>
    <td align="center">Analyse</td>
  </tr>
  <tr>
    <td><img src="images/Coach-Bewertung.png" width="380"></td>
    <td><img src="images/Coach-Feedback.png" width="380"></td>
  </tr>
  <tr>
    <td align="center">Bewertung</td>
    <td align="center">Feedback</td>
  </tr>
  <tr>
    <td><img src="images/Coach-Profil.png" width="380"></td>
    <td></td>
  </tr>
  <tr>
    <td align="center">Profil</td>
    <td></td>
  </tr>
</table>

---

## Athlet – Mockups

<table align="center">
  <tr>
    <td><img src="images/Athlet-Dashboard.png" width="380"></td>
    <td><img src="images/Athlet-Analyse.png" width="380"></td>
  </tr>
  <tr>
    <td align="center">Dashboard</td>
    <td align="center">Analyse</td>
  </tr>
  <tr>
    <td><img src="images/Athlet-Feedback.png" width="380"></td>
    <td><img src="images/Athlet-Profil.png" width="380"></td>
  </tr>
  <tr>
    <td align="center">Feedback</td>
    <td align="center">Profil</td>
  </tr>
</table>

---

## Schiedsrichter – Mockups

<table align="center">
  <tr>
    <td><img src="images/Schiedsrichter-Dashboard.png" width="380"></td>
    <td><img src="images/Schiedsrichter-Analyse.png" width="380"></td>
  </tr>
  <tr>
    <td align="center">Dashboard</td>
    <td align="center">Analyse</td>
  </tr>
  <tr>
    <td><img src="images/Schiedsrichter-Bewertung.png" width="380"></td>
    <td><img src="images/Schiedsrichter-Feedback.png" width="380"></td>
  </tr>
  <tr>
    <td align="center">Bewertung</td>
    <td align="center">Feedback</td>
  </tr>
  <tr>
    <td><img src="images/Schiedsrichter-Profil.png" width="380"></td>
    <td></td>
  </tr>
  <tr>
    <td align="center">Profil</td>
    <td></td>
  </tr>
</table>

### 4.4 Prototype
- **Kernfunktionalität:** Der entwickelte Prototyp bildet ein rollenbasiertes Anwendungskonzept ab und stellt für Coaches und Athlet:innen jeweils angepasste Funktionsbereiche zur Verfügung. Nach der Rollenwahl gelangen Nutzer:innen auf ein Dashboard, das als zentrale Übersichtsseite dient und den Einstieg in die wichtigsten Funktionen ermöglicht.  

    Für Coaches umfasst der Prototyp folgende Kernseiten und Funktionen:
-Dashboard: Übersicht über relevante Informationen und Einstiegspunkte.
-Athletenseite: Erstellen, Bearbeiten und Löschen von Athlet:innen.
-Bewertungsseite: Durchführung von Bewertungen für ausgewählte Athlet:innen anhand definierter Kriterien.
-Feedbackseite: Anzeige, Filterung und Löschung abgeschlossener Bewertungen.
-Analyse: Analyse einzelner Athlet:innen sowie Vergleich von zwei Athlet:innen anhand vorhandener Bewertungsdaten.
-Profilseite: Einsicht in eigene Profildaten sowie Abmelden aus der Anwendung.

    Für Athlet:innen stehen reduzierte, rollenangepasste Funktionen zur Verfügung:
-Dashboard: Persönliche Übersicht.
-Analyse: Einsicht in die eigene Analyse (kein Vergleich mit anderen Athlet:innen).
-Feedbacks: Anzeige der eigenen erhaltenen Bewertungen.
-Profilseite: Einsicht in persönliche Daten und Abmelden.
- **Deployment:** https://karate-performance-evaluator-kpe.netlify.app

#### 4.4.1. Entwurf (Design)
- **Informationsarchitektur:** Der Prototyp ist rollenbasiert aufgebaut und folgt einer klaren Seitenstruktur. Nach der Rollenwahl gelangen Nutzer:innen auf ein Dashboard, das als zentrale Übersichts- und Einstiegseite dient. Von dort aus sind alle relevanten Funktionen über eine konsistente Navigation erreichbar.
Die Informationsarchitektur unterscheidet klar zwischen Coach- und Athlet:innen-Sicht: Coaches haben Zugriff auf Verwaltungs-, Bewertungs- und Analysefunktionen, während Athlet:innen nur ihre eigenen Daten, Feedbacks und Analysen einsehen können. Diese Trennung reduziert Komplexität und verhindert Fehlbedienungen.
- **Oberflächenentwürfe:** 
## Coach – Prozess / Planung

<table align="center">
  <tr>
    <td><img src="images/P-Coach-Dashboard.png" width="380"></td>
    <td><img src="images/P-Coach-Athleten.png" width="380"></td>
  </tr>
  <tr>
    <td align="center">Dashboard</td>
    <td align="center">Athletenübersicht</td>
  </tr>
  <tr>
    <td><img src="images/P-Coach-Analyse.png" width="380"></td>
    <td><img src="images/P-Coach-Bewertung.png" width="380"></td>
  </tr>
  <tr>
    <td align="center">Analyse</td>
    <td align="center">Bewertung</td>
  </tr>
  <tr>
    <td><img src="images/P-Coach-Feedback.png" width="380"></td>
    <td><img src="images/P-Coach-Profil.png" width="380"></td>
  </tr>
  <tr>
    <td align="center">Feedback</td>
    <td align="center">Profil</td>
  </tr>
</table>

- **Designentscheidungen:** Das Design ist bewusst schlicht und funktional gehalten. Der Fokus liegt auf Verständlichkeit, klaren Strukturen und einer intuitiven Bedienung. Visuelle Elemente wurden sparsam eingesetzt, um die kognitive Belastung gering zu halten. Wiederkehrende Layout- und Navigationselemente sorgen für Konsistenz und erleichtern die Orientierung innerhalb der Anwendung.

#### 4.4.2. Umsetzung (Technik)
- **Technologie‑Stack:** Der Prototyp wurde mit SvelteKit umgesetzt. Für die Datenhaltung wird MongoDB verwendet. Frontend und Backend sind innerhalb des SvelteKit-Frameworks integriert.
- **Tooling:** Visual Studio Code als Entwicklungsumgebung, Netlify für das Deployment und MongoDB als Datenbanklösung **ChatGPT**  
- **Struktur & Komponenten:** Die Anwendung ist seitenbasiert strukturiert und nutzt die Routing-Logik von SvelteKit. Zentrale Seiten sind unter anderem Dashboard, Athletenverwaltung, Bewertung, Feedback, Analyse und Profil. Wiederverwendbare UI-Komponenten (z. B. Navigation, Karten, Formulare) sorgen für eine konsistente Benutzeroberfläche.
- **Daten & Schnittstellen [Optional]:**
- **Besondere Entscheidungen:** Ein bewusster Entscheid war der Einsatz realer Daten statt statischer Mock-Daten, um den Prototyp möglichst nah an einer realen Anwendung auszurichten. Zudem wurde der Build-Prozess so angepasst, dass serverseitige Funktionen auch im Netlify-Deployment korrekt ausgeführt werden.  

### 4.5 Validate
- **URL der getesteten Version:** karate-performance-evaluator.netlify.app
- **Ziele der Prüfung:** Ziel der Usability Evaluation war es zu überprüfen, ob die zentralen Workflows für Coaches und Athlet:innen verständlich, nachvollziehbar und ohne Unterstützung durchführbar sind. Insbesondere sollte geprüft werden, ob Nutzer:innen ihre jeweiligen Ziele (Bewertung erfassen bzw. Feedback einsehen) effizient erreichen können.  
- **Vorgehen:** Die Evaluation wurde als unmoderierter, szenariobasierter Usability-Test durchgeführt. Die Testpersonen erhielten die Testaufgaben in schriftlicher Form (gemäss PDF-Vorlage) und führten diese selbstständig durch. Währenddessen wurden Beobachtungen protokolliert und anschliessend gemeinsam reflektiert.  
- **Stichprobe:** Getestet wurde mit zwei Testpersonen, die unterschiedliche Rollen einnahmen (Coach und Athlet). Beide verfügen über grundlegende Erfahrung im Umgang mit Web-Applikationen.
- **Aufgaben/Szenarien:** 
Szenario 1 – Coach:
Sie sind Coach des Karate Schweizer Nationalkaders.
Zu Beginn einer neuen Saison wird ein Athlet erstmals in den Kader aufgenommen. Nach einem gemeinsamen Trainingsblock soll seine sportliche Leistung dokumentiert werden, damit der Entwicklungsstand festgehalten und später nachvollzogen werden kann.

    Szenario 2 – Athlet:
Sie sind Athlet des Karate Schweizer Nationalkaders.
Nach mehreren Trainings und Wettkämpfen erhalten die Athleten regelmässig Rückmeldungen von den Coaches. Sie möchten nachvollziehen können, wie Ihre aktuelle Leistung eingeschätzt wird, um Ihr weiteres Training entsprechend auszurichten.
- **Kennzahlen & Beobachtungen:** Beide Testpersonen konnten ihre Aufgaben erfolgreich abschliessen. Die Navigation wurde mehrheitlich korrekt genutzt, und die Rollenlogik wurde verstanden. Vereinzelt kam es zu kurzen Orientierungspausen, insbesondere beim Wechsel zwischen Übersicht, Feedback und Analyse.  
- **Zusammenfassung der Resultate:** Die Evaluation zeigt, dass der Prototyp die zentralen Nutzungsszenarien für Coaches und Athlet:innen gut unterstützt. Die Workflows sind grundsätzlich verständlich und ermöglichen es, Bewertungen zu erfassen sowie Feedback und Analysen einzusehen.  
- **Abgeleitete Verbesserungen:** Klarere Benennung einzelner Navigationspunkte und deutlichere visuelle Trennung zwischen Bewertungs- und Analyseansicht  
- **Umgesetzte Anpassungen [Optional]:**

## 5. Erweiterungen [Optional]
- **Beschreibung & Nutzen:** Über den Mindestumfang hinaus wurden Analyse- und Vergleichsfunktionen umgesetzt, die es Coaches ermöglichen, Athlet:innen detailliert auszuwerten und miteinander zu vergleichen. Dies erhöht den praktischen Nutzen der Anwendung deutlich.  
- **Umsetzung in Kürze:** Die Analyse basiert auf vorhandenen Bewertungsdaten und stellt diese strukturiert dar. Für Athlet:innen ist die Analyse auf die eigene Person beschränkt.  
- **Abgrenzung zum Mindestumfang:** Analyse- und Vergleichsfunktionen sind nicht zwingend für den Grundworkflow notwendig, stellen jedoch eine funktionale Erweiterung dar.  

## 6. Projektorganisation [Optional]
Beispiele:
- **Repository & Struktur:** https://github.com/Arben-ai/karate-performance-evaluator  
- **Issue‑Management:** Für die Planung und Nachverfolgung von Aufgaben und Problemen wurden GitHub Issues genutzt. Issues wurden erstellt, um funktionale Anforderungen (z. B. neue Seiten oder Workflows), technische Probleme (z. B. Deployment- oder Datenbankfehler) sowie kleinere Verbesserungen festzuhalten.  
  Die Issues dienten primär als persönliche To-do-Liste und Dokumentation des Projektfortschritts und wurden nach Umsetzung geschlossen.  
- **Commit‑Praxis:** Commits wurden regelmässig und mit sprechenden Commit-Messages erstellt.

## 7. KI‑Deklaration

### Eingesetzte KI‑Werkzeuge
ChatGPT (OpenAI)

### Zweck & Umfang
KI wurde durchgehend im gesamten Projekt als unterstützendes Werkzeug eingesetzt. Sie kam insbesondere bei der Entwicklung von Nutzungsszenarien und Workflows, bei Codevorschlägen, Debugging, kleineren Refactorings sowie bei der Analyse und Verbesserung bestehender technischer Lösungen zum Einsatz.  

Der Einsatz erfolgte iterativ: KI-generierte Vorschläge wurden geprüft, angepasst und gezielt in den Projektkontext integriert. Die Verantwortung für Architekturentscheidungen, Funktionsumfang und finale Implementierung lag jederzeit beim Projektverfasser.  

Bei der Nutzung von KI wurde darauf geachtet, keine geschützten Inhalte ungeprüft zu übernehmen. Generierte Inhalte wurden als Hilfestellung verstanden und eigenständig weiterentwickelt, sodass keine urheberrechtlich relevanten Fremdleistungen direkt übernommen wurden.

### Art der Beiträge
KI wurde unterstützend eingesetzt für:

die Ausarbeitung und Verfeinerung von Nutzungsszenarien und Workflows

Vorschläge zu Code-Strukturen, Logik und Komponentenaufbau

Debugging-Hilfen sowie kleinere Refactorings bestehender Code-Abschnitte

das Durchdenken alternativer Lösungsansätze bei technischen und konzeptionellen Fragestellungen

Die Beiträge der KI dienten dabei als Vorschläge und Diskussionsgrundlage und nicht als abschliessende Lösungen.

### Eigene Leistung (Abgrenzung)
Die inhaltliche Konzeption des Prototyps, die Priorisierung und Auswahl der Funktionen sowie sämtliche Architektur- und Umsetzungsentscheidungen wurden eigenständig getroffen. KI-generierte Vorschläge wurden kritisch geprüft, angepasst und in den Projektkontext integriert. Die Verantwortung für die finale Umsetzung, Funktionalität und Qualität des Prototyps lag jederzeit beim Projektverfasser.

### Reflexion
Der umfassende Einsatz von KI hat den Entwicklungsprozess effizienter gestaltet und das Verständnis für technische und konzeptionelle Zusammenhänge vertieft. Besonders hilfreich war die Möglichkeit, Lösungsansätze zu vergleichen und Probleme strukturiert zu analysieren. Gleichzeitig zeigte sich, dass KI-Vorschläge nicht immer direkt anwendbar sind und eine kritische Prüfung notwendig ist, um inhaltliche Fehler oder unpassende Umsetzungen zu vermeiden.

### Prompt‑Vorgehen [Optional]
Die verwendeten Prompts wurden iterativ aufgebaut und im Projektverlauf verfeinert. Typischerweise enthielten sie eine Beschreibung des Projektkontexts, der aktuellen Problemstellung sowie konkrete Anforderungen an Funktionalität oder Lösungsansätze. Zwischenergebnisse wurden reflektiert und die Prompts entsprechend angepasst, um präzisere und projektspezifische Unterstützung zu erhalten.

### Quellen & Rechte [Optional]
Es wurden keine externen Vorlagen, kostenpflichtigen Assets oder geschützten Inhalte direkt übernommen. Sämtliche KI-generierten Inhalte dienten als Hilfestellung und wurden eigenständig weiterentwickelt. Es wurden ausschliesslich frei verfügbare Technologien und Frameworks verwendet, deren Nutzung den jeweiligen Lizenzbedingungen entspricht.

## 8. Anhang [Optional]

<!-- Prüfliste (nicht abgeben, nur intern nutzen) -->
<!--
[ ] Kernfunktionalität gemäss Übungen umgesetzt (Workflows durchgängig)
[ ] Akzeptanzkriterien formuliert und erfüllt
[ ] Skizzen erstellt (mehrere Varianten, Unterschiede dokumentiert)
[ ] Referenz‑Mockup in Decide verlinkt (URL/Screenshots)
[ ] Deployment erreichbar
[ ] Umsetzung (Technik) vollständig (Technologie‑Stack; Tooling & KI‑Einsatz inkl. Überlegungen; Struktur/Komponenten; Daten/Schnittstellen falls genutzt)
[ ] Evaluation durchgeführt; Ergebnisse dokumentiert; Verbesserungen abgeleitet
[ ] Dokumentation vollständig, klar strukturiert und konsistent
[ ] KI‑Deklaration ausgefüllt (Werkzeuge; Zweck & Umfang; Art der Beiträge; Abgrenzung; Quellen & Rechte; optional: Prompt‑Vorgehen, Reflexion)
[ ] Erweiterungen (falls vorhanden) begründet und abgegrenzt
[ ] Anhang gepflegt (Testskript/Materialien, Rohdaten/Auswertung) [optional]
-->
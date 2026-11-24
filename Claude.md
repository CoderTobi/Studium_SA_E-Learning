# Scope
- Studiums Projekt an einer Hochschule
- Augenmerk liegt auf der Anwendung eines Erzeugungs-, Skruktur- und Verhaltensmusters
- Nur ein MVP welches das Minimum der Aufgabenstellung abdeckt
    - Keine Unit Tests
    - Schichtenmodell muss verwendet werden
    - Jeweils ein Erzeugungs-, Skruktur- und Verhaltensmusters muss angewendet sein
    - Haupt Fokus liegt auf den Komponenten `Kurs Manager` und `Course Repository`
        - andere Komponenten müssen nur funktional sein
    - Übertreib nicht und halte es simpel

## Aufgabenstellung der Hochschule
> ein E-Learning-System, das den Benutzern ermöglicht, auf Online-Kurse zuzugreifen, Lernmaterialien zu verwalten und Prüfungen abzulegen. Die Architektur soll auf dem Schichtenmodell basieren und modular aufgebaut sein.
> Konzentrieren Sie sich auf eine minimale, funktionierende Lösung (MVP)
### Benutzergruppen
- **Studenten** die sich für Kurse anmelden, Lernmaterialien abrufen und Prüfungen ablegen
- **Lehrende** die Kurse erstellen, Materialien hochladen und Prüfungen bewerten
- **Administratoren** das System verwalten und wichtige Verwaltungsfunktionen ausführen können
### Hauptfunktionen
- **Kursverwaltung**: Lehrende sollen in der Lage sein, Kurse zu erstellen und Materialien hochzuladen. Studenten können sich für Kurse anmelden und auf diese Materialien zugreifen.
- **Prüfungsmanagement**: Studenten können an Prüfungen teilnehmen, die von den Lehrenden erstellt werden. Die Prüfungen werden online abgelegt und die Ergebnisse sollen sowohl den Lehrenden als auch den Studenten angezeigt werden.
- **Benutzerverwaltung**: Jeder Benutzer (Studenten, Lehrende, Administratoren) muss sich im System registrieren und einloggen können. Administratoren sollen die Berechtigungen der Benutzer verwalten können.

# Techstack
- Sveltekit
- Typescript
- Tailwind CSS
- SQLite
- Dateispeicherung(e.g. PDF-Files) 
    - einfach direkt auf dem Host System mit Referenz in der DB, nichts kompliziertes

# Komponenten
- Wir haben ein [Draw IO Diagramm](Components.drawio) unserer Schichtenarchitektur mit den von uns geplanten Komponenten erstellt
## Präsentation Layer
- Login Ansicht
- Admin Ansicht
- Kurs Ansicht
- Prüfungs Ansicht
## Business Logic Layer
- Identity Provider
    - Nutzer Identifizieren und deren Identität verifizieren
    - Verwendet den Users and Permissions Manager und gleicht die Daten mit ihm ab
    - Erstellt eine neue Session mit den Identitätsdaten
    - Für dieses Projekt kein wirklicher Provider wie Authentic, sondern eine sehr simple funktionale Implementierung
- Users and Permissions Manager
    - Generell verwalten von Nutzern und Rollen: Neue Nutzer registrieren, entfernen, Rollen zuweisen, löschen, etc
    - Ergänzt Session um die Rolle des Nutzers und verwendet diese selbst um Admin Funktionen (Beispiel Nutzer hinzufügen) zu gewähren
- Session
    - Ermöglicht angemeldet zu sein und entsprechend der Rolle zugeschnittene Inhalte zu verwenden/sehen.
    - Wird von Prüfungs- und Kurs-Manager verwendet, um die Identität und Rolle des Nutzers festzustellen und entsprechende Funktionen freizuschalten.
- Prüfungs-Manager
    - Prüfung erstellen, ablegen und bewerten
    - Verwendet Content Manager, um Datein (bsp PDFs) abzulegen
- Kurs-Manager
    - Kurse erstellen, Kursanmeldungen und Materialien verwalten
    - Verwendet Content Manager, um Kurs Materialen (Dateien) abzulegen
- Content-Manager
    - Speichert Dateien (Kurs Materialen und Prüfungen)
    - Wird von Kurs- und Prüfungs-Manager verwendet um die Dateien abzulegen
## Data Access Layer
- Repositories
    - Stellen Funktionen bereit
    - Mappen intern auf SQL Querries und Dateisystem APIs
- User und Permission Repository
    - Für Speicherung von Nutzern und Rollen
    - Werden vom Users and Permissions Manager verwendet
- CourseRepository
    - Verwaltung von Kursen in der DB
    - Verwendet vom Kurs Manager
- ExamRepository
    - Verwaltung von Prüfungen und Bewertungen in der DB
    - Verwendet vom Prüfungs Manager
- ContentRepository
    - Verwaltung von Dokumenten auf dem Dateisystem und Referenz in der DB
    - Verwendet vom Content Manager

# Patterns
- Die von uns ausgewählten Muster sind: Signleton, Adapter, Observer
- Ein anderer Agent hat die relevanten Folien bereits in ein [MD file](Spezifikation_Entwurfsmuster.md) für dich umgewandelt
## Singleton
- Verwendung für die Erstellung der Datenbank Instanz
- Neue Komponente `Datenbank Instanz` in der Schicht `Data Access Layer`
    - beinhaltet das Singleton Pattern
    - Repositories verwenden die `getInstance` Methode um auf die DB zu zugreifen
- We sketched a possible way of implementation in a [dart file](<DB Adapter und Singleton Idee.dart>) you can use as reference
## Adapter
- Übersetzung zwischen Repositories und Datenbank Bibliothek
- Neue Komponente `Datenbank Adapter` in der Schicht `Data Access Layer`
    - beinhaltet das Adapter Target welches DB-Typ unabhängig und nur SQL spezifisch ist
    - beinhaltet Adapter für SQLite
- We sketched a possible way of implementation in a [dart file](<DB Adapter und Singleton Idee.dart>) you can use as reference
## Observer
- Verwendung beim Kurs Manger und der Kurs Ansicht (Ggf. auch beim Prüfungs Manager)
- Kurs Manager muss die Rolle des Subjects übernehmen
- Kurs Ansicht nutzt den Observer um die UI zu aktualisieren
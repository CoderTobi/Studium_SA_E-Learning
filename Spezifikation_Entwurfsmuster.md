# Spezifikation: Verbindliche Entwurfsmuster für die Projektumsetzung

> **Zielgruppe:** AI-Agent in der Umsetzungsphase.
> **Quelle:** Lehrfolien „Entwurfsmuster“ (Singleton, Adapter, Observer).
> **Sprache der Referenzimplementierung:** C++ (C++11 oder neuer).

---

## 0. Verbindliche Regeln für den Agenten

1. **Die Muster müssen exakt so umgesetzt werden, wie auf den Folien beschrieben.** Keine alternativen Varianten (z. B. kein Meyers-Singleton mit `static`-Lokalvariable, kein Template-Observer, kein Signal/Slot, kein `std::function`-Callback statt Observer-Klasse).
2. Für jedes Muster gibt es drei Ebenen:
   - **(A) Allgemeines UML** – die abstrakten Rollen des Musters.
   - **(B) Exemplarisches UML** – Abbildung der Rollen auf konkrete Klassen.
   - **(C) Referenzcode** – die verbindliche Code-Struktur.
3. **Vorrangregel:** Wo sich UML und Referenzcode in Namen oder Details unterscheiden, ist der **Referenzcode (C) maßgeblich** für Struktur, Signaturen, Sichtbarkeiten und Mechanik. Die Unterschiede sind je Muster im Abschnitt „Abweichungen UML ↔ Code“ dokumentiert.
4. Werden im Projekt andere Fachklassen als in den Beispielen benötigt, so wird **die Rollenstruktur 1:1 übernommen** und nur die Fachnamen ersetzt (siehe Rollentabellen). Mechanik, Sichtbarkeiten, Zeigertypen und Ablauf bleiben gleich.
5. Codeblöcke in diesem Dokument sind **wortgetreue Abschriften der Folien**. Ergänzungen, die nicht auf den Folien stehen, sind ausdrücklich mit **`[ERGÄNZUNG]`** markiert.
6. Kommentare im Code bleiben wie auf den Folien auf Deutsch.

---

## 1. Erzeugungsmuster – Singleton

### 1.1 Zweck (laut Folie)

Das Singleton-Muster sorgt dafür, dass eine Klasse **nur eine einzige Instanz** hat, und bietet eine **globale Zugriffsmethode** auf diese Instanz. Einsatz für **globale Steuerungskomponenten**, bei denen mehrere Teile des Systems dieselbe Instanz benötigen.

### 1.2 (A) Allgemeines UML

```
┌──────────────────────────┐
│     Singleton Class      │
├──────────────────────────┤
│ static Instance()        │   ◄── Client1-Requests ── Client 1
│ SingletonOperation()     │   ── Instance1 ─────────►
│ GetSingletonData()       │   ◄── Client2-Requests ── Client 2
├──────────────────────────┤   ── Instance1 ─────────►
│ static uniqueInstance    │   ◄── Client3-Requests ── Client 3
│ singletonData            │   ── Instance1 ─────────►
└──────────────────────────┘
```

**Kernaussage des Diagramms:** Mehrere Clients (Client 1, 2, 3) fragen die Instanz an und erhalten **alle dieselbe Instanz („Instance1“)**.

| Element | Art | Bedeutung |
|---|---|---|
| `static Instance()` | statische Methode | globale Zugriffsmethode, liefert die einzige Instanz |
| `SingletonOperation()` | Methode | fachliche Operation auf der Instanz |
| `GetSingletonData()` | Methode | Lesezugriff auf die gehaltenen Daten |
| `static uniqueInstance` | statisches Attribut | hält die einzige Instanz |
| `singletonData` | Attribut | von der Instanz verwaltete Daten |

### 1.3 (B) Exemplarisches UML

```
┌──────────────────────────┐
│     TransportNetwork     │
├──────────────────────────┤
│ static Instance()        │   ◄── Client1/2/3-Requests
│ AddStation()             │   ── Instance1 (für alle Clients) ──►
│ GetStation()             │
├──────────────────────────┤
│ static uniqueInstance    │
│ singletonData            │
└──────────────────────────┘
```

**Rollenzuordnung:**

| Rolle (allgemein) | Beispiel | Im Code |
|---|---|---|
| Singleton Class | `TransportNetwork` | `class TransportNetwork` |
| `static Instance()` | `static Instance()` | `static TransportNetwork* GetInstance()` |
| `SingletonOperation()` | `AddStation()` | `void AddStation(Station* station)` |
| `GetSingletonData()` | `GetStation()` | `Station* GetStation(int id) const` |
| `static uniqueInstance` | `static uniqueInstance` | `static TransportNetwork* _instance` |
| `singletonData` | `singletonData` | `std::vector<Station*> _stations` |
| (verwaltete Datenobjekte) | – | `class Station` |
| Client 1..n | – | `main()` bzw. beliebige Aufrufer |

### 1.4 (C) Referenzcode (wortgetreu von den Folien)

**Klasse `Station`:**

```cpp
class Station {
public:
    Station(int id) : _id(id) {}
    int GetId() const { return _id; }

private:
    int _id;
};
```

**Klasse `TransportNetwork` (Singleton):**

```cpp
class TransportNetwork {
public:
    // Methode, um die einzige Instanz der Klasse zu erhalten
    static TransportNetwork* GetInstance() {
        if (!_instance) {
            _instance = new TransportNetwork();
        }
        return _instance;
    }

    // Methode zum Hinzufügen einer Station
    void AddStation(Station* station) {
        _stations.push_back(station);
        std::cout << "Station mit ID " << station->GetId() << " hinzugefügt.\n";
    }

    // Methode zum Abrufen einer Station nach ID
    Station* GetStation(int id) const {
        for (auto station : _stations) {
            if (station->GetId() == id) {
                return station;
            }
        }
        return nullptr;
    }

    // Verhindert das Kopieren der Singleton-Instanz
    TransportNetwork(const TransportNetwork&) = delete;
    void operator=(const TransportNetwork&) = delete;

private:
    // Konstruktor ist privat, um direkte Instanziierung zu verhindern
    TransportNetwork() {}

    static TransportNetwork* _instance; // Statische Instanzvariable
    std::vector<Station*> _stations;    // Liste der Stationen
};
```

**`[ERGÄNZUNG]` – zwingend nötig, steht nicht auf der Folie:** Die statische Instanzvariable muss außerhalb der Klasse (genau einmal, in einer `.cpp`-Datei) definiert werden, sonst bricht der Linker ab (geprüft):

```cpp
TransportNetwork* TransportNetwork::_instance = nullptr;
```

**`[ERGÄNZUNG]` – benötigte Includes:** `#include <iostream>`, `#include <vector>`.

**Anwendung (wortgetreu):**

```cpp
int main() {
    // Zugriff auf die Singleton-Instanz
    TransportNetwork* network = TransportNetwork::GetInstance();

    // Stationen hinzufügen
    Station* station1 = new Station(1);
    Station* station2 = new Station(2);

    network->AddStation(station1);
    network->AddStation(station2);

    // Zugriff auf eine Station
    Station* retrievedStation = network->GetStation(1);
    if (retrievedStation) {
        std::cout << "Station mit ID " << retrievedStation->GetId() << " gefunden.\n";
    } else {
        std::cout << "Station nicht gefunden.\n";
    }

    return 0;
}
```

**Erwartete Ausgabe:**

```
Station mit ID 1 hinzugefügt.
Station mit ID 2 hinzugefügt.
Station mit ID 1 gefunden.
```

### 1.5 Pflichtmerkmale (Checkliste)

- [ ] Konstruktor ist **`private`**.
- [ ] Copy-Konstruktor und Zuweisungsoperator sind **`= delete`** (Signatur exakt: `TransportNetwork(const TransportNetwork&) = delete;` und `void operator=(const TransportNetwork&) = delete;`).
- [ ] Instanz wird als **Rohzeiger** in einer **statischen privaten Membervariable** `_instance` gehalten.
- [ ] Zugriff ausschließlich über **`static ... GetInstance()`**, Rückgabe als **Zeiger**.
- [ ] **Lazy Initialization:** Instanz wird beim ersten Aufruf per `if (!_instance) { _instance = new ...; }` erzeugt.
- [ ] Verwaltete Objekte als `std::vector<T*>` (Rohzeiger), Suche per Range-for, Rückgabe `nullptr` bei Nichtfinden.
- [ ] Keine Smart Pointer, keine Meyers-Singleton-Variante, keine zusätzliche Thread-Synchronisation (steht nicht auf den Folien).

### 1.6 Abweichungen UML ↔ Code

| UML | Code (maßgeblich) |
|---|---|
| `Instance()` | `GetInstance()` |
| `uniqueInstance` | `_instance` |
| `singletonData` | `_stations` |
| `SingletonOperation()` / `GetSingletonData()` | `AddStation()` / `GetStation()` |

---

## 2. Strukturmuster – Adapter

### 2.1 Zweck (laut Folie)

Das Adapter-Muster macht eine Klasse oder ein Objekt **mit einer anderen Schnittstelle kompatibel**, sodass sie in einem bestimmten System oder Kontext verwendet werden kann. Der Adapter **„übersetzt“** die Schnittstelle oder das Verhalten einer bestehenden Klasse so, dass sie die Anforderungen einer neuen Schnittstelle erfüllt.

### 2.2 (A) Allgemeines UML

```
┌────────┐        ┌──────────────────────────────┐          ┌──────────────────────────────┐
│ Client │ ─────► │            Target            │          │           Adaptee            │
└────────┘        │ „Das Ziel, auf das adaptiert │          │ „Das, was adaptiert werden   │
                  │  werden muss“                │          │  muss“                       │
                  │ z. B. Business Logic         │          │ z. B. BT-HW (Bluetooth-HW)   │
                  ├──────────────────────────────┤          ├──────────────────────────────┤
                  │ Requests()                   │          │ SpecificRequests()           │
                  └──────────────────────────────┘          └──────────────────────────────┘
                                 △                                        △
                                 │ (Vererbung)          (Implementation)  │
                                 └──────────────┬─────────────────────────┘
                                       ┌────────────────┐
                                       │    Adapter     │
                                       ├────────────────┤        ┌──────────────────────┐
                                       │ Requests()  o--┼------- │ SpecificRequests()   │
                                       └────────────────┘        └──────────────────────┘
```

| Rolle | Bedeutung |
|---|---|
| **Client** | nutzt ausschließlich die Target-Schnittstelle (gerichtete Assoziation Client → Target) |
| **Target** | neue/gewünschte Schnittstelle, Methode `Requests()` |
| **Adaptee** | bestehende/alte Klasse mit inkompatibler Methode `SpecificRequests()` |
| **Adapter** | erbt von Target; seine `Requests()`-Implementierung ruft `SpecificRequests()` des Adaptee auf (Notiz im Diagramm) |

### 2.3 (B) Exemplarisches UML

```
┌────────┐      ┌───────────────────────────────┐      ┌──────────────────────────────────────┐
│ Client │ ───► │            Route              │      │              LegacyRoute             │
└────────┘      │ Neue Business Logic (Target)  │      │ Alte Legacy Business Logic (Adaptee) │
                ├───────────────────────────────┤      ├──────────────────────────────────────┤
                │ Requests()                    │      │ SpecificRequests()                   │
                └───────────────────────────────┘      └──────────────────────────────────────┘
                               △                                        △
                               └──────────────┬─────────────────────────┘ (Implementation)
                                     ┌─────────────────┐
                                     │  RouteAdapter   │
                                     ├─────────────────┤
                                     │ Requests() o----┼---- SpecificRequests()
                                     └─────────────────┘
```

**Rollenzuordnung:**

| Rolle (allgemein) | Beispiel | Im Code |
|---|---|---|
| Client | Client | `main()` |
| Target | `Route` | abstrakte Klasse `Route` |
| `Requests()` | `Requests()` | `virtual void Connect(int stationA, int stationB) = 0;` |
| Adaptee | `LegacyRoute` | Klasse `LegacyRoute` |
| `SpecificRequests()` | `SpecificRequests()` | `void ConnectOld(int stationA, int stationB)` |
| Adapter | `RouteAdapter` | `class RouteAdapter : public Route` mit Member `LegacyRoute* _legacyRoute` |

### 2.4 (C) Referenzcode (wortgetreu von den Folien)

**Target-Klasse `Route`:**

```cpp
class Route {
public:
    virtual void Connect(int stationA, int stationB) = 0;
    virtual ~Route() {}
};
```

**Adaptee-Klasse `LegacyRoute`:**

```cpp
class LegacyRoute {
public:
    void ConnectOld(int stationA, int stationB) {
        std::cout << "Connecting stations " << stationA
                  << " and " << stationB << " using LegacyRoute." << std::endl;
    }
};
```

**Adapter-Klasse `RouteAdapter`:**

```cpp
class RouteAdapter : public Route {
public:
    RouteAdapter(LegacyRoute* legacyRoute) : _legacyRoute(legacyRoute) {}

    void Connect(int stationA, int stationB) override {
        _legacyRoute->ConnectOld(stationA, stationB);
    }

private:
    LegacyRoute* _legacyRoute;
};
```

**`[ERGÄNZUNG]` – benötigtes Include:** `#include <iostream>`.

**Anwendung (wortgetreu):**

```cpp
int main() {
    // Alte Klasse
    LegacyRoute* legacyRoute = new LegacyRoute();

    // Adapter erstellt, um LegacyRoute zu nutzen
    Route* adaptedRoute = new RouteAdapter(legacyRoute);

    // Verwendung des Adapters
    adaptedRoute->Connect(1, 2); // Output: Connecting stations 1 and 2 using LegacyRoute.

    // Ressourcen aufräumen
    delete legacyRoute;
    delete adaptedRoute;

    return 0;
}
```

**Erwartete Ausgabe:**

```
Connecting stations 1 and 2 using LegacyRoute.
```

### 2.5 Pflichtmerkmale (Checkliste)

- [ ] Target ist eine **abstrakte Klasse** mit **rein virtueller** Methode (`= 0`) und **virtuellem Destruktor**.
- [ ] Adaptee bleibt **unverändert** (keine Vererbung von Target, keine Anpassung seiner Methoden).
- [ ] Adapter **erbt `public` von Target**.
- [ ] Adapter hält den Adaptee als **privaten Rohzeiger** (`LegacyRoute* _legacyRoute`), übergeben per **Konstruktor** (Initialisierungsliste).
- [ ] Die Target-Methode wird mit **`override`** implementiert und **delegiert 1:1** an die Adaptee-Methode (gleiche Parameter durchreichen).
- [ ] Der Client arbeitet nur mit einem **`Target*`** (`Route* adaptedRoute = new RouteAdapter(...)`), nie direkt mit dem Adapter-Typ.
- [ ] Der Adapter besitzt den Adaptee **nicht** (löscht ihn nicht); Erzeugung und `delete` des Adaptee erfolgen beim Client.

### 2.6 Abweichungen UML ↔ Code

| UML | Code (maßgeblich) |
|---|---|
| `Requests()` | `Connect(int stationA, int stationB)` |
| `SpecificRequests()` | `ConnectOld(int stationA, int stationB)` |
| Pfeil „Implementation“ vom Adapter zum Adaptee (Vererbungsdreieck) | **Kein** Erben von `LegacyRoute`; Anbindung per **Komposition** über den Member `LegacyRoute* _legacyRoute` (Objektadapter) |

---

## 3. Verhaltensmuster – Observer

### 3.1 Zweck (laut Folie)

Das Observer-Muster definiert eine **1:n-Abhängigkeit** zwischen Objekten. Wenn ein Objekt (das **Subject**) seinen Zustand ändert, werden **automatisch alle abhängigen Objekte (die Observer) benachrichtigt** und aktualisiert.

### 3.2 (A) Allgemeines UML

```
┌───────────────────┐        Observer           ┌──────────────┐
│      Subject      │ ────────────────────────► │   Observer   │
├───────────────────┤                           ├──────────────┤
│ Attach(Observer)  │                           │ Update()     │
│ Detach(Observer)  │                           └──────────────┘
│ Notify()  o-------┼-- for all o in observers {        △
└───────────────────┘       o->Update()                 │
          △               }                             │
          │                                             │
┌───────────────────┐                           ┌──────────────────┐
│  ConcreteSubject  │ ◄──────────────────────── │ ConcreteObserver │
├───────────────────┤                           ├──────────────────┤
│ GetState() o------┼-- return subjectState     │ Update() o-------┼-- observerState =
│ SetState()        │                           ├──────────────────┤     subject->GetState()
├───────────────────┤                           │ observerState    │
│ subjectState      │                           └──────────────────┘
└───────────────────┘
```

| Element | Bedeutung |
|---|---|
| **Subject** | verwaltet die Liste der Observer: `Attach(Observer)`, `Detach(Observer)`, `Notify()` |
| `Notify()` | ruft für **alle** registrierten Observer `Update()` auf |
| **Observer** | abstrakte Schnittstelle mit `Update()` |
| **ConcreteSubject** | erbt von Subject; hält `subjectState`, `GetState()` liefert ihn, `SetState()` ändert ihn |
| **ConcreteObserver** | erbt von Observer; implementiert `Update()` |

### 3.3 (B) Exemplarisches UML

Identisch zu (A), mit folgenden Namen:

| Rolle (allgemein) | Beispiel (UML) | Im Code |
|---|---|---|
| Subject | Subject | `class Subject` (Basisklasse) |
| Observer | Observer | `class Observer` (Schnittstelle) |
| ConcreteSubject | `VehicleSubject` | `class ConcreteSubject : public Subject`, Instanz `vehicleStatus` |
| ConcreteObserver | `Dispatcher` | `class ConcreteObserver : public Observer`, Instanzen `dispatcherA`, `dispatcherB` |
| `GetState()` / `SetState()` | `GetState()` / `SetState()` | `GetStatus()` / `SetStatus(const std::string&)` |
| `subjectState` | `subjectState` | `std::string _status` (protected, in `Subject`) |
| `Update()` | `Update()` | `Update(const std::string& status)` |

### 3.4 (C) Referenzcode (wortgetreu von den Folien)

**Observer-Schnittstelle:**

```cpp
class Observer {
public:
    virtual void Update(const std::string& status) = 0;
    virtual ~Observer() {}
};
```

**Subject-Basisklasse:**

```cpp
#include <vector>
#include <algorithm>
#include <string>

class Subject {
public:
    void Attach(Observer* observer) {
        _observers.push_back(observer);
    }

    void Detach(Observer* observer) {
        _observers.erase(
            std::remove(_observers.begin(), _observers.end(), observer),
            _observers.end()
        );
    }

    void Notify() {
        for (auto observer : _observers) {
            observer->Update(_status);
        }
    }

    virtual void SetStatus(const std::string& status) {
        _status = status;
        Notify();
    }

protected:
    std::string _status;

private:
    std::vector<Observer*> _observers;
};
```

**ConcreteSubject:**

```cpp
class ConcreteSubject : public Subject {
public:
    void SetStatus(const std::string& status) override {
        _status = status;
        Notify();
    }

    std::string GetStatus() const {
        return _status;
    }
};
```

**ConcreteObserver:**

```cpp
#include <iostream>

class ConcreteObserver : public Observer {
public:
    ConcreteObserver(const std::string& name) : _name(name) {}

    void Update(const std::string& status) override {
        std::cout << "Observer " << _name
                  << " notified: Subject status is now " << status << std::endl;
    }

private:
    std::string _name;
};
```

**Anwendung – „Observer in der Ausführung“ (wortgetreu):**

```cpp
int main() {
    // Erstellen eines konkreten Subjekts
    ConcreteSubject* vehicleStatus = new ConcreteSubject();

    // Erstellen von konkreten Beobachtern
    Observer* dispatcherA = new ConcreteObserver("A");
    Observer* dispatcherB = new ConcreteObserver("B");

    // Beobachter registrieren
    vehicleStatus->Attach(dispatcherA);
    vehicleStatus->Attach(dispatcherB);

    // Zustand ändern und Benachrichtigung auslösen
    vehicleStatus->SetStatus("Ready");
    vehicleStatus->SetStatus("On Route");

    // Einen Beobachter abmelden
    vehicleStatus->Detach(dispatcherB);
    vehicleStatus->SetStatus("In Maintenance");

    // Speicher freigeben
    delete dispatcherA;
    delete dispatcherB;
    delete vehicleStatus;

    return 0;
}
```

**Erwartete Ausgabe (geprüft):**

```
Observer A notified: Subject status is now Ready
Observer B notified: Subject status is now Ready
Observer A notified: Subject status is now On Route
Observer B notified: Subject status is now On Route
Observer A notified: Subject status is now In Maintenance
```

**Hinweise zur Reihenfolge der Dateien/Includes:** Die `Observer`-Schnittstelle benötigt `<string>` und muss vor `Subject` deklariert sein. `ConcreteObserver` benötigt `<iostream>`.

### 3.5 Pflichtmerkmale (Checkliste)

- [ ] `Observer` ist eine **abstrakte Schnittstelle** mit rein virtuellem `Update(const std::string& status)` und **virtuellem Destruktor**.
- [ ] `Subject` ist eine **konkrete Basisklasse** mit:
  - `Attach(Observer*)` → `push_back` in `std::vector<Observer*>`,
  - `Detach(Observer*)` → **Erase-Remove-Idiom** (`std::remove` + `erase`),
  - `Notify()` → Range-for über alle Observer, Aufruf `observer->Update(_status)`,
  - `virtual void SetStatus(const std::string&)` → setzt `_status`, ruft `Notify()`.
- [ ] Zustand `_status` ist **`protected`** in `Subject`; Observer-Liste `_observers` ist **`private`**.
- [ ] `ConcreteSubject` **überschreibt `SetStatus` mit `override`** (setzt Zustand und ruft `Notify()`) und bietet `GetStatus() const`.
- [ ] `ConcreteObserver` erhält einen Namen per Konstruktor und **implementiert `Update` mit `override`**.
- [ ] **Push-Modell:** Der Zustand wird als Parameter an `Update` übergeben; der Observer hält **keinen** Zeiger auf das Subject.
- [ ] Zustandsänderung löst **automatisch** die Benachrichtigung aus (kein manueller `Notify()`-Aufruf beim Client).
- [ ] Observer werden im Client als `Observer*` (Basistyp) gehalten; Speicherverwaltung mit `new`/`delete` beim Client.

### 3.6 Abweichungen UML ↔ Code

| UML | Code (maßgeblich) |
|---|---|
| `GetState()` / `SetState()` | `GetStatus()` / `SetStatus(const std::string&)` |
| `subjectState` in ConcreteSubject | `_status` liegt `protected` in der **Basisklasse `Subject`** |
| `Update()` ohne Parameter, Observer holt Zustand per `subject->GetState()` (Pull) | `Update(const std::string& status)`, Zustand wird mitgeliefert (**Push**) |
| `observerState` im ConcreteObserver | nicht vorhanden; stattdessen `_name` |
| Assoziation ConcreteObserver → ConcreteSubject | nicht vorhanden (kein Subject-Zeiger im Observer) |
| `VehicleSubject` / `Dispatcher` | `ConcreteSubject` / `ConcreteObserver` (Variablen `vehicleStatus`, `dispatcherA/B`) |

---

## 4. Allgemeine Konventionen aus dem Referenzcode

Diese Konventionen gelten für alle drei Muster und sollen im Projekt beibehalten werden:

| Konvention | Ausprägung |
|---|---|
| Klassen- und Methodennamen | **PascalCase** (`TransportNetwork`, `GetInstance`, `AddStation`) |
| Private/geschützte Membervariablen | **Unterstrich-Präfix + camelCase** (`_instance`, `_stations`, `_legacyRoute`, `_observers`, `_status`, `_name`) |
| Parameter / lokale Variablen | **camelCase** (`stationA`, `legacyRoute`, `retrievedStation`) |
| Objektverwaltung | **Rohzeiger** mit `new` / `delete`; keine Smart Pointer |
| Polymorphie | abstrakte Basisklassen mit `= 0`, **virtueller Destruktor**, Überschreiben mit **`override`** |
| Konstruktoren | Initialisierung über **Initialisierungsliste** |
| Getter | als `const` deklariert |
| Ausgaben | `std::cout`, Zeilenende `"\n"` bzw. `std::endl` wie im jeweiligen Beispiel |
| Container | `std::vector<T*>` |
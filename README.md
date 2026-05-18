# LohnTool 2026 – Browser-Version

Brutto-Netto-Berechnung nach PAP 2026 (BMF-Schreiben 12.11.2025)
und SV-Rechengrößen-VO 2026.  
TypeScript-Portierung der Delphi-Originalanwendung.

---

## Projektstruktur

```
LohnTool2026/
├── src/
│   ├── LST2026.ts      ← Lohnsteuerberechnung (PAP 2026)
│   ├── SV2026.ts       ← Sozialversicherungsberechnung 2026
│   ├── app.ts          ← Hauptlogik / UI-Controller
│   ├── index.html      ← Benutzeroberfläche
│   └── style.css       ← Styling
├── dist/               ← kompilierte Ausgabe (nach npm run build)
├── .vscode/
│   ├── launch.json     ← Debugger-Konfiguration (Chrome)
│   ├── tasks.json      ← Build-Task (Strg+Shift+B)
│   └── extensions.json ← Empfohlene Extensions
├── tsconfig.json
├── package.json
└── README.md
```

---

## Schnellstart

### Voraussetzungen
- [Node.js](https://nodejs.org/) (≥ 18)
- [VS Code](https://code.visualstudio.com/)

### Einrichten

```bash
cd LohnTool2026
npm install
npm run build        # einmalig kompilieren
```

### Im Browser öffnen

**Option 1 – Live Server (empfohlen):**
1. VS Code Extension „Live Server" installieren (in `.vscode/extensions.json` vorgeschlagen)
2. `dist/index.html` öffnen → rechte Maustaste → **Open with Live Server**

**Option 2 – direkt öffnen:**
```
dist/index.html  →  im Browser öffnen
```

> **Hinweis:** Da ES-Module verwendet werden, muss die Datei über einen HTTP-Server
> geöffnet werden (Live Server, `npx serve dist`, etc.), **nicht** direkt als `file://`.

### Während der Entwicklung (automatischer Rebuild)

```bash
npm run watch
```
Jede Änderung in `src/*.ts` löst sofort einen Neu-Build aus.

---

## Module

| Datei | Entspricht | Inhalt |
|---|---|---|
| `LST2026.ts` | `LST2026.pas` | Vollständiger PAP 2026 (Lohnsteuer, SolZ, KiSt-Bemessungsgrundlage) |
| `SV2026.ts` | `SV2026.pas` | KV / PV / RV / AV, AN- und AG-Anteile |
| `app.ts` | `ULohnForm.pas` | UI-Logik, Eingabevalidierung, Druckausgabe |

---

## Drucken / PDF

Der Button **Drucken / PDF** öffnet ein neues Fenster mit der formatierten
Lohnabrechnung. Über den Browser-Druckdialog (Strg+P) kann daraus eine
PDF-Datei erzeugt werden (Drucker „Als PDF speichern").

---

## Hinweis

Berechnung nach PAP 2026 und SV-Rechengrößen-VO 2026. Ohne Gewähr –
maßgeblich ist die Lohnsteuerbescheinigung.

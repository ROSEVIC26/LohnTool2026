# LohnTool – Browser-Version

Brutto-Netto-Berechnung (Lohnsteuer, Solidaritätszuschlag, Kirchensteuer,
Sozialversicherung) für mehrere Abrechnungsjahre mit **einer** Erfassungsmaske.
TypeScript-Portierung der Delphi-Originalanwendung.

| Jahr | Lohnsteuer | Sozialversicherung | Status |
|---|---|---|---|
| 2026 | PAP 2026, BMF-Schreiben 12.11.2025 | SV-Rechengrößen-VO 2026 | endgültig |
| 2027 | PAP-**Entwurf** 2027, BMF 08.10.2026 | SV-Rechengrößen 2027 (Kabinettsentwurf), PNOG-Entwurf | **vorläufig** |

---

## Projektstruktur

```
LohnTool2026/
├── src/
│   ├── LohnTypen.ts        ← gemeinsame Ein-/Ausgangsparameter aller Jahre
│   ├── Jahresversionen.ts  ← Jahresweiche: Jahr → LST/SV-Modul + Rechtsstand
│   ├── LST2026.ts          ← Lohnsteuer nach PAP 2026
│   ├── LST2027.ts          ← Lohnsteuer nach PAP 2027 (Entwurf)
│   ├── SV2026.ts           ← Sozialversicherung 2026
│   ├── SV2027.ts           ← Sozialversicherung 2027 (vorläufig)
│   ├── app.ts              ← UI-Logik (jahresunabhängig)
│   ├── index.html          ← Benutzeroberfläche
│   └── style.css           ← Styling
├── server/server.ts        ← API (POST /api/berechne, GET /api/jahre)
├── test/pruef-lst.mjs      ← Abgleich mit den BMF-Prüftabellen
├── docs/                   ← veröffentlichte Oberfläche
├── tsconfig.json           ← Build Oberfläche
├── tsconfig.server.json    ← Build Server
├── tsconfig.test.json      ← Build für Tests
└── package.json
```

---

## Ablauf

1. Die Oberfläche lädt beim Start `GET /api/jahre` und füllt die Jahresauswahl.
   Vorgewählt ist das aktuelle Kalenderjahr (sonst das nächstliegende).
2. Vorläufige Jahre sind in der Auswahl mit `*` markiert. Darüber steht ein
   gelbes Hinweisband, und der Ausdruck trägt den Vermerk „vorläufig“.
3. `POST /api/berechne` erhält das Feld `jahr`. Der Server holt sich das
   passende LST-/SV-Modul aus `Jahresversionen.ts`. Fehlt `jahr`, wird wie
   bisher 2026 gerechnet. Nicht unterstützte Jahre liefern HTTP 400.

### Private Kranken-/Pflegeversicherung

Bei „Private KV“ werden drei Monatsbeträge erfasst:

| Feld | API-Feld | Verwendung |
|---|---|---|
| KV-Beitrag | `pkvBeitragKV` | AG-Zuschuss KV: höchstens die Hälfte, max. Höchstzuschuss (§ 257 SGB V) |
| davon Basis-KV (optional) | `pkvBasisKV` | Vorsorgepauschale Lohnsteuer (PKPV); leer = gesamter KV-Beitrag |
| PV-Beitrag | `pkvBeitragPV` | AG-Zuschuss PV (Sachsen 1,3 %, sonst 1,8 % der BBG), Vorsorgepauschale |

Der AG-Zuschuss wird berechnet, nicht mehr eingegeben. Er geht als steuerfreier
Zuschuss (PKPVAGZ) in die Lohnsteuer ein und wird mit dem Lohn ausgezahlt
(Auszahlungsbetrag = Netto + Zuschuss). Ältere Oberflächen, die nur `pkpv`
schicken, werden weiter angenommen; der Betrag gilt dann als KV-Beitrag.

---

## Befehle

```bash
npm install
npm run build          # Oberfläche kompilieren und nach docs/ kopieren
npm run build:server   # Server kompilieren (server-dist/)
npm test               # LST2026/LST2027 gegen die BMF-Prüftabellen prüfen
npm start              # Server lokal starten (Port 3000)
```

**Reihenfolge beim Veröffentlichen:** zuerst den Server neu deployen, dann
`docs/`. Eine neue Oberfläche an einem alten Server meldet für 2027 einen
klaren Fehler und rechnet nicht still mit 2026-Werten.

---

## Neues Jahr aufnehmen (z. B. 2028)

1. `LST2027.ts` → `LST2028.ts` kopieren. Werte und Ablauf an den neuen PAP
   anpassen (MPARA, Tarif-Unterprogramm, ggf. neue Grenzwerte).
2. `SV2027.ts` → `SV2028.ts` kopieren und die Rechengrößen anpassen.
3. Beide Module in `src/Jahresversionen.ts` eintragen, mit Status `vorlaeufig`
   und Hinweisen.
4. Die Dateien in `tsconfig.json` und `tsconfig.server.json` eintragen.
5. Die Prüftabellen aus dem BMF-PDF (Anlage 1, letzte Seiten) in
   `test/pruef-lst.mjs` ergänzen und `npm test` ausführen.
6. In `app.ts` die Fallback-Liste `JAHRE` ergänzen. Sie wird nur genutzt,
   wenn der Server nicht erreichbar ist.

Sobald der endgültige PAP bzw. die verkündeten Rechengrößen vorliegen:
alle Stellen mit `[ENTWURF]` / `[VORLÄUFIG]` prüfen, die Prüftabellen
ersetzen und den Status auf `endgueltig` setzen.

---

## Hinweis

Ohne Gewähr – maßgeblich ist die Lohnsteuerbescheinigung.

import express from 'express';
import { Request, Response, NextFunction } from 'express';
import type { LSTParams, SVParams } from '../src/LohnTypen.js';
import {
  JAHRESVERSIONEN, UNTERSTUETZTE_JAHRE, jahresversion, standardJahr
} from '../src/Jahresversionen.js';

const app  = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// JSON-Anfragen verstehen
app.use(express.json());

// Browser darf vom gleichen Rechner zugreifen (CORS)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// -------------------------------------------------------
// API-Endpunkt: GET /api/jahre
// Liefert die unterstützten Abrechnungsjahre mit Rechtsstand
// -------------------------------------------------------
app.get('/api/jahre', (_req, res) => {
  res.json({
    standard: standardJahr(),
    jahre: UNTERSTUETZTE_JAHRE.map(j => {
      const v = JAHRESVERSIONEN[j];
      return { jahr: v.jahr, status: v.status, stand: v.stand, hinweise: v.hinweise };
    }),
  });
});

// -------------------------------------------------------
// API-Endpunkt: POST /api/berechne
// Feld `jahr` wählt die Jahresversion (fehlt es: 2026, wie bisher)
// -------------------------------------------------------
app.post('/api/berechne', (req, res) => {
  const d = req.body;

  const jahr = d.jahr === undefined ? 2026 : Number(d.jahr);
  const V = jahresversion(jahr);
  if (!V) {
    res.status(400).json({
      fehler: `Abrechnungsjahr ${d.jahr} wird nicht unterstützt.`,
      jahre : UNTERSTUETZTE_JAHRE,
    });
    return;
  }

  // Private Kranken-/Pflegeversicherung (nur bei pkv = 1)
  //   pkvBeitragKV : Monatsbeitrag private KV (gesamt), Cent
  //   pkvBasisKV   : davon Basisabsicherung lt. Versicherer (optional, sonst = Beitrag)
  //   pkvBeitragPV : Monatsbeitrag private Pflege-Pflichtversicherung, Cent
  // Ältere Oberflächen schicken nur `pkpv` (ein Gesamtbetrag) – wird als KV-Beitrag gewertet.
  const pkv          = d.pkv ?? 0;
  const pkvBeitragKV = pkv ? (d.pkvBeitragKV ?? d.pkpv ?? 0) : 0;
  const pkvBeitragPV = pkv ? (d.pkvBeitragPV ?? 0) : 0;
  const pkvBasisKV   = pkv ? (d.pkvBasisKV ?? pkvBeitragKV) : 0;
  if (pkvBasisKV > pkvBeitragKV) {
    res.status(400).json({ fehler: 'Der Basisanteil darf nicht höher sein als der KV-Beitrag.' });
    return;
  }

  // Sozialversicherung (zuerst: der AG-Zuschuss zur PKV fließt in die Lohnsteuer ein)
  const SP = {} as SVParams;
  V.sv.init(SP);
  SP.BRUTTO       = d.brutto;
  SP.PKV          = pkv;
  SP.KVZ          = d.kvz      ?? 2.90;
  SP.PKVBeitragKV = pkvBeitragKV;
  SP.PKVBeitragPV = pkvBeitragPV;
  SP.PVKinder     = d.pvKinder ?? 1;
  SP.PVS          = d.pvs      ?? 0;
  SP.KRV          = d.krv      ?? 0;
  SP.KAV          = d.alv      ?? 0;

  const SR = V.sv.berechne(SP);

  // Steuerfreier AG-Zuschuss zur PKV/PPV (§ 3 Nr. 62 EStG) = berechneter Zuschuss
  const pkvZuschuss = pkv ? SR.KVAG + SR.PVAG : 0;

  // Lohnsteuer
  const LP = {} as LSTParams;
  V.lst.init(LP);
  LP.RE4      = d.brutto;
  LP.JRE4     = d.brutto * 12;
  LP.LZZ      = 2;
  LP.STKL     = d.stkl;
  LP.ZKF      = d.zkf      ?? 0;
  LP.LZZFREIB = d.freibet  ?? 0;
  LP.KVZ      = d.kvz      ?? 2.90;
  LP.PKV      = pkv;
  LP.PKPV     = pkvBasisKV + pkvBeitragPV;   // Basis-KV + Pflege-Pflichtversicherung
  LP.PKPVAGZ  = pkvZuschuss;
  LP.KRV      = d.krv      ?? 0;
  LP.ALV      = d.alv      ?? 0;
  LP.PVS      = d.pvs      ?? 0;
  LP.PVZ      = d.pvz      ?? 0;
  // Beitragsabschläge PV ab dem 2. Kind (0 = keiner … 4 = 2. bis 5. Kind),
  // gehen in die Vorsorgepauschale ein – gleiche Kinderzahl wie in der SV
  const pvKinder = d.pvKinder ?? 1;
  LP.PVA      = pvKinder >= 2 ? Math.min(pvKinder, 5) - 1 : 0;
  LP.R        = d.kist     ?? 0;
  if (d.alter1 && d.gebJahr) {
    LP.ALTER1 = 1;
    LP.AJAHR  = d.gebJahr + 65;
  }

  const LR = V.lst.berechne(LP);

  // Kirchensteuer
  const kiStSatz = d.kiStSatz ?? 0;
  const kiSt     = d.kist ? Math.trunc(LR.BK * kiStSatz / 100.0) : 0;

  // Antwort
  res.json({
    jahr    : V.jahr,
    status  : V.status,
    stand   : V.stand,
    hinweise: V.hinweise,
    lstlzz  : LR.LSTLZZ,
    solzlzz : LR.SOLZLZZ,
    bk      : LR.BK,
    kiSt    : kiSt,
    rvan    : SR.RVAN,
    kvan    : SR.KVAN,
    pvan    : SR.PVAN,
    avan    : SR.AVAN,
    gsan    : SR.GSAN,
    rvag    : SR.RVAG,
    kvag    : SR.KVAG,
    pvag    : SR.PVAG,
    avag    : SR.AVAG,
    gsag    : SR.GSAG,
    pkvZuschuss,
  });
});

// Server starten
app.listen(PORT, () => {
  console.log(`LohnTool Server läuft auf http://localhost:${PORT} (Jahre: ${UNTERSTUETZTE_JAHRE.join(', ')})`);
});

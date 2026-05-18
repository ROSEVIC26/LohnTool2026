/**
 * app.ts
 * LohnTool 2026 – Hauptlogik (Browser)
 * Portierung von ULohnForm.pas
 */

import { LST2026Params, LST2026Result, LST2026_Init, LST2026_Berechne } from './LST2026.js';
import { SV2026Params,  SV2026Result,  SV2026_Init,  SV2026_Berechne  } from './SV2026.js';

// ---------------------------------------------------------------------------
// Konstanten
// ---------------------------------------------------------------------------
const MONATE = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember'
];

const BUNDESLAENDER = [
  'Baden-Württemberg','Bayern','Berlin','Brandenburg','Bremen',
  'Hamburg','Hessen','Mecklenburg-Vorpommern','Niedersachsen',
  'Nordrhein-Westfalen','Rheinland-Pfalz','Saarland','Sachsen',
  'Sachsen-Anhalt','Schleswig-Holstein','Thüringen'
];

// Kirchensteuersatz je Bundesland: 8 % für BW(0) und Bayern(1), sonst 9 %
const KISTSAETZE: number[] = [
  8,8,9,9,9,9,9,9,9,9,9,9,9,9,9,9
];

// ---------------------------------------------------------------------------
// Gespeicherte Ergebnisse für Druck
// ---------------------------------------------------------------------------
let gLSTResult: LST2026Result | null = null;
let gSVResult:  SV2026Result  | null = null;
let gBruttoCent = 0;
let gKiStCent   = 0;

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------
function fmtEuro(cent: number): string {
  return (cent / 100).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' €';
}

/** Liest einen Betrag "1.234,56" aus einem Input und gibt Cent zurück */
function parseEuroCent(value: string, feldname: string): number | null {
  const s = value.trim().replace(/\./g, '').replace(',', '.');
  const v = parseFloat(s);
  if (isNaN(v) || v < 0) {
    alert(`${feldname}: Ungültige Eingabe „${value}".`);
    return null;
  }
  return Math.round(v * 100);
}

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

// ---------------------------------------------------------------------------
// Initialisierung
// ---------------------------------------------------------------------------
function initControls(): void {
  const now = new Date();

  // Monate
  const cmbMonat = el<HTMLSelectElement>('cmbMonat');
  MONATE.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = String(i + 1);
    opt.textContent = m;
    cmbMonat.appendChild(opt);
  });
  cmbMonat.value = String(now.getMonth() + 1);

  // Jahr
  (el<HTMLInputElement>('spnJahr')).value = String(now.getFullYear());

  // Bundesländer
  const cmbBundesland = el<HTMLSelectElement>('cmbBundesland');
  BUNDESLAENDER.forEach((b, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = b;
    cmbBundesland.appendChild(opt);
  });
  cmbBundesland.value = '0';  // BW Standard

  // Standardwerte
  el<HTMLInputElement>('edtBrutto').value     = '4.000,00';
  el<HTMLInputElement>('edtFreibetrag').value = '0,00';
  el<HTMLInputElement>('edtKVZ').value        = '2,90';
  el<HTMLInputElement>('edtKFB').value        = '0,0';
  el<HTMLInputElement>('edtGebJahr').value    = '';
  el<HTMLInputElement>('edtPKVBeitrag').value = '0,00';
  el<HTMLInputElement>('edtPKVAGZusch').value = '0,00';

  (el<HTMLInputElement>('rdoGKV')).checked = true;

  aktualisiereSVFelder();
  aktualisiereKiStFelder();
}

function aktualisiereSVFelder(): void {
  const gkv = (el<HTMLInputElement>('rdoGKV')).checked;
  const gkvElems  = ['lblKVZ','edtKVZ','lblKinder','cmbKinder','sachsenRow'];
  const pkvElems  = ['lblPKVBeitrag','edtPKVBeitrag','lblPKVAGZusch','edtPKVAGZusch'];

  gkvElems.forEach(id => {
    const e = document.getElementById(id);
    if (e) e.style.display = gkv ? '' : 'none';
  });
  pkvElems.forEach(id => {
    const e = document.getElementById(id);
    if (e) e.style.display = gkv ? 'none' : '';
  });
}

function aktualisiereKiStFelder(): void {
  const aktiv = (el<HTMLInputElement>('chkKiSt')).checked;
  el('cmbBundesland').style.opacity = aktiv ? '1' : '0.45';
  (el<HTMLSelectElement>('cmbBundesland')).disabled = !aktiv;
  el('lblBundesland').style.opacity = aktiv ? '1' : '0.45';
}

function aktualisiereAlterFelder(): void {
  const aktiv = (el<HTMLInputElement>('chkAlter64')).checked;
  el('edtGebJahr').style.display = aktiv ? '' : 'none';
  el('lblGebJahr').style.display = aktiv ? '' : 'none';
}

function kiStSatz(): number {
  const idx = parseInt((el<HTMLSelectElement>('cmbBundesland')).value);
  return (idx >= 0 && idx < KISTSAETZE.length) ? KISTSAETZE[idx] : 9;
}

// ---------------------------------------------------------------------------
// Formatierung beim Verlassen eines Betragsfeldes
// ---------------------------------------------------------------------------
function formatBetrag(input: HTMLInputElement): void {
  const s = input.value.trim().replace(/\./g, '').replace(',', '.');
  const v = parseFloat(s);
  if (!isNaN(v)) {
    input.value = v.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}

// ---------------------------------------------------------------------------
// Ergebnis-Zeile setzen
// ---------------------------------------------------------------------------
function setZeile(
  idLabel: string, idWert: string,
  beschriftung: string, cent: number,
  bold = false, cssClass = ''
): void {
  const lbl  = document.getElementById(idLabel);
  const wert = document.getElementById(idWert);
  if (!lbl || !wert) return;

  lbl.textContent  = beschriftung;
  wert.textContent = fmtEuro(cent);

  lbl.className  = bold ? 'res-label bold' : 'res-label';
  wert.className = bold ? `res-wert bold ${cssClass}` : `res-wert ${cssClass}`;
}

// ---------------------------------------------------------------------------
// HAUPTBERECHNUNG
// ---------------------------------------------------------------------------
function berechnen(): void {
  // --- Eingaben lesen ---
  const brutto = parseEuroCent(el<HTMLInputElement>('edtBrutto').value, 'Bruttolohn');
  if (brutto === null) return;

  const freibet = parseEuroCent(el<HTMLInputElement>('edtFreibetrag').value, 'Freibetrag');
  if (freibet === null) return;

  // KFB
  let kfbVal = 0;
  const kfbStr = el<HTMLInputElement>('edtKFB').value.trim();
  if (kfbStr !== '' && kfbStr !== '0' && kfbStr !== '0,0') {
    const k = parseFloat(kfbStr.replace(',', '.'));
    if (isNaN(k)) { alert('Kinderfreibeträge: Ungültige Eingabe.'); return; }
    kfbVal = k;
  }

  // Geburtsjahr
  let gebJahr = 0;
  if ((el<HTMLInputElement>('chkAlter64')).checked) {
    gebJahr = parseInt(el<HTMLInputElement>('edtGebJahr').value);
    if (isNaN(gebJahr) || gebJahr < 1900) {
      alert('Geburtsjahr: Ungültige Eingabe.');
      return;
    }
  }

  // ========================================================================
  // LOHNSTEUER
  // ========================================================================
  const LP: LST2026Params = {} as LST2026Params;
  LST2026_Init(LP);

  LP.RE4        = brutto;
  LP.JRE4       = brutto * 12;
  LP.LZZ        = 2;
  LP.STKL       = parseInt((el<HTMLSelectElement>('cmbStkl')).value);
  LP.ZKF        = kfbVal;
  LP.LZZFREIB   = freibet;
  LP.KVZ        = 2.90;

  if ((el<HTMLInputElement>('rdoGKV')).checked) {
    const kvzStr = el<HTMLInputElement>('edtKVZ').value.replace(',', '.');
    LP.KVZ = parseFloat(kvzStr) || 2.90;
  }

  if ((el<HTMLInputElement>('rdoPKV')).checked) {
    LP.PKV = 1;
    const pkpv   = parseEuroCent(el<HTMLInputElement>('edtPKVBeitrag').value, 'PKV-Beitrag');
    const pkpvag = parseEuroCent(el<HTMLInputElement>('edtPKVAGZusch').value, 'AG-Zuschuss');
    if (pkpv === null || pkpvag === null) return;
    LP.PKPV    = pkpv;
    LP.PKPVAGZ = pkpvag;
  }

  if ((el<HTMLInputElement>('chkKeinRV')).checked) LP.KRV = 1;
  if ((el<HTMLInputElement>('chkKeinAV')).checked) LP.ALV = 1;

  if ((el<HTMLInputElement>('chkSachsen') as HTMLInputElement).checked) LP.PVS = 1;
  if ((el<HTMLInputElement>('rdoGKV')).checked) {
    const kindIdx = parseInt((el<HTMLSelectElement>('cmbKinder')).value);
    LP.PVZ = kindIdx === 0 ? 1 : 0;
  }

  if ((el<HTMLInputElement>('chkAlter64')).checked && gebJahr > 0) {
    LP.ALTER1 = 1;
    LP.AJAHR  = gebJahr + 65;
  }

  LP.R = (el<HTMLInputElement>('chkKiSt')).checked ? 1 : 0;

  const LR = LST2026_Berechne(LP);

  // Kirchensteuer
  let kiSt = 0;
  if ((el<HTMLInputElement>('chkKiSt')).checked) {
    kiSt = Math.trunc(LR.BK * kiStSatz() / 100.0);
  }

  // ========================================================================
  // SOZIALVERSICHERUNG
  // ========================================================================
  const SP: SV2026Params = {} as SV2026Params;
  SV2026_Init(SP);
  SP.BRUTTO = brutto;

  if ((el<HTMLInputElement>('rdoPKV')).checked) {
    SP.PKV = 1;
    const pkpv   = parseEuroCent(el<HTMLInputElement>('edtPKVBeitrag').value, 'PKV-Beitrag');
    const pkpvag = parseEuroCent(el<HTMLInputElement>('edtPKVAGZusch').value, 'AG-Zuschuss');
    if (pkpv === null || pkpvag === null) return;
    SP.PKPV   = pkpv;
    SP.PKPVAG = pkpvag;
  } else {
    SP.PKV = 0;
    const kvzStr = el<HTMLInputElement>('edtKVZ').value.replace(',', '.');
    SP.KVZ      = parseFloat(kvzStr) || 2.90;
    SP.PVKinder = parseInt((el<HTMLSelectElement>('cmbKinder')).value);
    SP.PVS      = (el<HTMLInputElement>('chkSachsen')).checked ? 1 : 0;
  }

  if ((el<HTMLInputElement>('chkKeinRV')).checked) SP.KRV = 1;
  if ((el<HTMLInputElement>('chkKeinAV')).checked) SP.KAV = 1;

  const SR = SV2026_Berechne(SP);

  // ========================================================================
  // Ergebnisse speichern & anzeigen
  // ========================================================================
  gLSTResult  = LR;
  gSVResult   = SR;
  gBruttoCent = brutto;
  gKiStCent   = kiSt;

  const sumSt   = LR.LSTLZZ + LR.SOLZLZZ + kiSt;
  const sumSVAN = SR.GSAN;
  const netto   = brutto - sumSt - sumSVAN;

  // Ergebnisbereich sichtbar machen
  el('ergebnisPanel').classList.add('visible');

  setZeile('lblRBrutto',    'wRBrutto',    'Bruttolohn',                  brutto,         true,  'positiv');
  setZeile('lblRLST',       'wRLST',       'Lohnsteuer',                  LR.LSTLZZ,      false, 'negativ');
  setZeile('lblRSolZ',      'wRSolZ',      'Solidaritätszuschlag',        LR.SOLZLZZ,     false, 'negativ');
  setZeile('lblRKiSt',      'wRKiSt',      'Kirchensteuer',               kiSt,           false, 'negativ');
  setZeile('lblRSumSt',     'wRSumSt',     'Summe Steuerabzüge',          sumSt,          true,  'negativ');
  setZeile('lblRRV',        'wRRV',        'Rentenversicherung (RV)',      SR.RVAN,        false, 'negativ');
  setZeile('lblRKV',        'wRKV',        'Krankenversicherung (KV)',     SR.KVAN,        false, 'negativ');
  setZeile('lblRPV',        'wRPV',        'Pflegeversicherung (PV)',      SR.PVAN,        false, 'negativ');
  setZeile('lblRAV',        'wRAV',        'Arbeitslosenversicherung (AV)',SR.AVAN,        false, 'negativ');
  setZeile('lblRSumSV',     'wRSumSV',     'Summe Sozialversicherung',    sumSVAN,        true,  'negativ');
  setZeile('lblRNetto',     'wRNetto',     'Nettolohn',                   netto,          true,  'netto');
  setZeile('lblRAGRV',      'wRAGRV',      'RV-Anteil Arbeitgeber',       SR.RVAG,        false, 'ag');
  setZeile('lblRAGKV',      'wRAGKV',      'KV-Anteil / -Zuschuss AG',    SR.KVAG,        false, 'ag');
  setZeile('lblRAGPV',      'wRAGPV',      'PV-Anteil Arbeitgeber',       SR.PVAG,        false, 'ag');
  setZeile('lblRAGAV',      'wRAGAV',      'AV-Anteil Arbeitgeber',       SR.AVAG,        false, 'ag');
  setZeile('lblRAGSum',     'wRAGSum',     'AG-Anteil Sozialversicherung', SR.GSAG,        true,  'ag');
  setZeile('lblRGesAufwand','wRGesAufwand','Gesamt-Aufwand Arbeitgeber',  brutto+SR.GSAG, true,  'aufwand');

  el<HTMLButtonElement>('btnDrucken').disabled = false;
}

// ---------------------------------------------------------------------------
// DRUCKEN / PDF
// ---------------------------------------------------------------------------
function drucken(): void {
  if (!gLSTResult || !gSVResult) return;

  const name      = el<HTMLInputElement>('edtName').value;
  const monatIdx  = parseInt((el<HTMLSelectElement>('cmbMonat')).value) - 1;
  const jahr      = el<HTMLInputElement>('spnJahr').value;
  const monatStr  = MONATE[monatIdx] + ' ' + jahr;
  const bundesland = BUNDESLAENDER[parseInt((el<HTMLSelectElement>('cmbBundesland')).value)];
  const kist      = kiStSatz();

  const LR = gLSTResult;
  const SR = gSVResult;
  const sumSt   = LR.LSTLZZ + LR.SOLZLZZ + gKiStCent;
  const sumSVAN = SR.GSAN;
  const netto   = gBruttoCent - sumSt - sumSVAN;

  // Druckfenster erzeugen
  const w = window.open('', '_blank', 'width=800,height=900');
  if (!w) { alert('Popup-Fenster wurde blockiert. Bitte Popup für diese Seite erlauben.'); return; }

  const now = new Date().toLocaleDateString('de-DE');

  const row = (label: string, cent: number, bold = false, indent = false, color = '') => {
    const fw  = bold   ? 'font-weight:700' : 'font-weight:400';
    const ind = indent ? 'padding-left:20px' : '';
    const col = color  ? `color:${color}` : '';
    return `<tr>
      <td style="padding:3px 8px;${ind};${fw};${col}">${label}</td>
      <td style="padding:3px 8px;text-align:right;${fw};${col}">${fmtEuro(cent)}</td>
    </tr>`;
  };

  const sep = (thick = false) =>
    `<tr><td colspan="2"><hr style="border:none;border-top:${thick ? '2' : '1'}px solid #${thick ? '8B4500' : 'ccc'};margin:4px 0"></td></tr>`;

  const sectionHead = (title: string) =>
    `<tr><td colspan="2" style="padding:8px 8px 2px;font-weight:700;color:#8B4500;font-size:11px;text-transform:uppercase;letter-spacing:.5px">${title}</td></tr>`;

  w.document.write(`<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8">
<title>Lohnabrechnung ${monatStr}${name ? ' – ' + name : ''}</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; font-size: 13px; margin: 0; padding: 24px; color: #222; }
  h1   { margin: 0; font-size: 18px; color: #fff; }
  .header { background: #8B4500; color: #fff; padding: 14px 20px; border-radius: 6px 6px 0 0; }
  .sub    { font-size: 11px; color: #ffd0a0; margin-top: 3px; }
  table   { width: 100%; border-collapse: collapse; }
  .footer { margin-top: 20px; font-size: 10px; color: #888; border-top: 1px solid #ddd; padding-top: 8px; }
  @media print { body { padding: 8px; } button { display: none; } }
</style>
</head><body>
<div class="header">
  <h1>LohnTool 2026 &nbsp;·&nbsp; Lohnabrechnung</h1>
  <div class="sub">Brutto-Netto-Berechnung nach PAP 2026 und SV-Rechengrößen-VO 2026</div>
</div>
<div style="display:flex;justify-content:space-between;padding:8px 4px;font-size:12px;color:#555;border-bottom:1px solid #ddd;margin-bottom:4px">
  ${name ? `<span><b>Mitarbeiter:</b> ${name}</span>` : '<span></span>'}
  <span><b>Abrechnungsmonat:</b> ${monatStr}</span>
</div>
<table>
${sep(true)}
${row('Bruttolohn', gBruttoCent, true, false, '#006000')}
${sep(true)}
${sectionHead('Steuerabzüge')}
${row('Lohnsteuer', LR.LSTLZZ, false, true)}
${row('Solidaritätszuschlag', LR.SOLZLZZ, false, true)}
${gKiStCent > 0 ? row(`Kirchensteuer (${kist} %, ${bundesland})`, gKiStCent, false, true) : ''}
${sep()}
${row('Summe Steuerabzüge', sumSt, true, false, '#8B0000')}
${sectionHead('Sozialversicherung – Arbeitnehmer-Anteile')}
${row('Rentenversicherung (RV)',        SR.RVAN, false, true)}
${row('Krankenversicherung (KV)',       SR.KVAN, false, true)}
${row('Pflegeversicherung (PV)',        SR.PVAN, false, true)}
${row('Arbeitslosenversicherung (AV)',  SR.AVAN, false, true)}
${sep()}
${row('Summe Sozialversicherung', sumSVAN, true, false, '#8B0000')}
${sep(true)}
<tr>
  <td style="padding:6px 8px;font-weight:700;font-size:15px;color:#00407A">Nettolohn</td>
  <td style="padding:6px 8px;text-align:right;font-weight:700;font-size:15px;color:#00407A">${fmtEuro(netto)}</td>
</tr>
${sep(true)}
${sectionHead('Arbeitgeber-Anteile Sozialversicherung')}
${row('RV-Anteil Arbeitgeber',            SR.RVAG, false, true, '#777')}
${row('KV-Anteil / -Zuschuss Arbeitgeber',SR.KVAG, false, true, '#777')}
${row('PV-Anteil Arbeitgeber',            SR.PVAG, false, true, '#777')}
${row('AV-Anteil Arbeitgeber',            SR.AVAG, false, true, '#777')}
${sep()}
${row('AG-Anteil Sozialversicherung', SR.GSAG, true, false, '#777')}
${sep(true)}
${row('Gesamt-Aufwand Arbeitgeber', gBruttoCent + SR.GSAG, true, false, '#5a3000')}
</table>
<div class="footer">
  Berechnung nach PAP 2026 (BMF-Schreiben 12.11.2025) und SV-Rechengrößen-VO 2026.
  Ohne Gewähr – maßgeblich ist die Lohnsteuerbescheinigung.<br>
  Erstellt am ${now} &nbsp;|&nbsp; LohnTool 2026
</div>
<br>
<button onclick="window.print()" style="padding:8px 20px;cursor:pointer;background:#8B4500;color:#fff;border:none;border-radius:4px;font-size:13px">Drucken / PDF</button>
</body></html>`);
  w.document.close();
}

// ---------------------------------------------------------------------------
// Event-Listener registrieren
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initControls();

  el('btnBerechnen').addEventListener('click', berechnen);
  el('btnDrucken').addEventListener('click', drucken);
  el('btnEnde').addEventListener('click', () => window.close());

  el('rdoGKV').addEventListener('change', aktualisiereSVFelder);
  el('rdoPKV').addEventListener('change', aktualisiereSVFelder);
  el('chkKiSt').addEventListener('change', aktualisiereKiStFelder);
  el('chkAlter64').addEventListener('change', aktualisiereAlterFelder);

  // Betragsfelder formatieren bei Verlassen
  ['edtBrutto','edtFreibetrag','edtPKVBeitrag','edtPKVAGZusch'].forEach(id => {
    el<HTMLInputElement>(id).addEventListener('blur', (e) => {
      formatBetrag(e.target as HTMLInputElement);
    });
  });

  // Enter im Formular = Berechnen
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') berechnen();
  });
});

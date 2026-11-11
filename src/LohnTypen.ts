/**
 * LohnTypen.ts
 * Jahresübergreifende Schnittstellen für Lohnsteuer- und SV-Berechnung.
 *
 * Jede Jahresversion (LST2026/LST2027, SV2026/SV2027, …) implementiert
 * dieselben Ein- und Ausgangsparameter. Die Feldnamen folgen dem
 * BMF-Programmablaufplan; ändert das BMF die Schnittstelle in einem
 * künftigen Jahr, wird sie hier erweitert (neue Felder optional halten).
 */

// ---------------------------------------------------------------------------
// Lohnsteuer – Eingangsparameter (PAP, Abschnitt 3.1)
// ---------------------------------------------------------------------------
export interface LSTParams {
  AF      : number;  // 1 = Faktorverfahren gewählt (nur STKL IV)
  AJAHR   : number;  // Kj. nach Vollendung 64. Lj. (wenn ALTER1=1)
  ALTER1  : number;  // 1 = 64. Lj. vor Beginn des Kj. vollendet, sonst 0
  ALV     : number;  // 0 = AV-pflichtig (allg. BBG), 1 = sonst
  F       : number;  // Faktor (3 Nachkommastellen), nur bei AF=1
  JFREIB  : number;  // Jahresfreibetrag in Cent
  JHINZU  : number;  // Jahreshinzurechnungsbetrag in Cent
  JRE4    : number;  // Vorauss. Jahresarbeitslohn ohne sonst. Bezüge, Cent
  JRE4ENT : number;  // In JRE4 enthaltene Entschädigungen/VermBeteil., Cent
  JVBEZ   : number;  // In JRE4 enthaltene Versorgungsbezüge, Cent
  KRV     : number;  // 0 = RV-pflichtig (allg. BBG), 1 = sonst
  KVZ     : number;  // Kassenindiv. Zusatzbeitragssatz KV in % (z.B. 2.90)
  LZZ     : number;  // 1=Jahr 2=Monat 3=Woche 4=Tag
  LZZFREIB: number;  // Freibetrag für den LZZ, Cent
  LZZHINZU: number;  // Hinzurechnungsbetrag für den LZZ, Cent
  MBV     : number;  // Nicht zu besteuernde Vorteile Vermögensbeteil., Cent
  PKPV    : number;  // Private Basiskranken-/PflegePflichtvers., Cent/Monat
  PKPVAGZ : number;  // Steuerfreier AG-Zuschuss priv. KV/PV, Cent/Monat
  PKV     : number;  // 0=gesetzl. KV, 1=ausschl. privat KV
  PVA     : number;  // Anzahl Beitragsabschläge PV (0..4)
  PVS     : number;  // 1 = Sachsen-Besonderheit PV
  PVZ     : number;  // 1 = Zuschlag PV (kinderlos)
  R       : number;  // Religionszugehörigkeit (0 = keine)
  RE4     : number;  // Steuerpflichtig. Arbeitslohn für den LZZ, Cent
  SONSTB  : number;  // Sonstige Bezüge inkl. VermBeteil., Cent
  SONSTENT: number;  // In SONSTB enthaltene Entschädigungen/VermBeteil., Cent
  STERBE  : number;  // Sterbegeld/Kapitalabfindung (in SONSTB enthalten), Cent
  STKL    : number;  // Steuerklasse 1..6
  VBEZ    : number;  // In RE4 enthaltene Versorgungsbezüge, Cent
  VBEZM   : number;  // Versorgungsbezug Januar 2005 / erster voller Monat, Cent
  VBEZS   : number;  // Vorauss. Sonderzahlungen Versorgungsbezüge, Cent
  VBS     : number;  // In SONSTB enthaltene Versorgungsbezüge, Cent
  VJAHR   : number;  // Jahr des erstmaligen Versorgungsbezugs
  ZKF     : number;  // Zahl der Kinderfreibeträge (1 Dezimalstelle)
  ZMVB    : number;  // Monate mit Versorgungsbezügen (nur bei LZZ=1)
}

// ---------------------------------------------------------------------------
// Lohnsteuer – Ausgangsparameter (PAP, Abschnitte 3.2 und 3.3)
// ---------------------------------------------------------------------------
export interface LSTResult {
  LSTLZZ  : number;  // Lohnsteuer für den LZZ, Cent
  SOLZLZZ : number;  // Solidaritätszuschlag für den LZZ, Cent
  BK      : number;  // Bemessungsgrundlage Kirchenlohnsteuer, Cent
  STS     : number;  // Lohnsteuer auf sonstige Bezüge, Cent
  SOLZS   : number;  // SolZ auf sonstige Bezüge, Cent
  BKS     : number;  // BMG Kirchenlohnsteuer sonstige Bezüge, Cent
  VFRB    : number;
  VFRBS1  : number;
  VFRBS2  : number;
  WVFRB   : number;
  WVFRBM  : number;
  WVFRBO  : number;
}

// ---------------------------------------------------------------------------
// Sozialversicherung – Eingangsparameter
// ---------------------------------------------------------------------------
export interface SVParams {
  BRUTTO    : number;  // Bruttoarbeitsentgelt für den Monat, Cent
  RK        : number;  // Rechtskreis: 0=West, 1=Ost (ab 2026 ohne Wirkung)
  PKV       : number;  // 0 = gesetzliche KV/PV, 1 = ausschließlich privat
  KVZ       : number;  // Kassenindiv. Zusatzbeitragssatz KV in % (z.B. 2.90)
  KVERM     : number;  // 0 = allg. Beitragssatz, 1 = ermäßigt
  PKVBeitragKV : number;  // Monatsbeitrag private Krankenversicherung, Cent (nur PKV=1)
  PKVBeitragPV : number;  // Monatsbeitrag private Pflege-Pflichtversicherung, Cent (nur PKV=1)
  PVKinder  : number;  // Anzahl Kinder unter 25 J. (0..5+)
  PVS       : number;  // 1 = Sachsen-Sonderregelung PV
  KRV       : number;  // 0 = RV-pflichtig, 1 = nicht RV-pflichtig
  KAV       : number;  // 0 = AV-pflichtig, 1 = nicht AV-pflichtig
}

// ---------------------------------------------------------------------------
// Sozialversicherung – Ausgangsparameter
// ---------------------------------------------------------------------------
export interface SVResult {
  KVAN  : number;  // KV-Beitrag AN, Cent
  KVAG  : number;  // KV-Beitrag AG, Cent
  KVBMG : number;  // KV-Bemessungsgrundlage, Cent
  PVAN  : number;  // PV-Beitrag AN, Cent
  PVAG  : number;  // PV-Beitrag AG, Cent
  PVBMG : number;  // PV-Bemessungsgrundlage, Cent
  RVAN  : number;  // RV-Beitrag AN, Cent
  RVAG  : number;  // RV-Beitrag AG, Cent
  RVBMG : number;  // RV-Bemessungsgrundlage, Cent
  AVAN  : number;  // AV-Beitrag AN, Cent
  AVAG  : number;  // AV-Beitrag AG, Cent
  AVBMG : number;  // AV-Bemessungsgrundlage, Cent
  GSAN  : number;  // Gesamter SV-Beitrag AN, Cent
  GSAG  : number;  // Gesamter SV-Beitrag AG, Cent
  GSGES : number;  // Gesamter SV-Beitrag AN+AG, Cent
}

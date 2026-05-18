/**
 * LST2026.ts
 * Lohnsteuerberechnung 2026
 * Programmablaufplan gem. BMF-Schreiben vom 12.11.2025 (endgültig)
 * Anlage 1: Maschinelle Berechnung der Lohnsteuer, des Solidaritätszuschlags
 *           und der Maßstabsteuer für die Kirchenlohnsteuer für 2026
 *
 * Grundlage: § 39b Absatz 6 EStG
 * Gültig für Lohnzahlungszeiträume nach dem 31.12.2025, vor dem 01.01.2027
 *
 * TypeScript-Portierung aus LST2026.pas (Delphi)
 * Alle Cent-Beträge als number (ganzzahlig), Float-Werte als number.
 */

// ---------------------------------------------------------------------------
// Eingangsparameter
// ---------------------------------------------------------------------------
export interface LST2026Params {
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
// Ausgangsparameter
// ---------------------------------------------------------------------------
export interface LST2026Result {
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
// Interner Zustand
// ---------------------------------------------------------------------------
interface Intern {
  ALTE        : number;
  ANP         : number;
  ANTEIL1     : number;
  AVSATZAN    : number;
  BBGKVPV     : number;
  BBGRVALV    : number;
  BMG         : number;
  DIFF        : number;
  EFA         : number;
  F           : number;
  FVB         : number;
  FVBSO       : number;
  FVBZ        : number;
  FVBZSO      : number;
  GFB         : number;
  HBALTE      : number;
  HFVB        : number;
  HFVBZ       : number;
  HFVBZSO     : number;
  HOCH        : number;
  J           : number;
  JBMG        : number;
  JLFREIB     : number;
  JLHINZU     : number;
  JW          : number;
  K           : number;
  KFB         : number;
  KVSATZAN    : number;
  KZTAB       : number;
  LSTJAHR     : number;
  LSTOSO      : number;
  LSTSO       : number;
  MIST        : number;
  PKPVAGZJ    : number;
  PVSATZAN    : number;
  RVSATZAN    : number;
  RW          : number;
  SAP         : number;
  SOLZFREI    : number;
  SOLZJ       : number;
  SOLZMIN     : number;
  SOLZSBMG    : number;
  SOLZSZVE    : number;
  ST          : number;
  ST1         : number;
  ST2         : number;
  VBEZB       : number;
  VBEZBSO     : number;
  VERGL       : number;
  VSP         : number;
  VSPKVPV     : number;
  VSPN        : number;
  VSPALV      : number;
  VSPHB       : number;
  VSPR        : number;
  W1STKL5     : number;
  W2STKL5     : number;
  W3STKL5     : number;
  X           : number;
  Y           : number;
  ZRE4        : number;
  ZRE4J       : number;
  ZRE4VP      : number;
  ZRE4VPR     : number;
  ZTABFB      : number;
  ZVBEZ       : number;
  ZVBEZJ      : number;
  ZVE         : number;
  ZX          : number;
  ZZX         : number;
  // Ergebnisse
  LSTLZZ      : number;
  SOLZLZZ     : number;
  BK          : number;
  STS         : number;
  SOLZS       : number;
  BKS         : number;
  VFRB        : number;
  VFRBS1      : number;
  VFRBS2      : number;
  WVFRB       : number;
  WVFRBM      : number;
  WVFRBO      : number;
  // Eingangskopie
  P           : LST2026Params;
}

// ---------------------------------------------------------------------------
// Tabellen gemäß PAP
// ---------------------------------------------------------------------------
const TAB1: number[] = [0,
  0.400,0.384,0.368,0.352,0.336,0.320,0.304,0.288,0.272,0.256,
  0.240,0.224,0.208,0.192,0.176,0.160,0.152,0.144,0.140,0.136,
  0.132,0.128,0.124,0.120,0.116,0.112,0.108,0.104,0.100,0.096,
  0.092,0.088,0.084,0.080,0.076,0.072,0.068,0.064,0.060,0.056,
  0.052,0.048,0.044,0.040,0.036,0.032,0.028,0.024,0.020,0.016,
  0.012,0.008,0.004,0.000
];
const TAB2: number[] = [0,
  3000,2880,2760,2640,2520,2400,2280,2160,2040,1920,
  1800,1680,1560,1440,1320,1200,1140,1080,1050,1020,
   990, 960, 930, 900, 870, 840, 810, 780, 750, 720,
   690, 660, 630, 600, 570, 540, 510, 480, 450, 420,
   390, 360, 330, 300, 270, 240, 210, 180, 150, 120,
    90,  60,  30,   0
];
const TAB3: number[] = [0,
  900,864,828,792,756,720,684,648,612,576,
  540,504,468,432,396,360,342,324,315,306,
  297,288,279,270,261,252,243,234,225,216,
  207,198,189,180,171,162,153,144,135,126,
  117,108, 99, 90, 81, 72, 63, 54, 45, 36,
   27, 18,  9,  0
];
const TAB4: number[] = TAB1.slice();
const TAB5: number[] = [0,
  1900,1824,1748,1672,1596,1520,1444,1368,1292,1216,
  1140,1064, 988, 912, 836, 760, 722, 684, 665, 646,
   627, 608, 589, 570, 551, 532, 513, 494, 475, 456,
   437, 418, 399, 380, 361, 342, 323, 304, 285, 266,
   247, 228, 209, 190, 171, 152, 133, 114,  95,  76,
    57,  38,  19,   0
];

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------
const euroAbr  = (v: number) => Math.floor(v);
const euroAuf  = (v: number) => Math.ceil(v);
const centAuf  = (v: number) => Math.ceil(v * 100.0) / 100.0;
const centAbr  = (v: number) => Math.floor(v * 100.0) / 100.0;
const trunc    = (v: number) => Math.trunc(v);
const roundInt = (v: number) => Math.round(v);

// ---------------------------------------------------------------------------
// MPARA
// ---------------------------------------------------------------------------
function MPARA(I: Intern): void {
  I.BBGRVALV = 101400;
  I.AVSATZAN = 0.0130;
  I.RVSATZAN = 0.0930;
  I.BBGKVPV  = 69750;

  I.KVSATZAN = I.P.KVZ / 2.0 / 100.0 + 0.07;

  I.PVSATZAN = I.P.PVS === 1 ? 0.023 : 0.018;
  if (I.P.PVZ === 1) I.PVSATZAN += 0.006;
  I.PVSATZAN -= I.P.PVA * 0.0025;

  I.W1STKL5 = 14071;
  I.W2STKL5 = 34939;
  I.W3STKL5 = 222260;
  I.GFB      = 12348;
  I.SOLZFREI = 20350;
}

// ---------------------------------------------------------------------------
// MRE4JL
// ---------------------------------------------------------------------------
function MRE4JL(I: Intern): void {
  switch (I.P.LZZ) {
    case 1:
      I.ZRE4J   = I.P.RE4    / 100.0;
      I.ZVBEZJ  = I.P.VBEZ   / 100.0;
      I.JLFREIB = I.P.LZZFREIB / 100.0;
      I.JLHINZU = I.P.LZZHINZU / 100.0;
      break;
    case 2:
      I.ZRE4J   = I.P.RE4    * 12.0 / 100.0;
      I.ZVBEZJ  = I.P.VBEZ   * 12.0 / 100.0;
      I.JLFREIB = I.P.LZZFREIB * 12.0 / 100.0;
      I.JLHINZU = I.P.LZZHINZU * 12.0 / 100.0;
      break;
    case 3:
      I.ZRE4J   = I.P.RE4    * 360.0 / 7.0 / 100.0;
      I.ZVBEZJ  = I.P.VBEZ   * 360.0 / 7.0 / 100.0;
      I.JLFREIB = I.P.LZZFREIB * 360.0 / 7.0 / 100.0;
      I.JLHINZU = I.P.LZZHINZU * 360.0 / 7.0 / 100.0;
      break;
    case 4:
      I.ZRE4J   = I.P.RE4    * 360.0 / 100.0;
      I.ZVBEZJ  = I.P.VBEZ   * 360.0 / 100.0;
      I.JLFREIB = I.P.LZZFREIB * 360.0 / 100.0;
      I.JLHINZU = I.P.LZZHINZU * 360.0 / 100.0;
      break;
  }
  if (I.P.AF === 0) I.F = 1.0;
}

// ---------------------------------------------------------------------------
// MRE4ALTE
// ---------------------------------------------------------------------------
function MRE4ALTE(I: Intern): void {
  if (I.P.ALTER1 === 0) { I.ALTE = 0; return; }
  let kIdx: number;
  if (I.P.AJAHR < 2006)      kIdx = 1;
  else if (I.P.AJAHR < 2058) kIdx = I.P.AJAHR - 2004;
  else                        kIdx = 54;
  I.K      = kIdx;
  I.BMG    = I.ZRE4J - I.ZVBEZJ;
  I.ALTE   = euroAbr(I.BMG * TAB4[kIdx]);
  I.HBALTE = TAB5[kIdx];
  if (I.ALTE > I.HBALTE) I.ALTE = I.HBALTE;
}

// ---------------------------------------------------------------------------
// MRE4
// ---------------------------------------------------------------------------
function MRE4(I: Intern): void {
  if (I.ZVBEZJ === 0) {
    I.FVB = 0; I.FVBZ = 0; I.FVBSO = 0; I.FVBZSO = 0;
    MRE4ALTE(I);
    return;
  }

  let jIdx: number;
  if (I.P.VJAHR < 2006)      jIdx = 1;
  else if (I.P.VJAHR < 2058) jIdx = I.P.VJAHR - 2004;
  else                        jIdx = 54;
  I.J = jIdx;

  if (I.P.LZZ === 1) {
    I.VBEZB = I.P.VBEZM * I.P.ZMVB + I.P.VBEZS;
    I.HFVB  = centAbr(TAB2[jIdx] / 12.0 * I.P.ZMVB);
    I.FVBZ  = centAbr(TAB3[jIdx] / 12.0 * I.P.ZMVB);
  } else {
    I.VBEZB = I.P.VBEZM * 12 + I.P.VBEZS;
    I.HFVB  = TAB2[jIdx];
    I.FVBZ  = TAB3[jIdx];
  }

  I.FVB = centAuf(I.VBEZB * TAB1[jIdx] / 100.0);
  if (I.FVB > I.HFVB)   I.FVB = I.HFVB;
  if (I.FVB > I.ZVBEZJ) I.FVB = I.ZVBEZJ;

  I.FVBSO = centAuf(I.FVB + I.VBEZBSO * TAB1[jIdx] / 100.0);
  if (I.FVBSO > TAB2[jIdx]) I.FVBSO = TAB2[jIdx];

  I.HFVBZSO = centAbr((I.VBEZB + I.VBEZBSO) / 100.0 - I.FVBSO);

  I.FVBZSO = centAbr(I.FVBZ + I.VBEZBSO / 100.0);
  if (I.FVBZSO > I.HFVBZSO)  I.FVBZSO = I.HFVBZSO;
  if (I.FVBZSO > TAB3[jIdx]) I.FVBZSO = TAB3[jIdx];

  I.HFVBZ = centAbr(I.VBEZB / 100.0 - I.FVB);
  if (I.FVBZ > I.HFVBZ) I.FVBZ = I.HFVBZ;

  MRE4ALTE(I);
}

// ---------------------------------------------------------------------------
// MRE4ABZ
// ---------------------------------------------------------------------------
function MRE4ABZ(I: Intern): void {
  I.ZRE4 = I.ZRE4J - I.FVB - I.ALTE - I.JLFREIB + I.JLHINZU;
  if (I.ZRE4 < 0) I.ZRE4 = 0;
  I.ZRE4VP = I.ZRE4J;
  I.ZVBEZ  = I.ZVBEZJ - I.FVB;
  if (I.ZVBEZ < 0) I.ZVBEZ = 0;
}

// ---------------------------------------------------------------------------
// MZTABFB
// ---------------------------------------------------------------------------
function MZTABFB(I: Intern): void {
  I.ANP = 0;

  if (I.ZVBEZJ >= 0) {
    if (I.ZVBEZ < I.FVBZ) I.FVBZ = I.ZVBEZ;

    if (I.P.STKL < 6) {
      if (I.ZVBEZ > 0) {
        I.ANP = (I.ZVBEZ - I.FVBZ) < 102 ? (I.ZVBEZ - I.FVBZ) : 102;
      } else {
        I.FVBZ = 0; I.FVBZSO = 0;
      }
    } else {
      I.FVBZ = 0; I.FVBZSO = 0;
    }
  }

  if (I.P.STKL < 6) {
    if (I.ZRE4 > I.ZVBEZ) {
      I.ANP += (I.ZRE4 - I.ZVBEZ) < 1230 ? (I.ZRE4 - I.ZVBEZ) : 1230;
    }
  }

  I.KZTAB = 1;
  I.EFA   = 0;

  switch (I.P.STKL) {
    case 1: I.SAP = 36; I.KFB = I.P.ZKF * 4878; break;
    case 2: I.EFA = 4260; I.SAP = 36; I.KFB = I.P.ZKF * 4878; break;
    case 3: I.KZTAB = 2; I.SAP = 36; I.KFB = I.P.ZKF * 9756; break;
    case 4: I.SAP = 36; I.KFB = I.P.ZKF * 4878; break;
    case 5: I.SAP = 36; I.KFB = 0; break;
    case 6: I.SAP = 0;  I.KFB = 0; break;
    default: I.SAP = 36; I.KFB = I.P.ZKF * 4878;
  }

  I.ZTABFB = I.EFA + I.ANP + I.SAP + I.FVBZ;
}

// ---------------------------------------------------------------------------
// UPTAB26
// ---------------------------------------------------------------------------
function UPTAB26(I: Intern): void {
  const X = I.X;
  if (X < (I.GFB + 1)) {
    I.ST = 0;
  } else if (X < 17800) {
    I.Y  = (X - I.GFB) / 10000.0;
    I.RW = I.Y * 914.51 + 1400;
    I.ST = euroAbr(I.RW * I.Y);
  } else if (X < 69879) {
    I.Y  = (X - 17799) / 10000.0;
    I.RW = I.Y * 173.1 + 2397;
    I.ST = euroAbr(I.RW * I.Y + 1034.87);
  } else if (X < 277826) {
    I.ST = euroAbr(X * 0.42 - 11135.63);
  } else {
    I.ST = euroAbr(X * 0.45 - 19470.38);
  }
  I.ST *= I.KZTAB;
}

// ---------------------------------------------------------------------------
// UP5_6
// ---------------------------------------------------------------------------
function UP5_6(I: Intern): void {
  I.X = euroAbr(I.ZX * 1.25); UPTAB26(I); I.ST1 = I.ST;
  I.X = euroAbr(I.ZX * 0.75); UPTAB26(I); I.ST2 = I.ST;
  I.DIFF = (I.ST1 - I.ST2) * 2.0;
  I.MIST = euroAbr(I.ZX * 0.14);
  I.ST   = I.MIST > I.DIFF ? I.MIST : I.DIFF;
}

// ---------------------------------------------------------------------------
// MST5_6
// ---------------------------------------------------------------------------
function MST5_6(I: Intern): void {
  I.ZZX = I.X;
  if (I.ZZX > I.W2STKL5) {
    I.ZX = I.W2STKL5; UP5_6(I); I.VERGL = I.ST;
    if (I.ZZX > I.W3STKL5) {
      I.ST = euroAbr(I.ST + (I.W3STKL5 - I.W2STKL5) * 0.42);
      I.ST = euroAbr(I.ST + (I.ZZX - I.W3STKL5) * 0.45);
    } else {
      I.ST = euroAbr(I.ST + (I.ZZX - I.W2STKL5) * 0.42);
    }
  } else {
    I.ZX = I.ZZX; UP5_6(I);
    if (I.ZZX > I.W1STKL5) {
      I.VERGL = I.ST; I.ZX = I.W1STKL5; UP5_6(I);
      I.HOCH  = euroAbr(I.ST + (I.ZZX - I.W1STKL5) * 0.42);
      I.ST    = I.HOCH < I.VERGL ? I.HOCH : I.VERGL;
    }
  }
}

// ---------------------------------------------------------------------------
// UPMLST
// ---------------------------------------------------------------------------
function UPMLST(I: Intern): void {
  if (I.ZVE < 1) { I.ZVE = 0; I.X = 0; }
  else            { I.X = euroAbr(I.ZVE / I.KZTAB); }
  I.P.STKL < 5 ? UPTAB26(I) : MST5_6(I);
}

// ---------------------------------------------------------------------------
// UPANTEIL
// ---------------------------------------------------------------------------
function UPANTEIL(I: Intern): void {
  switch (I.P.LZZ) {
    case 1: I.ANTEIL1 = I.JW; break;
    case 2: I.ANTEIL1 = trunc(I.JW / 12); break;
    case 3: I.ANTEIL1 = trunc(I.JW * 7 / 360); break;
    case 4: I.ANTEIL1 = trunc(I.JW / 360); break;
  }
}

// ---------------------------------------------------------------------------
// MVSPKVPV
// ---------------------------------------------------------------------------
function MVSPKVPV(I: Intern): void {
  I.ZRE4VPR = I.ZRE4VP > I.BBGKVPV ? I.BBGKVPV : I.ZRE4VP;

  if (I.P.PKV > 0) {
    if (I.P.STKL === 6) {
      I.VSPKVPV = 0;
    } else {
      I.PKPVAGZJ = centAbr(I.P.PKPVAGZ * 12.0 / 100.0);
      I.VSPKVPV  = I.P.PKPV * 12.0 / 100.0 - I.PKPVAGZJ;
      if (I.VSPKVPV < 0) I.VSPKVPV = 0;
    }
  } else {
    I.VSPKVPV = I.ZRE4VPR * (I.KVSATZAN + I.PVSATZAN);
  }

  I.VSP = centAbr(I.VSPKVPV + I.VSPR);
}

// ---------------------------------------------------------------------------
// MVSPHB
// ---------------------------------------------------------------------------
function MVSPHB(I: Intern): void {
  I.ZRE4VPR = I.ZRE4VP > I.BBGRVALV ? I.BBGRVALV : I.ZRE4VP;
  I.VSPALV  = I.AVSATZAN * I.ZRE4VPR;
  I.VSPHB   = I.VSPALV + I.VSPKVPV;
  if (I.VSPHB > 1900) I.VSPHB = 1900;
  I.VSPN = euroAuf(I.VSPR + I.VSPHB);
  if (I.VSPN > I.VSP) I.VSP = I.VSPN;
}

// ---------------------------------------------------------------------------
// UPEVP
// ---------------------------------------------------------------------------
function UPEVP(I: Intern): void {
  if (I.P.KRV === 1) {
    I.VSPR = 0;
  } else {
    I.ZRE4VPR = I.ZRE4VP > I.BBGRVALV ? I.BBGRVALV : I.ZRE4VP;
    I.VSPR    = centAbr(I.ZRE4VPR * I.RVSATZAN);
  }

  MVSPKVPV(I);

  if (I.P.ALV === 1) return;
  if (I.P.STKL === 6) return;

  MVSPHB(I);
}

// ---------------------------------------------------------------------------
// MLSTJAHR
// ---------------------------------------------------------------------------
function MLSTJAHR(I: Intern): void {
  UPEVP(I);
  I.ZVE = I.ZRE4 - I.ZTABFB - I.VSP;
  UPMLST(I);
}

// ---------------------------------------------------------------------------
// UPLSTLZZ
// ---------------------------------------------------------------------------
function UPLSTLZZ(I: Intern): void {
  I.JW     = roundInt(I.LSTJAHR * 100.0);
  UPANTEIL(I);
  I.LSTLZZ = I.ANTEIL1;
}

// ---------------------------------------------------------------------------
// MSOLZ
// ---------------------------------------------------------------------------
function MSOLZ(I: Intern): void {
  I.SOLZFREI = I.SOLZFREI * I.KZTAB;

  if (I.JBMG > I.SOLZFREI) {
    I.SOLZJ   = centAbr(I.JBMG * 5.5 / 100.0);
    I.SOLZMIN = centAbr((I.JBMG - I.SOLZFREI) * 11.9 / 100.0);
    if (I.SOLZMIN < I.SOLZJ) I.SOLZJ = I.SOLZMIN;
    I.JW      = roundInt(I.SOLZJ * 100.0);
    UPANTEIL(I);
    I.SOLZLZZ = I.ANTEIL1;
  } else {
    I.SOLZLZZ = 0;
  }

  if (I.P.R > 0) {
    I.JW = roundInt(I.JBMG * 100.0);
    UPANTEIL(I);
    I.BK = I.ANTEIL1;
  } else {
    I.BK = 0;
  }
}

// ---------------------------------------------------------------------------
// MBERECH
// ---------------------------------------------------------------------------
function MBERECH(I: Intern): void {
  MZTABFB(I);
  I.VFRB = roundInt((I.ANP + I.FVB + I.FVBZ) * 100.0);
  MLSTJAHR(I);
  I.WVFRB = roundInt((I.ZVE - I.GFB) * 100.0);
  if (I.WVFRB < 0) I.WVFRB = 0;
  I.LSTJAHR = I.ST * I.F;
  UPLSTLZZ(I);

  if (I.P.ZKF > 0) {
    I.ZTABFB += I.KFB;
    MRE4ABZ(I);
    MLSTJAHR(I);
    I.JBMG = I.ST * I.F;
  } else {
    I.JBMG = I.LSTJAHR;
  }

  MSOLZ(I);
}

// ---------------------------------------------------------------------------
// MOSONST
// ---------------------------------------------------------------------------
function MOSONST(I: Intern): void {
  I.ZRE4J   = I.P.JRE4    / 100.0;
  I.ZVBEZJ  = I.P.JVBEZ   / 100.0;
  I.JLFREIB = I.P.JFREIB  / 100.0;
  I.JLHINZU = I.P.JHINZU  / 100.0;
  MRE4(I);
  MRE4ABZ(I);
  I.ZRE4VP -= I.P.JRE4ENT / 100.0;
  MZTABFB(I);
  I.VFRBS1 = roundInt((I.ANP + I.FVB + I.FVBZ) * 100.0);
  MLSTJAHR(I);
  I.WVFRBO = roundInt((I.ZVE - I.GFB) * 100.0);
  if (I.WVFRBO < 0) I.WVFRBO = 0;
  I.LSTOSO = I.ST * 100.0;
}

// ---------------------------------------------------------------------------
// MRE4SONST
// ---------------------------------------------------------------------------
function MRE4SONST(I: Intern): void {
  MRE4(I);
  I.FVB = I.FVBSO;
  MRE4ABZ(I);
  I.ZRE4VP += I.P.MBV / 100.0 - I.P.JRE4ENT / 100.0 - I.P.SONSTENT / 100.0;
  I.FVBZ = I.FVBZSO;
  MZTABFB(I);
  I.VFRBS2 = roundInt((I.ANP + I.FVB + I.FVBZ) * 100.0) - I.VFRBS1;
}

// ---------------------------------------------------------------------------
// MSOLZSTS
// ---------------------------------------------------------------------------
function MSOLZSTS(I: Intern): void {
  I.SOLZSZVE = I.P.ZKF > 0 ? I.ZVE - I.KFB : I.ZVE;

  if (I.SOLZSZVE < 1) {
    I.SOLZSZVE = 0; I.X = 0;
  } else {
    I.X = euroAbr(I.SOLZSZVE / I.KZTAB);
  }

  I.P.STKL < 5 ? UPTAB26(I) : MST5_6(I);

  I.SOLZSBMG = I.ST * I.F;
  I.SOLZS    = I.SOLZSBMG > I.SOLZFREI ? trunc(I.STS * 5.5 / 100.0) : 0;
}

// ---------------------------------------------------------------------------
// STSMIN
// ---------------------------------------------------------------------------
function STSMIN(I: Intern): void {
  if (I.STS < 0) {
    if (I.P.MBV === 0) {
      I.STS = 0; I.SOLZS = 0;
    } else {
      I.LSTLZZ += I.STS;
      if (I.LSTLZZ < 0) I.LSTLZZ = 0;
      I.SOLZLZZ += trunc(I.STS * 5.5 / 100.0);
      if (I.SOLZLZZ < 0) I.SOLZLZZ = 0;
      I.BK += I.STS;
      if (I.BK < 0) I.BK = 0;
      I.STS = 0; I.SOLZS = 0;
    }
  }
  MSOLZSTS(I);
  I.BKS = I.P.R > 0 ? I.STS : 0;
}

// ---------------------------------------------------------------------------
// MSONST
// ---------------------------------------------------------------------------
function MSONST(I: Intern): void {
  if (I.P.LZZ === 1 && I.P.ZMVB === 0) I.P.ZMVB = 12;

  if (I.P.SONSTB === 0 && I.P.MBV === 0) {
    I.LSTSO = 0; I.STS = 0; I.SOLZS = 0; I.BKS = 0;
    return;
  }

  MOSONST(I);

  I.ZRE4J   = (I.P.JRE4 + I.P.SONSTB) / 100.0;
  I.ZVBEZJ  = (I.P.JVBEZ + I.P.VBS) / 100.0;
  I.VBEZBSO = I.P.STERBE;

  MRE4SONST(I);
  MLSTJAHR(I);

  I.WVFRBM = roundInt((I.ZVE - I.GFB) * 100.0);
  if (I.WVFRBM < 0) I.WVFRBM = 0;

  I.LSTSO = I.ST * 100.0;
  I.STS   = trunc((I.LSTSO - I.LSTOSO) * I.F);

  STSMIN(I);
}

// ---------------------------------------------------------------------------
// Öffentliche Funktionen
// ---------------------------------------------------------------------------
export function LST2026_Init(P: LST2026Params): void {
  P.AF       = 0; P.AJAHR  = 0; P.ALTER1 = 0; P.ALV    = 0;
  P.F        = 1.0;
  P.JFREIB   = 0; P.JHINZU = 0; P.JRE4   = 0; P.JRE4ENT = 0;
  P.JVBEZ    = 0; P.KRV    = 0;
  P.KVZ      = 2.90;
  P.LZZ      = 2;
  P.LZZFREIB = 0; P.LZZHINZU = 0; P.MBV  = 0;
  P.PKPV     = 0; P.PKPVAGZ  = 0; P.PKV  = 0;
  P.PVA      = 0; P.PVS      = 0; P.PVZ  = 0;
  P.R        = 0;
  P.RE4      = 0; P.SONSTB   = 0; P.SONSTENT = 0;
  P.STERBE   = 0; P.STKL     = 1;
  P.VBEZ     = 0; P.VBEZM    = 0; P.VBEZS = 0;
  P.VBS      = 0; P.VJAHR    = 0;
  P.ZKF      = 0; P.ZMVB     = 0;
}

export function LST2026_Berechne(P: LST2026Params): LST2026Result {
  const I: Intern = {
    ALTE:0,ANP:0,ANTEIL1:0,AVSATZAN:0,BBGKVPV:0,BBGRVALV:0,BMG:0,DIFF:0,
    EFA:0,F:P.F,FVB:0,FVBSO:0,FVBZ:0,FVBZSO:0,GFB:0,HBALTE:0,HFVB:0,
    HFVBZ:0,HFVBZSO:0,HOCH:0,J:0,JBMG:0,JLFREIB:0,JLHINZU:0,JW:0,K:0,
    KFB:0,KVSATZAN:0,KZTAB:1,LSTJAHR:0,LSTOSO:0,LSTSO:0,MIST:0,PKPVAGZJ:0,
    PVSATZAN:0,RVSATZAN:0,RW:0,SAP:0,SOLZFREI:0,SOLZJ:0,SOLZMIN:0,
    SOLZSBMG:0,SOLZSZVE:0,ST:0,ST1:0,ST2:0,VBEZB:0,VBEZBSO:0,VERGL:0,
    VSP:0,VSPKVPV:0,VSPN:0,VSPALV:0,VSPHB:0,VSPR:0,W1STKL5:0,W2STKL5:0,
    W3STKL5:0,X:0,Y:0,ZRE4:0,ZRE4J:0,ZRE4VP:0,ZRE4VPR:0,ZTABFB:0,
    ZVBEZ:0,ZVBEZJ:0,ZVE:0,ZX:0,ZZX:0,
    LSTLZZ:0,SOLZLZZ:0,BK:0,STS:0,SOLZS:0,BKS:0,
    VFRB:0,VFRBS1:0,VFRBS2:0,WVFRB:0,WVFRBM:0,WVFRBO:0,
    P: { ...P }
  };

  MPARA(I);
  MRE4JL(I);
  I.VBEZBSO = 0;
  MRE4(I);
  MRE4ABZ(I);
  MBERECH(I);
  MSONST(I);

  return {
    LSTLZZ:  I.LSTLZZ,  SOLZLZZ: I.SOLZLZZ, BK:     I.BK,
    STS:     I.STS,     SOLZS:   I.SOLZS,    BKS:    I.BKS,
    VFRB:    I.VFRB,    VFRBS1:  I.VFRBS1,   VFRBS2: I.VFRBS2,
    WVFRB:   I.WVFRB,   WVFRBM:  I.WVFRBM,   WVFRBO: I.WVFRBO,
  };
}

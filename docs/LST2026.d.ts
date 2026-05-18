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
export interface LST2026Params {
    AF: number;
    AJAHR: number;
    ALTER1: number;
    ALV: number;
    F: number;
    JFREIB: number;
    JHINZU: number;
    JRE4: number;
    JRE4ENT: number;
    JVBEZ: number;
    KRV: number;
    KVZ: number;
    LZZ: number;
    LZZFREIB: number;
    LZZHINZU: number;
    MBV: number;
    PKPV: number;
    PKPVAGZ: number;
    PKV: number;
    PVA: number;
    PVS: number;
    PVZ: number;
    R: number;
    RE4: number;
    SONSTB: number;
    SONSTENT: number;
    STERBE: number;
    STKL: number;
    VBEZ: number;
    VBEZM: number;
    VBEZS: number;
    VBS: number;
    VJAHR: number;
    ZKF: number;
    ZMVB: number;
}
export interface LST2026Result {
    LSTLZZ: number;
    SOLZLZZ: number;
    BK: number;
    STS: number;
    SOLZS: number;
    BKS: number;
    VFRB: number;
    VFRBS1: number;
    VFRBS2: number;
    WVFRB: number;
    WVFRBM: number;
    WVFRBO: number;
}
export declare function LST2026_Init(P: LST2026Params): void;
export declare function LST2026_Berechne(P: LST2026Params): LST2026Result;

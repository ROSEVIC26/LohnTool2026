/**
 * LohnTypen.ts
 * Jahresübergreifende Schnittstellen für Lohnsteuer- und SV-Berechnung.
 *
 * Jede Jahresversion (LST2026/LST2027, SV2026/SV2027, …) implementiert
 * dieselben Ein- und Ausgangsparameter. Die Feldnamen folgen dem
 * BMF-Programmablaufplan; ändert das BMF die Schnittstelle in einem
 * künftigen Jahr, wird sie hier erweitert (neue Felder optional halten).
 */
export interface LSTParams {
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
export interface LSTResult {
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
export interface SVParams {
    BRUTTO: number;
    RK: number;
    PKV: number;
    KVZ: number;
    KVERM: number;
    PKVBeitragKV: number;
    PKVBeitragPV: number;
    PVKinder: number;
    PVS: number;
    KRV: number;
    KAV: number;
}
export interface SVResult {
    KVAN: number;
    KVAG: number;
    KVBMG: number;
    PVAN: number;
    PVAG: number;
    PVBMG: number;
    RVAN: number;
    RVAG: number;
    RVBMG: number;
    AVAN: number;
    AVAG: number;
    AVBMG: number;
    GSAN: number;
    GSAG: number;
    GSGES: number;
}

/**
 * SV2026.ts
 * Sozialversicherungsberechnung 2026
 * Berechnung der Arbeitnehmer- und Arbeitgeberanteile zur
 * Kranken-, Pflege-, Renten- und Arbeitslosenversicherung
 *
 * Grundlage:
 *   Sozialversicherungsrechengrößen-Verordnung 2026 (BGBl. 26.11.2025)
 *   SGB V (KV), SGB XI (PV), SGB VI (RV), SGB III (AV)
 *
 * TypeScript-Portierung aus SV2026.pas (Delphi)
 */
export interface SV2026Params {
    BRUTTO: number;
    RK: number;
    PKV: number;
    KVZ: number;
    KVERM: number;
    PKPV: number;
    PKPVAG: number;
    PVKinder: number;
    PVS: number;
    KRV: number;
    KAV: number;
}
export interface SV2026Result {
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
export declare function SV2026_Init(P: SV2026Params): void;
export declare function SV2026_Berechne(P: SV2026Params): SV2026Result;

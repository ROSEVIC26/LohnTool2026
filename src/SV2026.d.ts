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
import type { SVParams, SVResult } from './LohnTypen.js';
export type SV2026Params = SVParams;
export type SV2026Result = SVResult;
export declare function SV2026_Init(P: SV2026Params): void;
export declare function SV2026_Berechne(P: SV2026Params): SV2026Result;

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
import type { LSTParams, LSTResult } from './LohnTypen.js';
export type LST2026Params = LSTParams;
export type LST2026Result = LSTResult;
export declare function LST2026_Init(P: LST2026Params): void;
export declare function LST2026_Berechne(P: LST2026Params): LST2026Result;

/**
 * LST2027.ts
 * Lohnsteuerberechnung 2027
 * Programmablaufplan gem. BMF-Schreiben IV C 5 - S 2361/00025/017/004
 * vom 08.10.2026 – *** ENTWURF, rechtlich nicht verbindlich ***
 * Anlage 1: Maschinelle Berechnung der Lohnsteuer, des Solidaritätszuschlags
 *           und der Maßstabsteuer für die Kirchenlohnsteuer für 2027
 *
 * Grundlage: § 39b Absatz 6 EStG
 * Gültig für Lohnzahlungszeiträume nach dem 31.12.2026, vor dem 01.01.2028
 *
 * Abgeleitet aus LST2026.ts. Änderungen gegenüber 2026 (lt. Entwurf):
 *   - Grundfreibetrag 12.564 €, Tarif 2027 inkl. neuer 47-%-Stufe ab 280.000 €
 *     (45 % ab 250.000 €)                       -> UPTAB27, MST5_6 (W4STKL5)
 *   - Arbeitnehmer-Pauschbetrag 1.430 €           -> MZTABFB
 *   - Freibeträge für Kinder 5.028 / 10.056 €     -> MZTABFB
 *   - getrennte BBG für KV und PV (beide 76.500 €), BBG RV/AV 106.200 €
 *   - PV-Kinderlosenzuschlag 0,9 %                -> MPARA
 *   - Grenzwerte StKl V/VI: 14.251 / 35.299 / 200.000 / 224.000 €
 * Geprüft gegen beide Prüftabellen des Entwurfs (test/pruef-lst.mjs).
 * Beim endgültigen BMF-Schreiben alle mit [ENTWURF] markierten Stellen prüfen.
 */
import type { LSTParams, LSTResult } from './LohnTypen.js';
export type LST2027Params = LSTParams;
export type LST2027Result = LSTResult;
export declare function LST2027_Init(P: LST2027Params): void;
export declare function LST2027_Berechne(P: LST2027Params): LST2027Result;

/**
 * SV2027.ts
 * Sozialversicherungsberechnung 2027
 * Berechnung der Arbeitnehmer- und Arbeitgeberanteile zur
 * Kranken-, Pflege-, Renten- und Arbeitslosenversicherung
 *
 * Grundlage (Stand 11.11.2026 – noch NICHT endgültig):
 *   Sozialversicherungsrechengrößen-Verordnung 2027, Kabinettsbeschluss
 *   07.10.2026, BR-Drs. 576/26 – Zustimmung Bundesrat ausstehend
 *   Pflegeneuordnungsgesetz (PNOG), Kabinettsbeschluss 30.09.2026 – ausstehend
 *   Durchschnittl. Zusatzbeitrag 2,9 % (BMG, festgelegt 30.10.2026)
 *   SGB V (KV), SGB XI (PV), SGB VI (RV), SGB III (AV)
 *
 * Abgeleitet aus SV2026.ts. Änderungen gegenüber 2026:
 *   - BBG KV 6.375 €, BBG RV/AV 8.850 €
 *   - BBG PV eigene Konstante (PNOG: 6.375 €, ohne PNOG: 6.075 €)
 *   - PV-Kinderlosenzuschlag 0,9 % (PNOG)
 *   - Höchstzuschuss AG zur PKV inkl. halbem durchschnittl. Zusatzbeitrag
 * Mit [VORLÄUFIG] markierte Werte nach Verkündung prüfen.
 */
import type { SVParams, SVResult } from './LohnTypen.js';
export type SV2027Params = SVParams;
export type SV2027Result = SVResult;
export declare function SV2027_Init(P: SV2027Params): void;
export declare function SV2027_Berechne(P: SV2027Params): SV2027Result;

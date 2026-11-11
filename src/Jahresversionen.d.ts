/**
 * Jahresversionen.ts
 * Zentrale Jahresweiche: ordnet jedem Abrechnungsjahr seine Lohnsteuer-
 * (PAP) und Sozialversicherungsberechnung zu.
 *
 * Neues Jahr aufnehmen:
 *   1. LST<Jahr>.ts und SV<Jahr>.ts anlegen (Kopie des Vorjahres, Werte/
 *      Ablauf nach neuem PAP bzw. SV-Rechengrößen anpassen)
 *   2. hier importieren und in JAHRESVERSIONEN eintragen
 *   3. Prüftabellen des BMF in test/pruef-lst.mjs ergänzen, `npm test`
 *   4. tsconfig.json / tsconfig.server.json: neue Dateien eintragen
 *
 * Server und Oberfläche lesen nur aus dieser Tabelle – sonst ist nichts
 * jahresabhängig.
 */
import type { LSTParams, LSTResult, SVParams, SVResult } from './LohnTypen.js';
/** 'endgueltig' = verbindliche Rechtsgrundlage, 'vorlaeufig' = Entwurf */
export type Rechtsstand = 'endgueltig' | 'vorlaeufig';
export interface Jahresversion {
    jahr: number;
    status: Rechtsstand;
    /** Kurzbeschreibung für Kopfzeile und Ausdruck */
    stand: string;
    /** Hinweise, die bei vorläufigen Versionen angezeigt werden */
    hinweise: string[];
    lst: {
        init: (P: LSTParams) => void;
        berechne: (P: LSTParams) => LSTResult;
    };
    sv: {
        init: (P: SVParams) => void;
        berechne: (P: SVParams) => SVResult;
    };
}
export declare const JAHRESVERSIONEN: Record<number, Jahresversion>;
/** Alle unterstützten Jahre, aufsteigend */
export declare const UNTERSTUETZTE_JAHRE: number[];
/** Liefert die Jahresversion oder undefined, wenn das Jahr nicht unterstützt wird */
export declare function jahresversion(jahr: number): Jahresversion | undefined;
/**
 * Vorbelegung für die Oberfläche: das aktuelle Kalenderjahr, sofern
 * unterstützt, sonst das nächstliegende unterstützte Jahr.
 */
export declare function standardJahr(heute?: Date): number;

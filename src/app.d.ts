/**
 * app.ts
 * LohnTool – Hauptlogik (Browser), jahresübergreifend
 * Portierung von ULohnForm.pas
 *
 * Die Berechnung läuft auf dem Server; das gewählte Abrechnungsjahr wird
 * als Feld `jahr` mitgeschickt. Welche Jahre es gibt, liefert GET /api/jahre
 * (Quelle: src/Jahresversionen.ts). Die Erfassungsmaske ist für alle Jahre gleich.
 */
declare const MONATE: string[];
declare const API_BASIS = "https://lohntool2026.onrender.com";
interface JahrInfo {
    jahr: number;
    status: 'endgueltig' | 'vorlaeufig';
    stand: string;
    hinweise: string[];
}
declare let JAHRE: JahrInfo[];
declare const BUNDESLAENDER: string[];
declare const KISTSAETZE: number[];
declare let gLSTResult: any;
declare let gSVResult: any;
declare let gBruttoCent: number;
declare let gKiStCent: number;
declare let gJahrInfo: JahrInfo | null;
declare let gPKVZuschuss: number;
declare function fmtEuro(cent: number): string;
/** Liest einen Betrag "1.234,56" aus einem Input und gibt Cent zurück */
declare function parseEuroCent(value: string, feldname: string): number | null;
declare function el<T extends HTMLElement>(id: string): T;
declare function jahrInfo(jahr: number): JahrInfo | undefined;
declare function gewaehltesJahr(): number;
/** Lädt die unterstützten Jahre vom Server; bei Fehler bleibt der Fallback */
declare function ladeJahre(): Promise<void>;
/** Vorbelegung: aktuelles Kalenderjahr, sofern unterstützt, sonst nächstliegendes */
declare function standardJahr(): number;
declare function fuelleJahre(vorbelegung: number): void;
/** Kopfzeile, Fenstertitel und Hinweisband an das gewählte Jahr anpassen */
declare function aktualisiereJahr(): void;
declare function initControls(): void;
declare function aktualisiereSVFelder(): void;
declare function aktualisiereKiStFelder(): void;
declare function aktualisiereAlterFelder(): void;
declare function kiStSatz(): number;
declare function formatBetrag(input: HTMLInputElement): void;
declare function setZeile(idLabel: string, idWert: string, beschriftung: string, cent: number, bold?: boolean, cssClass?: string): void;
declare function berechnen(): Promise<void>;
declare function drucken(): void;

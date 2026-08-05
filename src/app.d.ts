/**
 * app.ts
 * LohnTool 2026 – Hauptlogik (Browser)
 * Portierung von ULohnForm.pas
 */
declare const MONATE: string[];
declare const BUNDESLAENDER: string[];
declare const KISTSAETZE: number[];
declare let gLSTResult: any;
declare let gSVResult: any;
declare let gBruttoCent: number;
declare let gKiStCent: number;
declare function fmtEuro(cent: number): string;
/** Liest einen Betrag "1.234,56" aus einem Input und gibt Cent zurück */
declare function parseEuroCent(value: string, feldname: string): number | null;
declare function el<T extends HTMLElement>(id: string): T;
declare function initControls(): void;
declare function aktualisiereSVFelder(): void;
declare function aktualisiereKiStFelder(): void;
declare function aktualisiereAlterFelder(): void;
declare function kiStSatz(): number;
declare function formatBetrag(input: HTMLInputElement): void;
declare function setZeile(idLabel: string, idWert: string, beschriftung: string, cent: number, bold?: boolean, cssClass?: string): void;
declare function berechnen(): Promise<void>;
declare function drucken(): void;

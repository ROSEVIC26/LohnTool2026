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
import { LST2026_Init, LST2026_Berechne } from './LST2026.js';
import { SV2026_Init, SV2026_Berechne } from './SV2026.js';
import { LST2027_Init, LST2027_Berechne } from './LST2027.js';
import { SV2027_Init, SV2027_Berechne } from './SV2027.js';
export const JAHRESVERSIONEN = {
    2026: {
        jahr: 2026,
        status: 'endgueltig',
        stand: 'PAP 2026 (BMF-Schreiben 12.11.2025) · SV-Rechengrößen-VO 2026',
        hinweise: [],
        lst: { init: LST2026_Init, berechne: LST2026_Berechne },
        sv: { init: SV2026_Init, berechne: SV2026_Berechne },
    },
    2027: {
        jahr: 2027,
        status: 'vorlaeufig',
        stand: 'PAP-Entwurf 2027 (BMF 08.10.2026) · SV-Rechengrößen 2027 (Kabinettsentwurf)',
        hinweise: [
            'Lohnsteuer nach PAP-Entwurf vom 08.10.2026; Einkommensteuerreformgesetz 2027 noch nicht verabschiedet.',
            'SV-Rechengrößen 2027 vorbehaltlich Zustimmung des Bundesrats.',
            'PV: Kinderlosenzuschlag 0,9 % und BBG 6.375 € vorbehaltlich Pflegeneuordnungsgesetz.',
        ],
        lst: { init: LST2027_Init, berechne: LST2027_Berechne },
        sv: { init: SV2027_Init, berechne: SV2027_Berechne },
    },
};
/** Alle unterstützten Jahre, aufsteigend */
export const UNTERSTUETZTE_JAHRE = Object.keys(JAHRESVERSIONEN).map(Number).sort((a, b) => a - b);
/** Liefert die Jahresversion oder undefined, wenn das Jahr nicht unterstützt wird */
export function jahresversion(jahr) {
    return JAHRESVERSIONEN[jahr];
}
/**
 * Vorbelegung für die Oberfläche: das aktuelle Kalenderjahr, sofern
 * unterstützt, sonst das nächstliegende unterstützte Jahr.
 */
export function standardJahr(heute = new Date()) {
    const j = heute.getFullYear();
    if (JAHRESVERSIONEN[j])
        return j;
    return j < UNTERSTUETZTE_JAHRE[0]
        ? UNTERSTUETZTE_JAHRE[0]
        : UNTERSTUETZTE_JAHRE[UNTERSTUETZTE_JAHRE.length - 1];
}
//# sourceMappingURL=Jahresversionen.js.map
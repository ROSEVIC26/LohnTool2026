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
// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------
function roundCent(v) {
    return Math.trunc(v + 0.5);
}
function bmg(brutto, grenze) {
    return brutto > grenze ? grenze : brutto;
}
// ---------------------------------------------------------------------------
// Rechengrößen 2027 (monatlich, Beträge in Cent)
// ---------------------------------------------------------------------------
const BBG_KV = 637500; // 6.375,00 €/Monat   [VORLÄUFIG] SV-RechGrV 2027
const BBG_PV = 637500; // 6.375,00 €/Monat   [VORLÄUFIG] nur mit PNOG,
//   ohne PNOG gilt 607500 (6.075,00 €)
const BBG_RVALV = 885000; // 8.850,00 €/Monat   [VORLÄUFIG] SV-RechGrV 2027
const KV_ALLG = 14.6;
const KV_ERM = 14.0;
const RV_SATZ = 18.6;
const AV_SATZ = 2.6;
const PV_AG_WEST = 1.8;
const PV_AG_SACHSEN = 1.3;
const PV_AN_BASIS_W = 1.8;
const PV_AN_BASIS_S = 2.3;
const PV_ZUSCHLAG = 0.9; // [VORLÄUFIG] PNOG (2026: 0,6)
const PV_ABSCHLAG = 0.25;
// Höchstzuschuss AG zur privaten KV/PV (§ 257 SGB V, § 61 SGB XI):
// KV: BBG_KV × (14,6 % / 2 + durchschn. Zusatzbeitrag 2,9 % / 2) = 6.375 € × 8,75 %
// PV: BBG_PV × 1,8 %, in Sachsen BBG_PV × 1,3 %
const KVZ_DURCHSCHNITT = 2.9;
const PKV_KV_AG_MAX = roundCent(BBG_KV * (KV_ALLG / 2 + KVZ_DURCHSCHNITT / 2) / 100); // 557,81 €
const PKV_PV_AG_MAX = roundCent(BBG_PV * PV_AG_WEST / 100); // 114,75 €
const PKV_PV_AG_MAX_SACHSEN = roundCent(BBG_PV * PV_AG_SACHSEN / 100); //  82,88 €
// ---------------------------------------------------------------------------
// SV2027_Init
// ---------------------------------------------------------------------------
export function SV2027_Init(P) {
    P.BRUTTO = 0;
    P.RK = 0;
    P.PKV = 0;
    P.KVZ = 2.90;
    P.KVERM = 0;
    P.PKVBeitragKV = 0;
    P.PKVBeitragPV = 0;
    P.PVKinder = 1;
    P.PVS = 0;
    P.KRV = 0;
    P.KAV = 0;
}
// ---------------------------------------------------------------------------
// SV2027_Berechne
// ---------------------------------------------------------------------------
export function SV2027_Berechne(P) {
    const R = {
        KVAN: 0, KVAG: 0, KVBMG: 0,
        PVAN: 0, PVAG: 0, PVBMG: 0,
        RVAN: 0, RVAG: 0, RVBMG: 0,
        AVAN: 0, AVAG: 0, AVBMG: 0,
        GSAN: 0, GSAG: 0, GSGES: 0
    };
    const bmgKV = bmg(P.BRUTTO, BBG_KV);
    const bmgPV = bmg(P.BRUTTO, BBG_PV);
    const bmgRVAV = bmg(P.BRUTTO, BBG_RVALV);
    R.KVBMG = bmgKV;
    R.PVBMG = bmgPV;
    R.RVBMG = bmgRVAV;
    R.AVBMG = bmgRVAV;
    // --- Krankenversicherung ---
    if (P.PKV === 0) {
        const kvSatz = (P.KVERM === 1 ? KV_ERM : KV_ALLG) + P.KVZ;
        R.KVAN = roundCent(bmgKV * (kvSatz / 2.0) / 100.0);
        R.KVAG = roundCent(bmgKV * (kvSatz / 2.0) / 100.0);
    }
    else {
        let kvAgMax = PKV_KV_AG_MAX;
        // höchstens die Hälfte des tatsächlichen KV-Beitrags (§ 257 Abs. 2 SGB V)
        if (kvAgMax > Math.trunc(P.PKVBeitragKV / 2))
            kvAgMax = Math.trunc(P.PKVBeitragKV / 2);
        R.KVAG = kvAgMax;
        R.KVAN = 0;
    }
    // --- Pflegeversicherung ---
    if (P.PKV === 0) {
        const pvSatzAG = P.PVS === 1 ? PV_AG_SACHSEN : PV_AG_WEST;
        let pvSatzAN = P.PVS === 1 ? PV_AN_BASIS_S : PV_AN_BASIS_W;
        if (P.PVKinder === 0) {
            pvSatzAN += PV_ZUSCHLAG;
        }
        else {
            const kinder = Math.min(P.PVKinder, 5);
            if (kinder >= 2)
                pvSatzAN -= (kinder - 1) * PV_ABSCHLAG;
        }
        if (pvSatzAN < 0)
            pvSatzAN = 0;
        R.PVAN = roundCent(bmgPV * pvSatzAN / 100.0);
        R.PVAG = roundCent(bmgPV * pvSatzAG / 100.0);
    }
    else {
        let pvAgMax = P.PVS === 1 ? PKV_PV_AG_MAX_SACHSEN : PKV_PV_AG_MAX;
        // höchstens die Hälfte des tatsächlichen PV-Beitrags (§ 61 Abs. 2 SGB XI)
        if (pvAgMax > Math.trunc(P.PKVBeitragPV / 2))
            pvAgMax = Math.trunc(P.PKVBeitragPV / 2);
        R.PVAG = pvAgMax;
        R.PVAN = 0;
    }
    // --- Rentenversicherung ---
    if (P.KRV === 0) {
        R.RVAN = roundCent(bmgRVAV * (RV_SATZ / 2.0) / 100.0);
        R.RVAG = roundCent(bmgRVAV * (RV_SATZ / 2.0) / 100.0);
    }
    // --- Arbeitslosenversicherung ---
    if (P.KAV === 0) {
        R.AVAN = roundCent(bmgRVAV * (AV_SATZ / 2.0) / 100.0);
        R.AVAG = roundCent(bmgRVAV * (AV_SATZ / 2.0) / 100.0);
    }
    // --- Summen ---
    R.GSAN = R.KVAN + R.PVAN + R.RVAN + R.AVAN;
    R.GSAG = R.KVAG + R.PVAG + R.RVAG + R.AVAG;
    R.GSGES = R.GSAN + R.GSAG;
    return R;
}
//# sourceMappingURL=SV2027.js.map
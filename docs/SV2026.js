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
// ---------------------------------------------------------------------------
// Rechengrößen 2026 (monatlich, Beträge in Cent)
// ---------------------------------------------------------------------------
const BBG_KVPV = 581250; // 5.812,50 €/Monat
const BBG_RVALV = 845000; // 8.450,00 €/Monat
const KV_ALLG = 14.6;
const KV_ERM = 14.0;
const RV_SATZ = 18.6;
const AV_SATZ = 2.6;
const PV_AG_WEST = 1.8;
const PV_AG_SACHSEN = 1.3;
const PV_AN_BASIS_W = 1.8;
const PV_AN_BASIS_S = 2.3;
const PV_ZUSCHLAG = 0.6;
const PV_ABSCHLAG = 0.25;
const PKV_KV_AG_MAX = 42431; // 424,31 €
const PKV_PV_AG_MAX = 10463; // 104,63 €
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
// SV2026_Init
// ---------------------------------------------------------------------------
export function SV2026_Init(P) {
    P.BRUTTO = 0;
    P.RK = 0;
    P.PKV = 0;
    P.KVZ = 2.90;
    P.KVERM = 0;
    P.PKPV = 0;
    P.PKPVAG = 0;
    P.PVKinder = 1;
    P.PVS = 0;
    P.KRV = 0;
    P.KAV = 0;
}
// ---------------------------------------------------------------------------
// SV2026_Berechne
// ---------------------------------------------------------------------------
export function SV2026_Berechne(P) {
    const R = {
        KVAN: 0, KVAG: 0, KVBMG: 0,
        PVAN: 0, PVAG: 0, PVBMG: 0,
        RVAN: 0, RVAG: 0, RVBMG: 0,
        AVAN: 0, AVAG: 0, AVBMG: 0,
        GSAN: 0, GSAG: 0, GSGES: 0
    };
    const bmgKVPV = bmg(P.BRUTTO, BBG_KVPV);
    const bmgRVAV = bmg(P.BRUTTO, BBG_RVALV);
    R.KVBMG = bmgKVPV;
    R.PVBMG = bmgKVPV;
    R.RVBMG = bmgRVAV;
    R.AVBMG = bmgRVAV;
    // --- Krankenversicherung ---
    if (P.PKV === 0) {
        const kvSatz = (P.KVERM === 1 ? KV_ERM : KV_ALLG) + P.KVZ;
        R.KVAN = roundCent(bmgKVPV * (kvSatz / 2.0) / 100.0);
        R.KVAG = roundCent(bmgKVPV * (kvSatz / 2.0) / 100.0);
    }
    else {
        let kvAgMax = PKV_KV_AG_MAX;
        if (kvAgMax > Math.trunc(P.PKPV / 2))
            kvAgMax = Math.trunc(P.PKPV / 2);
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
        R.PVAN = roundCent(bmgKVPV * pvSatzAN / 100.0);
        R.PVAG = roundCent(bmgKVPV * pvSatzAG / 100.0);
    }
    else {
        let pvAgMax = PKV_PV_AG_MAX;
        if (pvAgMax > Math.trunc(P.PKPV / 2))
            pvAgMax = Math.trunc(P.PKPV / 2);
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
//# sourceMappingURL=SV2026.js.map
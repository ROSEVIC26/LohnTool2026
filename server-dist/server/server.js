import express from 'express';
import { LST2026_Init, LST2026_Berechne } from '../src/LST2026.js';
import { SV2026_Init, SV2026_Berechne } from '../src/SV2026.js';
const app = express();
const PORT = 3000;
// JSON-Anfragen verstehen
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
// -------------------------------------------------------
// API-Endpunkt: POST /api/berechne
// -------------------------------------------------------
app.post('/api/berechne', (req, res) => {
    const d = req.body;
    // Lohnsteuer
    const LP = {};
    LST2026_Init(LP);
    LP.RE4 = d.brutto;
    LP.JRE4 = d.brutto * 12;
    LP.LZZ = 2;
    LP.STKL = d.stkl;
    LP.ZKF = d.zkf ?? 0;
    LP.LZZFREIB = d.freibet ?? 0;
    LP.KVZ = d.kvz ?? 2.90;
    LP.PKV = d.pkv ?? 0;
    LP.PKPV = d.pkpv ?? 0;
    LP.PKPVAGZ = d.pkpvagz ?? 0;
    LP.KRV = d.krv ?? 0;
    LP.ALV = d.alv ?? 0;
    LP.PVS = d.pvs ?? 0;
    LP.PVZ = d.pvz ?? 0;
    LP.R = d.kist ?? 0;
    if (d.alter1 && d.gebJahr) {
        LP.ALTER1 = 1;
        LP.AJAHR = d.gebJahr + 65;
    }
    const LR = LST2026_Berechne(LP);
    // Kirchensteuer
    const kiStSatz = d.kiStSatz ?? 0;
    const kiSt = d.kist ? Math.trunc(LR.BK * kiStSatz / 100.0) : 0;
    // Sozialversicherung
    const SP = {};
    SV2026_Init(SP);
    SP.BRUTTO = d.brutto;
    SP.PKV = d.pkv ?? 0;
    SP.KVZ = d.kvz ?? 2.90;
    SP.PKPV = d.pkpv ?? 0;
    SP.PKPVAG = d.pkpvagz ?? 0;
    SP.PVKinder = d.pvKinder ?? 1;
    SP.PVS = d.pvs ?? 0;
    SP.KRV = d.krv ?? 0;
    SP.KAV = d.alv ?? 0;
    const SR = SV2026_Berechne(SP);
    // Antwort
    res.json({
        lstlzz: LR.LSTLZZ,
        solzlzz: LR.SOLZLZZ,
        bk: LR.BK,
        kiSt: kiSt,
        rvan: SR.RVAN,
        kvan: SR.KVAN,
        pvan: SR.PVAN,
        avan: SR.AVAN,
        gsan: SR.GSAN,
        rvag: SR.RVAG,
        kvag: SR.KVAG,
        pvag: SR.PVAG,
        avag: SR.AVAG,
        gsag: SR.GSAG,
    });
});
// Server starten
app.listen(PORT, () => {
    console.log(`LohnTool Server läuft auf http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map
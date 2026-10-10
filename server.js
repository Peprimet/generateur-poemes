const express = require('express');
const path = require('path');
const app = express();

app.set('trust proxy', 1);
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ============ CONFIGURATION ============
const GEMINI_KEY = process.env.GEMINI_API_KEY || null;
const liste = (valeur) => valeur.split(',').map(s => s.trim()).filter(Boolean);
// Modèles essayés dans l'ordre : le premier qui répond gagne.
// ⚠️ Si la variable GEMINI_MODEL existe sur Render, ELLE ÉCRASE cette liste !
const GEMINI_MODELS = liste(process.env.GEMINI_MODEL || 'gemini-3.8-flash,gemini-3.5-flash-lite,gemini-2.5-flash,gemini-2.5-flash-lite');

const VERS_AUTORISES = [4, 8, 16, 24, 32];
const THEMES_AUTORISES = ['libre', 'amour', 'tristesse', 'nature', 'nuit', 'espoir'];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ============ LIMITE DE REQUÊTES ============
const FENETRE_MS = 60 * 1000;
const MAX_PAR_FENETRE = 10;
const historique = new Map();

function tropDeRequetes(ip) {
    const now = Date.now();
    const recentes = (historique.get(ip) || []).filter(t => now - t < FENETRE_MS);
    recentes.push(now);
    historique.set(ip, recentes);
    return recentes.length > MAX_PAR_FENETRE;
}
setInterval(() => {
    const now = Date.now();
    for (const [ip, ts] of historique) {
        if (ts.every(t => now - t >= FENETRE_MS)) historique.delete(ip);
    }
}, 5 * 60 * 1000).unref();

// ============================================================
//  CONSIGNES — le poème est centré sur la DEMANDE
// ============================================================
const TONS = {
    amour: 'tendre, sincère, chaleureux',
    tristesse: 'déchirant, pudique, à voix basse',
    nature: 'émerveillé, sensuel, vivant',
    nuit: 'mystérieux, intime, velouté',
    espoir: 'fervent, défiant, lumineux',
    general: 'profond, méditatif, intensément humain'
};

const SYSTEME = `Tu es un poète français contemporain. Tu écris des poèmes qui touchent, qui font mal et du bien à la fois.

RÈGLE ABSOLUE : le poème est SUR le sujet demandé. Si la demande est « un poème d'amour pour Juliette », tout le poème parle de Juliette et de l'amour pour elle — rien d'autre. Pas d'images hors sujet, pas de digression.

Tes principes :
1. MONTRER, NE PAS DIRE. L'émotion naît d'images concrètes et sensorielles (un geste, une lumière, une voix), pas de mots abstraits alignés.
2. LE SUJET DOMINE. Chaque vers parle du sujet demandé.
3. RIMES SIMPLES ET JUSTES. Schéma régulier (ABAB ou AABB, le même partout), pas d'inversion forcée, pas de mot-cheville.
4. RYTHME QUI RESPIRE. Vers de 10 à 12 syllabes environ, syntaxe naturelle, comme parlée.
5. UNE VOIX INTIME. Première personne, « tu » si le poème s'adresse à quelqu'un.
6. ZÉRO CLICHÉ. Bannis : cœur qui bat, océan de larmes, feu de l'amour, lumière au bout du tunnel, mon âme sœur, papillons dans le ventre, tu es mon soleil, pour l'éternité.
7. FRANÇAIS IMPECCABLE. Accords corrects, aucun mot inventé.

FORMAT DE SORTIE : ligne 1 = un titre court (2 à 5 mots) lié au sujet, grammaticalement correct (si prénom : « Pour Juliette », « Le sourire de Juliette » — jamais deux noms juxtaposés). Ligne vide. Puis les vers, en strophes de 4 vers séparées par une ligne vide. Rien d'autre : pas d'introduction, pas de commentaire, pas de markdown.`;

function construireConsigne(prompt, nombreVers, themeChoisi) {
    const ton = TONS[themeChoisi] || TONS.general;
    const nbStrophes = Math.ceil(nombreVers / 4);
    const particularite = themeChoisi === 'amour'
        ? `\n- Écris avec tendresse et pudeur : comme une lettre d'amour douce et vraie. De l'émotion sincère, sans exaltation ni fièvre — la douceur d'un amour profond et apaisé.`
        : '';

    const user = `Écris un poème en français.

SUJET — c'est LA demande, tout le poème doit en parler, chaque vers :
« ${prompt} »

TON : ${ton}
LONGUEUR : exactement ${nombreVers} vers, en ${nbStrophes} strophe${nbStrophes > 1 ? 's' : ''} de 4 vers.

- Si le sujet est une personne (un prénom, « ma mère »…), adresse-toi à elle avec « tu », invente des détails crédibles et touchants sur votre relation. Le titre aussi doit parler du sujet.${particularite}`;

    return { system: SYSTEME, user };
}

// ============================================================
//  APPEL GEMINI — défensif : si un paramètre est refusé (HTTP 400),
//  on retente automatiquement en configuration minimale
// ============================================================
async function appelerGemini(modele, system, user) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modele)}:generateContent`;
    const headers = { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY };
    const corpsBase = {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }]
    };

    // Config selon la génération du modèle :
    // - 2.5 : on coupe la « réflexion » (10-20 s de gagnées) + température haute
    // - 3.x : config minimale (température par défaut recommandée par Google)
    let generationConfig = { maxOutputTokens: 4096 };
    if (/2\.5/.test(modele)) {
        generationConfig.temperature = 1.0;
        generationConfig.topP = 0.95;
        generationConfig.thinkingConfig = { thinkingBudget: 0 };
    }

    let r = await fetch(url, {
        method: 'POST', headers,
        body: JSON.stringify({ ...corpsBase, generationConfig }),
        signal: AbortSignal.timeout(30000)
    });

    // Paramètre refusé ? Nouvel essai en config minimale
    if (r.status === 400) {
        const jErr = await r.json().catch(() => ({}));
        console.warn(`[IA] ${modele} : HTTP 400 (${jErr?.error?.message || '?'}) → essai en config minimale`);
        generationConfig = { maxOutputTokens: 4096 };
        r = await fetch(url, {
            method: 'POST', headers,
            body: JSON.stringify({ ...corpsBase, generationConfig }),
            signal: AbortSignal.timeout(30000)
        });
    }

    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`HTTP ${r.status} – ${j?.error?.message || 'réponse inattendue'}`);
    const parts = j?.candidates?.[0]?.content?.parts || [];
    const texte = parts.filter(p => p.text && !p.thought).map(p => p.text).join('').trim();
    if (!texte) {
        const blocage = j?.promptFeedback?.blockReason;
        throw new Error(blocage ? `réponse bloquée (${blocage})` : 'réponse vide');
    }
    return texte;
}

// ============================================================
//  MISE EN FORME : titre + strophes de 4 vers
// ============================================================
const PETITS_MOTS = new Set(['de', 'du', 'des', 'à', 'au', 'aux', 'en', 'et', 'ni', 'ou', 'pour', 'par', 'sous', 'sur', 'dans', 'chez', 'avec', 'sans', 'contre', 'vers', 'le', 'la', 'les', 'un', 'une']);

function corrigerTitre(titre) {
    const mots = titre.split(/\s+/);
    if (mots.length < 2) return titre;
    const article = /^(l'|le|la|les|un|une|des|d')/i.test(mots[0]);
    const dernier = mots[mots.length - 1];
    const avantDernier = mots[mots.length - 2];
    if (!avantDernier) return titre;
    const apresClitique = avantDernier.replace(/^(l'|d')/i, '');
    const dernierEstNom = /^[A-ZÀ-ÖØ-ÞŒÆ][a-zà-ÿ]/.test(dernier);
    const avantMinuscule = /^[a-zà-ÿ]/.test(apresClitique);
    if (article && dernierEstNom && avantMinuscule && !PETITS_MOTS.has(apresClitique.toLowerCase())) {
        mots.splice(-1, 0, /^[aeiouyéèêàâîôûh]/i.test(dernier) ? "d'" : 'de');
    }
    return mots.join(' ');
}

function mettreEnForme(brut, nombreVers, prompt) {
    if (!brut) return null;

    const lignes = brut
        .replace(/\r/g, '')
        .replace(/```[a-z]*/gi, '')
        .replace(/[*_#]/g, '')
        .split('\n')
        .map(l => l.replace(/^[-•]\s+/, '').trim())
        .filter(l => l && !/^(voici (le|un|ton|votre|mon)|bien sûr|d'accord|certainement)/i.test(l));
    if (lignes.length < 2) return null;

    const premiere = lignes.shift();
    let titre = premiere
        .replace(/^titre\s*:\s*/i, '')
        .replace(/^["«“'‘\s]+|["»”'’\s]+$/g, '')
        .replace(/[.:;,!?]+$/, '')
        .trim();

    // La 1re ligne ressemble à un vers plutôt qu'à un titre ?
    if (!titre || titre.split(' ').length > 7) {
        lignes.unshift(premiere);
        titre = prompt.length <= 40 ? cap(prompt.replace(/[.!?…]+$/, '')) : 'Sans titre';
    }

    const vers = lignes.slice(0, nombreVers);
    if (vers.length < Math.max(2, Math.ceil(nombreVers * 0.6))) return null;

    const strophes = [];
    for (let i = 0; i < vers.length; i += 4) strophes.push(vers.slice(i, i + 4).join('\n'));
    return `${cap(corrigerTitre(titre))}\n\n${strophes.join('\n\n')}`;
}

// ============================================================
//  GÉNÉRATION : essaie chaque modèle, mémorise le problème exact
// ============================================================
async function poemeParIA(prompt, nombreVers, themeChoisi) {
    const { system, user } = construireConsigne(prompt, nombreVers, themeChoisi);
    let probleme = 'aucun modèle configuré';

    for (const modele of GEMINI_MODELS) {
        try {
            const brut = await appelerGemini(modele, system, user);
            const poeme = mettreEnForme(brut, nombreVers, prompt);
            if (poeme) return { poeme, probleme: null };
            probleme = `${modele} : réponse inexploitable`;
            console.warn(`[IA] ${probleme} → "${String(brut).slice(0, 80).replace(/\n/g, ' / ')}"`);
        } catch (e) {
            probleme = `${modele} : ${e.message}`;
            console.error(`[IA] ${probleme}`);
        }
    }
    return { poeme: null, probleme };
}

// ============ ROUTES API ============
app.post('/generate-poem', async (req, res) => {
    if (tropDeRequetes(req.ip)) {
        return res.status(429).json({ error: 'Trop de demandes : patiente une minute.' });
    }

    const corps = req.body || {};
    const prompt = String(corps.prompt || '').replace(/\s+/g, ' ').trim().slice(0, 300);
    if (!prompt) return res.status(400).json({ error: 'Le prompt est vide.' });

    const lignes = parseInt(corps.lines, 10);
    const nombreVers = VERS_AUTORISES.includes(lignes) ? lignes : 16;
    const themeDemande = THEMES_AUTORISES.includes(corps.theme) ? corps.theme : 'libre';
    const themeChoisi = themeDemande === 'libre' ? 'general' : themeDemande;

    let poeme = null;
    let probleme = 'GEMINI_API_KEY absente sur le serveur (Render → Environment)';

    if (GEMINI_KEY) {
        try {
            const resultat = await poemeParIA(prompt, nombreVers, themeChoisi);
            poeme = resultat.poeme;
            probleme = resultat.probleme;
        } catch (e) {
            probleme = `erreur inattendue : ${e.message}`;
            console.error('[IA]', probleme);
        }
    }

    if (poeme) {
        console.log(`[poème] thème=${themeChoisi} vers=${nombreVers} source=ia`);
        return res.json({ poem: poeme, source: 'ia' });
    }

    console.log(`[poème] ÉCHEC (${probleme})`);
    res.json({
        poem: `Le poète est momentanément indisponible.\n\nCause : ${probleme}\n\nRéessaie dans un instant — ou ouvre /test-ia pour le diagnostic complet.`,
        source: 'erreur'
    });
});

// ============ DIAGNOSTIC : visite /test-ia dans ton navigateur ============
app.get('/test-ia', async (req, res) => {
    if (!GEMINI_KEY) {
        return res.send(`<h2>🔍 Diagnostic IA</h2>
            <p><b>Clé GEMINI_API_KEY : ABSENTE.</b></p>
            <p>Ajoute-la dans Render → Settings → Environment → GEMINI_API_KEY, puis redéploie.</p>`);
    }
    const rapports = [];
    for (const modele of GEMINI_MODELS) {
        try {
            const t0 = Date.now();
            const brut = await appelerGemini(modele, 'Tu réponds en une seule phrase courte.', 'Dis bonjour en une phrase.');
            rapports.push(`✅ <b>${escHtml(modele)}</b> — OK en ${Date.now() - t0} ms : « ${escHtml(brut.slice(0, 60))} »`);
        } catch (e) {
            rapports.push(`❌ <b>${escHtml(modele)}</b> — ${escHtml(e.message)}`);
        }
    }
    res.send(`<h2>🔍 Diagnostic IA</h2>
        <p>Clé : présente. Modèles testés dans l'ordre d'utilisation :</p>
        <ul>${rapports.map(r => `<li>${r}</li>`).join('')}</ul>
        <p>Si une ligne est en ❌, copie-la et colle-la moi.</p>`);
});

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 10000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🪶 Serveur Plume d'Étoile démarré sur le port ${PORT}`);
        if (!GEMINI_KEY) {
            console.warn('⚠️  PAS DE CLÉ GEMINI_API_KEY → ajoute-la dans Render → Environment');
        } else {
            console.log(`   Gemini : ${GEMINI_MODELS.join(' → ')}`);
        }
    });
}

module.exports = { app, poemeParIA, construireConsigne };

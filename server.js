const express = require('express');
const path = require('path');
const app = express();

app.set('trust proxy', 1);
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ============ CONFIGURATION ============
const GEMINI_KEY = process.env.GEMINI_API_KEY || null;
const liste = (valeur) => valeur.split(',').map(s => s.trim()).filter(Boolean);
const GEMINI_MODELS = liste(process.env.GEMINI_MODEL || 'gemini-2.5-flash,gemini-2.5-flash-lite');

const VERS_AUTORISES = [4, 8, 16, 24, 32];
const THEMES_AUTORISES = ['libre', 'amour', 'tristesse', 'nature', 'nuit', 'espoir'];

// ============ OUTILS ============
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

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
//  GÉNÉRATION PAR IA — le prompt est centré sur la DEMANDE
// ============================================================
const TONS = {
    amour: 'brûlant, sensuel, emporté, passionné',
    tristesse: 'déchirant, pudique, à voix basse',
    nature: 'émerveillé, sensuel, vivant',
    nuit: 'mystérieux, intime, velouté',
    espoir: 'fervent, défiant, lumineux',
    general: 'profond, méditatif, intensément humain'
};

const CLICHES = "cœur qui bat, océan de larmes, feu de l'amour, lumière au bout du tunnel, mon âme sœur, papillons dans le ventre, pour l'éternité, tu es mon soleil, après la pluie le beau temps";

const SYSTEME = `Tu es un poète français contemporain. Tu écris des poèmes qui touchent, qui font mal et du bien à la fois.

RÈGLE ABSOLUE : le poème doit être SUR le sujet demandé. Si la personne demande « un poème d'amour pour Juliette », tout le poème parle de Juliette et de l'amour pour elle. N'introduis JAMAIS des images ou des thèmes qui n'ont rien à voir avec la demande.

Tes principes :
1. MONTRER, NE PAS DIRE. L'émotion naît d'images concrètes et sensorielles, pas de mots abstraits.
2. LE SUJET DOMINE. Chaque vers doit parler du sujet demandé. Pas de digression, pas d'image décorative hors sujet.
3. DES RIMES SIMPLES ET JUSTES. Schéma régulier (ABAB ou AABB), pas d'inversion forcée.
4. UN RYTHME QUI RESPIRE. Vers de 10-12 syllabes, syntaxe naturelle.
5. UNE VOIX INTIME. À la première personne, avec « tu » si le poème s'adresse à quelqu'un.
6. ZÉRO CLICHÉ. Bannis : ${CLICHES}.
7. FRANÇAIS IMPECCABLE.

FORMAT : première ligne = un titre court (2 à 5 mots, grammaticalement correct). Ligne vide. Puis les vers en strophes de 4. Rien d'autre.`;

function construireConsigne(prompt, nombreVers, themeChoisi) {
    const ton = TONS[themeChoisi] || TONS.general;
    const nbStrophes = Math.ceil(nombreVers / 4);
    const nomTheme = themeChoisi === 'general' ? 'libre' : themeChoisi;

    const user = `Écris un poème en français.

SUJET (c'est LA demande, tout le poème doit en parler) :
« ${prompt} »

TON : ${ton}
LONGUEUR : exactement ${nombreVers} vers, en ${nbStrophes} strophe${nbStrophes > 1 ? 's' : ''} de 4 vers.

RAPPEL : si le sujet est une personne (un prénom, « Juliette », « ma mère »...), adresse-toi à elle avec « tu », invente des détails crédibles et touchants sur votre relation, et fais que CHAQUE vers parle d'elle ou de ce qu'elle te fait vivre. Le titre doit aussi être sur le sujet.`;

    return { system: SYSTEME, user };
}

// ---- Appel Gemini ----
async function appelerGemini(modele, system, user) {
    const generationConfig = {
        maxOutputTokens: 4096,
        temperature: 1.0,
        topP: 0.95
    };
    if (/2\.5/.test(modele)) generationConfig.thinkingConfig = { thinkingBudget: 0 };

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modele)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: 'user', parts: [{ text: user }] }],
            generationConfig
        }),
        signal: AbortSignal.timeout(30000)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`HTTP ${r.status} – ${j?.error?.message || 'réponse inattendue'}`);
    const parts = j?.candidates?.[0]?.content?.parts || [];
    return parts.filter(p => p.text && !p.thought).map(p => p.text).join('').trim();
}

// ---- Répare les titres du type « L'escalier Juliette » ----
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

// ---- Nettoyage de la réponse ----
function mettreEnForme(brut, nombreVers) {
    if (!brut) return null;

    const lignes = brut
        .replace(/\r/g, '')
        .replace(/```[a-z]*/gi, '')
        .replace(/[*_#]/g, '')
        .split('\n')
        .map(l => l.replace(/^[-•]\s+/, '').trim())
        .filter(l => l && !/^(voici|bien sûr|d'accord|poème\s*:|titre\s*:)/i.test(l));
    if (lignes.length < 2) return null;

    const premiere = lignes.shift();
    let titre = premiere
        .replace(/^["«“'‘\s]+|["»”'’\s]+$/g, '')
        .replace(/[.:;,]+$/, '')
        .trim();
    if (!titre || titre.length > 60) {
        lignes.unshift(premiere);
        titre = 'Sans titre';
    }

    const vers = lignes.slice(0, nombreVers);
    if (vers.length < Math.ceil(nombreVers * 0.6)) return null;

    const strophes = [];
    for (let i = 0; i < vers.length; i += 4) strophes.push(vers.slice(i, i + 4).join('\n'));
    return `${cap(corrigerTitre(titre))}\n\n${strophes.join('\n\n')}`;
}

async function poemeParIA(prompt, nombreVers, themeChoisi) {
    const { system, user } = construireConsigne(prompt, nombreVers, themeChoisi);

    for (const modele of GEMINI_MODELS) {
        try {
            const brut = await appelerGemini(modele, system, user);
            const poeme = mettreEnForme(brut, nombreVers);
            if (poeme) {
                console.log(`[IA] OK via ${modele} (${Date.now()}ms)`);
                return poeme;
            }
            console.warn(`[IA] ${modele} : réponse inexploitable`);
        } catch (e) {
            console.error(`[IA] ${modele} : ${e.message}`);
        }
    }
    return null;
}

// ============================================================
//  SECOURS ABSOLUMENT MINIMAL (dernier recours si l'IA plante)
//  Un simple message d'erreur honnête, pas un faux poème.
// ============================================================
function messageErreur() {
    return `Le poète est momentanément indisponible.\n\nVérifie ta connexion ou réessaie dans quelques instants.\nSi le problème persiste, vérifie la clé API Gemini dans les paramètres Render.`;
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
    let source = 'ia';

    if (GEMINI_KEY) {
        try {
            poeme = await poemeParIA(prompt, nombreVers, themeChoisi);
        } catch (e) {
            console.error('[IA] erreur :', e);
        }
    } else {
        console.warn('[IA] Pas de clé GEMINI_API_KEY !');
    }

    if (!poeme) {
        source = 'erreur';
        poeme = messageErreur();
    }

    console.log(`[poème] thème=${themeChoisi} vers=${nombreVers} source=${source}`);
    res.json({ poem: poeme, source });
});

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 10000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🪶 Serveur démarré sur le port ${PORT}`);
        if (!GEMINI_KEY) {
            console.warn('⚠️  PAS DE CLÉ GEMINI_API_KEY → rien ne marchera !');
            console.warn('    Ajoute-la dans Render → Environment → GEMINI_API_KEY');
        } else {
            console.log(`   Gemini : ${GEMINI_MODELS.join(' → ')}`);
        }
    });
}

module.exports = { app, poemeParIA, construireConsigne };

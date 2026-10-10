const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============ BASES THÉMATIQUES ============

const themes = {
    amour: {
        noms: ['cœur', 'âme', 'amour', 'désir', 'passion', 'tendresse', 'étreinte', 'baiser', 'regard', 'soupir', 'serment', 'murmure', 'promesse', 'flamme', 'souffle', 'câlin'],
        verbes: ['s\'embrase', 'tressaille', 's\'épanouit', 'palpite', 'frissonne', 'résonne', 's\'illumine', 's\'enflamme', 'chante', 'vibre', 's\'éveille', 'murmure', 'brûle', 's\'envole'],
        adjectifs: ['ardent', 'tendre', 'éternel', 'passionné', 'doux', 'sauvage', 'vibrant', 'brûlant', 'amoureux', 'enivrant', 'tremblant', 'radieux', 'enlacé', 'infini'],
        images: ['comme une flamme dans l\'obscurité', 'tel un baiser suspendu', 'à l\'image d\'un cœur qui bat', 'comme un matin de mai', 'tel un serment murmuré', 'comme une étoile filante dans la nuit'],
        ambiances: ['une passion ardente', 'une tendresse infinie', 'un désir profond', 'une étreinte brûlante', 'un amour qui renaît', 'une douceur inattendue']
    },
    tristesse: {
        noms: ['larmes', 'douleur', 'vide', 'absence', 'mélancolie', 'chagrin', 'silence', 'ombre', 'regret', 'solitude', 'adieu', 'cendres', 'oubli', 'sanglot', 'brume', 'soupir'],
        verbes: ['s\'effiloche', 's\'éteint', 's\'efface', 'pleure', 's\'endort', 's\'éloigne', 'se fane', 's\'écoule', 'gémit', 's\'évanouit', 'se perd', 'tremble', 'se brise'],
        adjectifs: ['amer', 'sombre', 'silencieux', 'glacé', 'déchiré', 'mélancolique', 'lointain', 'brisé', 'cendré', 'éteint', 'solitaire', 'perdu', 'abandonné'],
        images: ['comme une pluie d\'automne', 'tel un écho qui s\'éteint', 'à l\'image d\'une flamme qui meurt', 'comme un souvenir qui s\'efface', 'tel un matin sans lumière', 'comme un bateau sans rivage'],
        ambiances: ['une peine silencieuse', 'un regret lancinant', 'une solitude glacée', 'un deuil sans fin', 'une mélancolie profonde', 'une absence qui pèse']
    },
    nature: {
        noms: ['forêt', 'océan', 'montagne', 'fleur', 'arbre', 'rivière', 'ciel', 'soleil', 'lune', 'étoile', 'vent', 'aurore', 'cascade', 'vallon', 'rocher', 'source'],
        verbes: ['danse', 'chante', 'murmure', 's\'éveille', 'coule', 'frémit', 's\'étire', 'resplendit', 'ondule', 's\'élance', 'bourdonne', 's\'étend', 'palpite'],
        adjectifs: ['sauvage', 'serein', 'éternel', 'lumineux', 'vivant', 'verdoyant', 'argenté', 'paisible', 'majestueux', 'vibrant', 'immuable', 'éclatant'],
        images: ['comme une rivière au printemps', 'tel un arbre centenaire', 'à l\'image d\'un ciel sans nuage', 'comme une fleur qui s\'ouvre', 'tel un vent dans les blés', 'comme un lac au petit matin'],
        ambiances: ['une paix immense', 'une force tranquille', 'une liberté sauvage', 'une harmonie parfaite', 'une douceur printanière', 'un éternel renouveau']
    },
    nuit: {
        noms: ['nuit', 'étoiles', 'lune', 'ombre', 'silence', 'rêve', 'insomnie', 'ténèbres', 'clair de lune', 'minuit', 'velours', 'songe', 'mystère', 'lanterne', 'voile'],
        verbes: ['s\'étend', 'veille', 'glisse', 'scintille', 'murmure', 'flotte', 's\'étire', 'se déploie', 'danse', 'chuchote', 's\'allonge', 'se tait', 'luit'],
        adjectifs: ['silencieux', 'mystérieux', 'profond', 'sombre', 'étoilé', 'argenté', 'paisible', 'enveloppant', 'lumineux', 'secret', 'ténébreux', 'velouté'],
        images: ['comme un manteau d\'étoiles', 'tel un rêve qui s\'effiloche', 'à l\'image d\'une lune pâle', 'comme un voile sur le monde', 'tel un feu dans l\'ombre', 'comme un secret murmuré'],
        ambiances: ['un silence infini', 'une étrangeté apaisante', 'un mystère doux', 'une paix nocturne', 'une beauté secrète', 'une rêverie profonde']
    },
    espoir: {
        noms: ['lumière', 'espoir', 'demain', 'renaissance', 'aube', 'courage', 'force', 'avenir', 'flamme', 'promesse', 'soleil', 'germe', 'élan', 'étincelle'],
        verbes: ['renaît', 's\'illumine', 'se lève', 'brille', 'grandit', 's\'élance', 'palpite', 'triomphe', 's\'éveille', 'jaillit', 'resplendit', 'éclôt', 'vibre'],
        adjectifs: ['lumineux', 'radieux', 'invincible', 'éclatant', 'nouveau', 'brillant', 'prometteur', 'triomphant', 'renaissant', 'pur', 'vibrant'],
        images: ['comme une aube après la nuit', 'tel un soleil qui perce les nuages', 'à l\'image d\'une graine qui germe', 'comme une flamme qui renaît', 'tel un printemps attendu', 'comme un chemin qui s\'ouvre'],
        ambiances: ['une foi tenace', 'un renouveau vibrant', 'une victoire silencieuse', 'une aube nouvelle', 'une force tranquille', 'une promesse tenue']
    },
    general: {
        noms: ['vie', 'temps', 'âme', 'cœur', 'rêve', 'monde', 'instant', 'mémoire', 'destin', 'vérité', 'chemin', 'horizon', 'souvenir', 'écho', 'voyage', 'pensée'],
        verbes: ['passe', 's\'écoule', 'danse', 'murmure', 'résonne', 's\'effiloche', 'palpite', 's\'élance', 'chemine', 'frémit', 's\'épanouit', 'glisse', 'tressaille'],
        adjectifs: ['indifférent', 'souverain', 'profond', 'éphémère', 'vaste', 'fragile', 'ancien', 'lointain', 'éternel', 'mystérieux', 'paisible', 'vibrant'],
        images: ['comme une feuille au vent', 'tel un mot oublié', 'à l\'image d\'un chemin sans fin', 'comme une ombre qui s\'allonge', 'tel un souvenir lointain', 'comme un écho dans la vallée'],
        ambiances: ['une sagesse tranquille', 'une mélancolie douce', 'une force silencieuse', 'une paix profonde', 'un élan nouveau', 'une vérité nue']
    }
};

// ============ PATRONS DE VERS RIMÉS ============

const patronsGeneraux = [
    ["Quand {N} {V}, lent et {A},", "La lumière s'installe et prend tout son pouvoir."],
    ["Un {N} {V}, sans peur ni douleur,", "Et dans le silence, renaît la douceur."],
    ["Là où {N} {V}, {A} et {A},", "Une paix ancienne s'installe, éclatante."],
    ["Le {N} qui {V} semble s'éterniser,", "Comme un secret que l'on n'ose dévoiler."],
    ["Et soudain {N} {V}, {I},", "Dans le silence, une nouvelle vie."],
    ["Je revois ce {N} qui {V} sans jamais,", "Laisser le temps effacer ses attraits."],
    ["Un {N} {V}, {A}, dans la pénombre pure,", "{I}, à la fois fragile et sûre."],
    ["Dans le matin qui {V}, {A} et serein,", "{I}, comme un lointain refrain."],
    ["Lorsque {N} {V} au creux du paysage,", "{I}, un souvenir qui prend de l'âge."],
    ["Voir {N} {V}, doucement s'effacer,", "Et dans ce geste, tout recommencer."],
    ["Un {N} {A} traverse l'espace,", "Et dans le vent, une nouvelle trace."],
    ["Quand le {N} {V}, tout semble s'arrêter,", "Comme si le monde voulait s'écouter."],
    ["{A} et {A}, le {N} {V},", "Et dans cet instant, le temps se fige."],
    ["Le {N} {V}, {I},", "Laissant derrière lui un parfum d'été."],
    ["Un {N} {A} se dresse devant moi,", "Et dans ses yeux, je retrouve ma foi."],
];

const patronsAvecPrenom = [
    ["{KC} {V} au cœur de la nuit,", "Et dans ce souffle, tout s'épanouit."],
    ["Je garde en moi l'image de {KC},", "{I}, à l'infini, à jamais."],
    ["Quand {KC} {V}, le monde se tait,", "{I}, dans un silence parfait."],
    ["Ô {KC}, ton nom que rien n'efface,", "{I}, dans l'éternité de l'espace."],
    ["{KC} {V}, et je me souviens,", "De tous ces jours qui redeviennent miens."],
    ["Pour {KC}, les mots n'ont plus de loi,", "{I}, à l'abri de tout émoi."],
    ["Dans mes pensées, {KC} {V} encore,", "{I}, comme un trésor que l'on adore."],
    ["Si {KC} {V}, alors le temps se brise,", "Et dans l'instant, tout se précise."],
    ["{KC}, ton {N} {A} m'enveloppe,", "Comme un songe doux qui jamais ne s'échappe."],
    ["À l'écoute de {KC}, mon âme s'apaise,", "Et dans ce calme, la lumière se plaît."],
];

const patronsLibres = [
    ["Parfois, un souffle {A} s'élève,", "Et tout ce qui pèse, soudain, s'achève."],
    ["Dans l'ombre, une voix {A} résonne,", "Et rien, jamais, ne sera plus comme avant."],
    ["Un instant fragile, un regard {A},", "Et le monde, lentement, se déploie."],
    ["L'air se fait {A}, le silence s'étire,", "Comme un rêve qui refuse de finir."],
    ["Un écho {A} traverse l'espace,", "Et dans le vent, une nouvelle trace."],
    ["Le monde entier retient son souffle un instant,", "Puis reprend sa course, doucement."],
    ["Entre deux silences, une voix s'élève,", "Et dessine, invisible, un nouveau rêve."],
];

// ============ UTILITAIRES ============

function melanger(arr) {
    const c = [...arr];
    for (let i = c.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function extraireMotsCles(prompt) {
    const stop = new Set(['pour','avec','dans','sur','sous','entre','vers','chez','par','de','du','des','le','la','les','un','une','ce','cette','ces','mon','ma','mes','ton','ta','tes','son','sa','ses','notre','votre','leur','qui','que','quoi','dont','où','quand','comment','pourquoi','si','mais','ou','et','donc','or','ni','car','je','tu','il','elle','nous','vous','ils','elles','suis','es','est','sommes','êtes','sont','ai','as','a','avons','avez','ont','fait','faire','dit','dire','veux','vouloir','peux','pouvoir','dois','devoir','vais','aller']);
    const tokens = prompt.replace(/[.,!?;:'"()]/g, ' ').split(/\s+/).filter(m => m.length > 2);
    return tokens.filter(m => !stop.has(m.toLowerCase()));
}

function remplir(patron, t, kcRotation) {
    let v = patron;
    if (v.includes('{KC}') && kcRotation.length > 0) {
        v = v.replace('{KC}', kcRotation.next());
    } else if (v.includes('{KC}')) {
        v = v.replace('{KC}', pick(t.noms));
    }
    v = v.replace(/\{N\}/g, () => pick(t.noms));
    v = v.replace(/\{V\}/g, () => pick(t.verbes));
    v = v.replace(/\{A\}/g, () => pick(t.adjectifs));
    v = v.replace(/\{I\}/g, () => pick(t.images));
    v = v.replace(/\{B\}/g, () => pick(t.ambiances));
    v = v.charAt(0).toUpperCase() + v.slice(1);
    return v;
}

function createurRotation(motsCles) {
    let i = 0;
    return {
        next: () => motsCles.length > 0 ? motsCles[i++ % motsCles.length] : null
    };
}

// ============ GÉNÉRATION DU POÈME ============

function genererPoeme(prompt, nombreVers, themeChoisi) {
    const motsCles = extraireMotsCles(prompt);
    const t = themes[themeChoisi] || themes.general;
    const rotation = createurRotation(motsCles);

    const pool = melanger([...patronsGeneraux, ...patronsLibres]);

    const vers = [];
    let poolIndex = 0;
    let dernierAvecPrenom = -2;

    while (vers.length < nombreVers) {
        let patron;

        if (motsCles.length > 0 && Math.random() < 0.35 && (vers.length / 4 - dernierAvecPrenom) >= 2) {
            patron = pick(patronsAvecPrenom);
            dernierAvecPrenom = vers.length / 4;
        } else if (Math.random() < 0.25) {
            patron = pick(patronsLibres);
        } else {
            patron = pool[poolIndex++ % pool.length];
        }

        const couplet = patron.map(ligne => remplir(ligne, t, rotation));
        vers.push(couplet[0], couplet[1]);
    }

    const strophes = [];
    for (let i = 0; i < nombreVers; i += 4) {
        strophes.push(vers.slice(i, i + 4).join('\n'));
    }

    const titre = prompt.trim().charAt(0).toUpperCase() + prompt.trim().slice(1);
    return `${titre}\n\n${strophes.join('\n\n')}`;
}

// ============ ROUTE API ============

app.post('/generate-poem', async (req, res) => {
    const { prompt, lines, theme } = req.body;

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: "Le prompt est vide." });
    }

    const nombreVers = parseInt(lines) || 16;
    const themeChoisi = theme === 'libre' ? 'general' : theme;
    const poeme = genererPoeme(prompt, nombreVers, themeChoisi);

    setTimeout(() => {
        res.json({ poem: poeme });
    }, 800 + Math.random() * 800);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🪶 Serveur Plume d'Étoile démarré sur le port ${PORT}`);
});

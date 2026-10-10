const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============ BANQUES THÉMATIQUES ============

const themes = {
    amour: {
        noms: ['cœur', 'âme', 'amour', 'désir', 'passion', 'tendresse', 'étreinte', 'baiser', 'regard', 'soupir', 'serment', 'murmure', 'promesse', 'flamme', 'souffle'],
        verbes: ['s\'embrase', 'tressaille', 's\'épanouit', 'palpite', 'frissonne', 'résonne', 's\'illumine', 's\'enflamme', 'chante', 'vibre', 's\'éveille', 'murmure', 'brûle'],
        adjectifs: ['ardent', 'tendre', 'éternel', 'passionné', 'doux', 'sauvage', 'vibrant', 'brûlant', 'amoureux', 'enivrant', 'tremblant', 'radieux', 'infini'],
        images: ['comme une flamme dans l\'obscurité', 'tel un baiser suspendu', 'à l\'image d\'un cœur qui bat', 'comme un matin de mai', 'tel un serment murmuré'],
        ambiances: ['une passion ardente', 'une tendresse infinie', 'un désir profond', 'une étreinte brûlante', 'une douceur inattendue']
    },
    tristesse: {
        noms: ['larmes', 'douleur', 'vide', 'absence', 'mélancolie', 'chagrin', 'silence', 'ombre', 'regret', 'solitude', 'adieu', 'cendres', 'oubli', 'sanglot', 'brume'],
        verbes: ['s\'effiloche', 's\'éteint', 's\'efface', 'pleure', 's\'endort', 's\'éloigne', 'se fane', 's\'écoule', 'gémit', 's\'évanouit', 'se perd', 'tremble', 'se brise'],
        adjectifs: ['amer', 'sombre', 'silencieux', 'glacé', 'déchiré', 'mélancolique', 'lointain', 'brisé', 'cendré', 'éteint', 'solitaire', 'perdu'],
        images: ['comme une pluie d\'automne', 'tel un écho qui s\'éteint', 'à l\'image d\'une flamme qui meurt', 'comme un souvenir qui s\'efface', 'tel un matin sans lumière'],
        ambiances: ['une peine silencieuse', 'un regret lancinant', 'une solitude glacée', 'une mélancolie profonde', 'une absence qui pèse']
    },
    nature: {
        noms: ['forêt', 'océan', 'montagne', 'fleur', 'arbre', 'rivière', 'ciel', 'soleil', 'lune', 'étoile', 'vent', 'aurore', 'cascade', 'vallon', 'source'],
        verbes: ['danse', 'chante', 'murmure', 's\'éveille', 'coule', 'frémit', 's\'étire', 'resplendit', 'ondule', 's\'élance', 's\'étend', 'palpite'],
        adjectifs: ['sauvage', 'serein', 'éternel', 'lumineux', 'vivant', 'verdoyant', 'argenté', 'paisible', 'majestueux', 'vibrant', 'immuable'],
        images: ['comme une rivière au printemps', 'tel un arbre centenaire', 'à l\'image d\'un ciel sans nuage', 'comme une fleur qui s\'ouvre', 'tel un vent dans les blés'],
        ambiances: ['une paix immense', 'une force tranquille', 'une liberté sauvage', 'une harmonie parfaite', 'un éternel renouveau']
    },
    nuit: {
        noms: ['nuit', 'étoiles', 'lune', 'ombre', 'silence', 'rêve', 'insomnie', 'ténèbres', 'minuit', 'velours', 'songe', 'mystère', 'lanterne', 'voile'],
        verbes: ['s\'étend', 'veille', 'glisse', 'scintille', 'murmure', 'flotte', 's\'étire', 'se déploie', 'danse', 'chuchote', 'se tait', 'luit'],
        adjectifs: ['silencieux', 'mystérieux', 'profond', 'sombre', 'étoilé', 'argenté', 'paisible', 'enveloppant', 'secret', 'ténébreux', 'velouté'],
        images: ['comme un manteau d\'étoiles', 'tel un rêve qui s\'effiloche', 'à l\'image d\'une lune pâle', 'comme un voile sur le monde', 'tel un feu dans l\'ombre'],
        ambiances: ['un silence infini', 'un mystère doux', 'une paix nocturne', 'une beauté secrète', 'une rêverie profonde']
    },
    espoir: {
        noms: ['lumière', 'espoir', 'demain', 'renaissance', 'aube', 'courage', 'force', 'avenir', 'flamme', 'promesse', 'soleil', 'germe', 'élan', 'étincelle'],
        verbes: ['renaît', 's\'illumine', 'se lève', 'brille', 'grandit', 's\'élance', 'palpite', 'triomphe', 's\'éveille', 'jaillit', 'resplendit', 'éclôt'],
        adjectifs: ['lumineux', 'radieux', 'invincible', 'éclatant', 'nouveau', 'brillant', 'prometteur', 'triomphant', 'renaissant', 'pur', 'vibrant'],
        images: ['comme une aube après la nuit', 'tel un soleil qui perce les nuages', 'à l\'image d\'une graine qui germe', 'comme une flamme qui renaît', 'tel un printemps attendu'],
        ambiances: ['une foi tenace', 'un renouveau vibrant', 'une aube nouvelle', 'une force tranquille', 'une promesse tenue']
    },
    general: {
        noms: ['vie', 'temps', 'âme', 'cœur', 'rêve', 'monde', 'instant', 'mémoire', 'destin', 'vérité', 'chemin', 'horizon', 'souvenir', 'écho', 'pensée'],
        verbes: ['passe', 's\'écoule', 'danse', 'murmure', 'résonne', 's\'effiloche', 'palpite', 's\'élance', 'chemine', 'frémit', 's\'épanouit', 'glisse'],
        adjectifs: ['indifférent', 'souverain', 'profond', 'éphémère', 'vaste', 'fragile', 'ancien', 'lointain', 'éternel', 'mystérieux', 'paisible'],
        images: ['comme une feuille au vent', 'tel un mot oublié', 'à l\'image d\'un chemin sans fin', 'comme une ombre qui s\'allonge', 'tel un souvenir lointain'],
        ambiances: ['une sagesse tranquille', 'une mélancolie douce', 'une force silencieuse', 'une paix profonde', 'une vérité nue']
    }
};

// ============ COUPLETS PROFONDS (rimes AA garanties) ============

const mouvements = {
    ouverture: [
        ["Une lumière {A} traverse le matin,", "Et réveille en secret ce qui dormait en vain."],
        ["Le vent se lève {A} au bord du premier toit,", "Et le monde, doucement, se souvient de moi."],
        ["La pluie écrit {A} sur les vitres du soir,", "Des mots que seul comprend celui qui sait ne rien savoir."],
        ["Un oiseau {A} traverse le ciel vide,", "Et trace dans le bleu une blessure limpide."],
        ["Le jour décline {A}, l'ombre s'agrandit,", "Et le cœur entend mieux ce que l'ombre lui dit."],
        ["Une fenêtre {A} s'allume au loin dans la ville,", "Comme une âme qui veille, obstinée et tranquille."]
    ],
    interieur: [
        ["Je porte en moi des pays que nul n'a traversés,", "Des villes de silence aux portes condamnées."],
        ["Ma mémoire est une maison sans portes ni repos,", "Où dorment des visages que le temps n'efface pas."],
        ["Il reste au fond de moi une chambre secrète,", "Où brûle encore un {N} que personne n'arrête."],
        ["Mes souvenirs ne sont pas des images, mais des poids,", "Des pierres {A} que je porte sans savoir pourquoi."],
        ["Je me souviens de mains que je n'ai pas serrées,", "De mots restés debout au bord de ma pensée."],
        ["En moi, quelque chose de {A} refuse de mourir,", "Une braise, un souffle, un presque-souvenir."],
        ["En moi, {B} est entrée sans frapper,", "Et elle a fait de mon silence sa maison, son été."]
    ],
    question: [
        ["Qu'est-ce que vivre, sinon attendre sans comprendre,", "Et tendre vers demain des mains qui savent attendre ?"],
        ["Pourquoi faut-il que toute lumière ait son ombre,", "Et que le cœur le plus {A} tienne dans un lieu si sombre ?"],
        ["Sommes-nous les passants, ou bien sommes-nous la route,", "Le rêve qui s'efface, ou la main qui l'écoute ?"],
        ["Ce que nous appelons mourir n'est peut-être que naître", "À une autre lumière, par une autre fenêtre."],
        ["Le temps ne prend rien : il nous rend à nous-mêmes,", "Délestés du superflu, nus comme des poèmes."],
        ["Et si c'était dans le vide que tout se remplit,", "Dans l'absence que l'amour trouve son vrai pays ?"]
    ],
    chute: [
        ["Alors je cesse de craindre : rien de ce qui fut ne meurt,", "Ce qui est aimé demeure, plus fort que l'heure."],
        ["Et s'il ne reste qu'une chose à emporter au bout du chemin,", "Ce sera cette lumière {A} qu'on a offerte un matin."],
        ["Car la vie n'est pas un bien qu'on garde, c'est un don qu'on fait,", "Et ce n'est qu'en le donnant qu'on apprend ce qu'on est."],
        ["Ce qui profondément se creuse devient passage,", "Et l'âme la plus {A} est la plus belle des pages."],
        ["Ainsi, même au creux de la nuit, une clarté demeure :", "L'amour donné, l'amour reçu — la seule chose qui ne meurt."],
        ["Et quand viendra le soir, je n'aurai qu'un vœu, qu'une envie :", "Avoir aimé assez pour que ça dure toute une vie."]
    ]
};

// ============ COUPLETS AVEC LE SUJET, CLASSÉS PAR TON ============

const prenom = {
    amour: [
        ["{KC}, tu es la lumière qui ne demande rien,", "Et qui pourtant éclaire tout ce que je deviens."],
        ["Il y a {KC} dans chacun de mes matins,", "Une présence {A} au creux de mes chemins."],
        ["Quand {KC} sourit, le monde se souvient d'être beau,", "Et moi, je me souviens pourquoi battent mes mots."],
        ["{KC}, ton rire est une porte ouverte sur l'été,", "Une fenêtre {A} que rien ne peut fermer."]
    ],
    tristesse: [
        ["Il arrive que {KC} ne soit plus qu'une voix dans le vent,", "Mais même le vent laisse une ride sur l'étang."],
        ["Je cherche {KC} partout où le silence habite,", "Et ne trouve que mon cœur qui récite."],
        ["Depuis {KC}, les jours ont appris à se taire,", "Et mon cœur garde la chaise vide, comme une prière."]
    ],
    neutre: [
        ["{KC}, ton nom est une chambre où le temps se repose,", "Une lampe {A} qui veille au cœur de toutes mes choses."],
        ["Si je devais définir {KC}, je parlerais d'aurore,", "De ce qui vient avant le jour, et qui le fait éclore encore."],
        ["Ce que {KC} a ouvert en moi ne connaîtra plus l'hiver :", "C'est une porte vers le jour, une fenêtre ouverte sur la mer."],
        ["Dire {KC}, c'est allumer une veilleuse en pleine nuit,", "Et savoir que, désormais, l'ombre conduit."]
    ]
};

function poolPrenom(themeChoisi) {
    if (themeChoisi === 'amour') return [...prenom.amour, ...prenom.neutre];
    if (themeChoisi === 'tristesse') return [...prenom.tristesse, ...prenom.neutre];
    return [...prenom.neutre, ...prenom.amour];
}

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

function remplir(patron, t, rotation, motsCles) {
    let v = patron;
    if (v.includes('{KC}')) {
        const mot = motsCles.length > 0 ? rotation.next() : pick(t.noms);
        v = v.replace('{KC}', mot);
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
    return { next: () => motsCles[i++ % motsCles.length] };
}

// ============ GÉNÉRATION ============

function genererPoeme(prompt, nombreVers, themeChoisi) {
    const motsCles = extraireMotsCles(prompt);
    const t = themes[themeChoisi] || themes.general;
    const rotation = createurRotation(motsCles);

    const pools = {};
    for (const k in mouvements) pools[k] = melanger(mouvements[k]);
    pools.prenom = melanger(poolPrenom(themeChoisi));

    const draw = (k) => {
        if (pools[k].length === 0) {
            pools[k] = melanger(k === 'prenom' ? poolPrenom(themeChoisi) : mouvements[k]);
        }
        return pools[k].pop();
    };
    const rand = (...opts) => opts[Math.floor(Math.random() * opts.length)];

    const nbStrophes = Math.ceil(nombreVers / 4);
    const vers = [];
    let dernierPre = -2;
    const peutPrenom = (s) => motsCles.length > 0 && (s - dernierPre) >= 2;

    for (let s = 0; s < nbStrophes; s++) {
        let plan;

        if (nbStrophes === 1) {
            // Poème très court : adresse au sujet (ou image) + chute
            plan = [peutPrenom(s) && Math.random() < 0.85 ? 'prenom' : 'ouverture', 'chute'];
        } else if (s === 0) {
            plan = [peutPrenom(s) && Math.random() < 0.6 ? 'prenom' : 'ouverture', rand('interieur', 'question')];
        } else if (s === nbStrophes - 1) {
            plan = [peutPrenom(s) && Math.random() < 0.35 ? 'prenom' : rand('interieur', 'question'), 'chute'];
        } else {
            plan = [rand('interieur', 'question'), rand('interieur', 'question', 'ouverture')];
            if (peutPrenom(s) && Math.random() < 0.4) plan[0] = 'prenom';
        }

        for (const nom of plan) {
            if (nom === 'prenom') dernierPre = s;
            const couplet = draw(nom).map(l => remplir(l, t, rotation, motsCles));
            vers.push(couplet[0], couplet[1]);
        }
    }

    const strophes = [];
    for (let i = 0; i < vers.length; i += 4) {
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

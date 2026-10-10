const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const GROQ_KEY = process.env.GROQ_API_KEY || null;
const GEMINI_KEY = process.env.GEMINI_API_KEY || null;

// ============ TONS DEMANDÉS À L'IA SELON LE THÈME ============
const TONS = {
    amour: 'ardent, sensuel, dévoué, incandescent',
    tristesse: 'déchirant, pudique, hanté, à voix basse',
    nature: 'émerveillé, sensuel, panthéiste',
    nuit: 'mystérieux, intime, velouté',
    espoir: 'fervent, défiant, lumineux',
    general: 'profond, méditatif, intensément humain'
};

// ============ GÉNÉRATION PAR IA (poèmes toujours inédits) ============
async function poemeParIA(prompt, nombreVers, themeChoisi) {
    const ton = TONS[themeChoisi] || TONS.general;
    const consigne =
`Écris un poème ENTIÈREMENT ORIGINAL en français, que personne n'a jamais écrit avant.
Sujet / demande de l'utilisateur : "${prompt}"
Thème émotionnel : ${themeChoisi}. Ton exigé : ${ton}.
Règles strictes :
- 1re ligne : le titre (le sujet tel qu'écrit par l'utilisateur). Puis une ligne vide.
- Exactement ${nombreVers} vers, en strophes de 4 vers séparées par une ligne vide.
- Rimes riches et régulières (schéma AABB ou ABAB), mètres proches.
- Images neuves, vocabulaire concret et sensoriel ; INTERDICTION des clichés, des banalités et de toute formule toute faite.
- Si le sujet est un prénom ou une personne, adresse-lui directement plusieurs vers, avec passion.
- Chaque vers doit porter une émotion vraie, pas une description plate.
- N'écris RIEN d'autre que le poème : ni introduction, ni explication, ni guillemets.`;

    const SYS = 'Tu es un grand poète français, maître de la rime et de l\'émotion. Tu ne produis que des textes originaux, jamais de reprises.';

    if (GROQ_KEY) {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                temperature: 1.15,
                max_tokens: 1400,
                messages: [ { role: 'system', content: SYS }, { role: 'user', content: consigne } ]
            })
        });
        const j = await r.json();
        const txt = j?.choices?.[0]?.message?.content?.trim();
        if (txt) return txt;
    }

    if (GEMINI_KEY) {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: SYS + '\n\n' + consigne }] }],
                generationConfig: { temperature: 1.05, maxOutputTokens: 1400 }
            })
        });
        const j = await r.json();
        const txt = j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (txt) return txt;
    }

    return null;
}

// ============ MOTEUR LOCAL (repli si pas de clé IA) ============

const ADJ = [
    { m: 'ardent', f: 'ardente' }, { m: 'brûlant', f: 'brûlante' }, { m: 'tendre', f: 'tendre' },
    { m: 'profond', f: 'profonde' }, { m: 'éternel', f: 'éternelle' }, { m: 'sauvage', f: 'sauvage' },
    { m: 'lumineux', f: 'lumineuse' }, { m: 'sombre', f: 'sombre' }, { m: 'fragile', f: 'fragile' },
    { m: 'vibrant', f: 'vibrante' }, { m: 'infini', f: 'infinie' }, { m: 'secret', f: 'secrète' },
    { m: 'ivre', f: 'ivre' }, { m: 'fidèle', f: 'fidèle' }, { m: 'immense', f: 'immense' },
    { m: 'farouche', f: 'farouche' }
];

const themes = {
    amour: {
        noms: [['cœur','m'],['âme','f'],['amour','m'],['désir','m'],['souffle','m'],['baiser','m'],['regard','m'],['soupir','m'],['serment','m'],['murmure','m'],['flamme','f'],['étreinte','f'],['passion','f'],['tendresse','f'],['promesse','f'],['fièvre','f']],
        verbes: ['s\'embrase','tressaille','palpite','frissonne','brûle','chante','vibre','s\'illumine','murmure','s\'envole','résonne','s\'éveille']
    },
    tristesse: {
        noms: [['chagrin','m'],['silence','m'],['vide','m'],['regret','m'],['sanglot','m'],['soupir','m'],['adieu','m'],['brume','f'],['ombre','f'],['absence','f'],['douleur','f'],['larme','f'],['mélancolie','f'],['solitude','f'],['nostalgie','f']],
        verbes: ['s\'efface','pleure','tremble','se brise','s\'endort','s\'écoule','gémit','chancelle','s\'éteint','erre']
    },
    nature: {
        noms: [['vent','m'],['soleil','m'],['fleuve','m'],['chemin','m'],['orage','m'],['silence','m'],['forêt','f'],['mer','f'],['montagne','f'],['fleur','f'],['aurore','f'],['source','f'],['clairière','f'],['sève','f']],
        verbes: ['frémit','chante','danse','murmure','s\'éveille','coule','brille','respire','s\'étire','palpite']
    },
    nuit: {
        noms: [['silence','m'],['songe','m'],['mystère','m'],['vertige','m'],['fantôme','m'],['lune','f'],['ombre','f'],['étoile','f'],['lanterne','f'],['insomnie','f'],['veille','f'],['brume','f']],
        verbes: ['veille','glisse','scintille','murmure','flotte','chuchote','luit','s\'étire','danse','se tait']
    },
    espoir: {
        noms: [['élan','m'],['courage','m'],['matin','m'],['soleil','m'],['germe','m'],['flambeau','m'],['aube','f'],['lumière','f'],['flamme','f'],['promesse','f'],['force','f'],['victoire','f'],['renaissance','f']],
        verbes: ['se lève','grandit','brille','palpite','jaillit','avance','résiste','s\'enflamme','triomphe','renaît']
    },
    general: {
        noms: [['temps','m'],['chemin','m'],['horizon','m'],['souvenir','m'],['écho','m'],['voyage','m'],['âme','f'],['mémoire','f'],['pensée','f'],['lumière','f'],['absence','f'],['destinée','f']],
        verbes: ['passe','danse','murmure','résonne','palpite','chemine','frémit','glisse','s\'épanouit','tressaille']
    }
};

const bank = {
    amour: {
        ouv: [
            ["Mon {NM} {V} dès que paraît ta lumière,", "Et tout ce que je suis se change en prière."],
            ["Dès l'aube, mon {NM} {V} devant ta porte close,", "Comme un oiseau {A:m} qui chante sur la rose."],
            ["Ta voix entre dans la pièce et le jour change de goût,", "Mon {NM} {V} : c'est de l'eau, c'est du feu, c'est tout."]
        ],
        coe: [
            ["Tes yeux sont le pays où mon {NM} veut vivre,", "Le seul livre {A:m} que mon âme veuille lire."],
            ["Je voudrais être l'air qui touche ta peau nue,", "La lumière {A:f} dont ta bouche est venue."],
            ["Il n'existe pas de mot, pas de langue, pas de vers,", "Assez {A:m} pour chanter ce que tu m'ouvres en hiver."]
        ],
        fin: [
            ["Aime-moi jusqu'au bout des nuits et des enfers,", "Mon {NM} est à toi : c'est là mon univers."],
            ["Que le monde s'écroule : je garderai ta main,", "Et mon {NM} {V} debout jusqu'au dernier matin."],
            ["Et si un jour le feu lui-même doit s'éteindre,", "Mon {NM} {V} encore, pour nous deux, sans se plaindre."]
        ],
        kc: [
            ["Quand {KC} me touche, le ciel entier tremble,", "Et mon sang reconnaît ce qui nous rassemble."],
            ["{KC}, ton nom est une chambre où le temps se repose,", "Une lampe {A:f} qui veille au cœur de toutes mes choses."],
            ["Ô {KC}, je brûle d'un feu que rien n'apaise,", "Un incendie {A:m} qui chante dans la braise."]
        ]
    },
    tristesse: {
        ouv: [
            ["Je parle à ton absence et c'est le vent qui répond,", "Mon {NM} {V} tout bas dans la maison sans ton nom."],
            ["Il pleut sur mes souvenirs comme il pleut sur ma vie,", "Et chaque goutte sait ton nom, et chaque goutte l'oublie."]
        ],
        coe: [
            ["Les jours sont des couloirs où ta voix ne vient plus,", "Et j'y traîne mon {NM}, pieds nus, dans l'inconnu."],
            ["Je souris par habitude, et le monde y croit encore,", "Mais mon {NM} est une chambre où manque ton corps."],
            ["Je refais nos chemins à rebours, dans ma tête,", "Et chaque pas perdu devient une fête."]
        ],
        fin: [
            ["Le temps, disent-ils, console ; le temps ne sait rien,", "Rien à mon {NM} {A:m} qui t'appartient."],
            ["Un jour, dit-on, je rirai ; peut-être ; mais pas ce soir :", "Ce soir mon {NM} garde ta chaise, et c'est tout mon espoir."],
            ["Et même si la vie reprend son vieux courant,", "Il manquera toujours ton pas à mon présent."]
        ],
        kc: [
            ["Depuis {KC}, les jours ont appris à se taire,", "Et mon cœur garde la chaise vide, comme une prière."],
            ["{KC}, ton nom est une chambre où le temps se repose,", "Une lampe {A:f} qui veille au cœur de toutes mes choses."],
            ["Ô {KC}, pourquoi les morts gardent-ils nos promesses ?", "Mon {NM} {V} seul devant tant de tendresse."]
        ]
    },
    nature: {
        ouv: [
            ["Dès l'aube, la terre offre son {NM} au vent,", "Et je sens battre en moi ce frisson {A:m} du vivant."],
            ["Le vent dans les blés dit des mots que je connais,", "Mon {NM} {V} : c'est sa langue, c'est son secret."],
            ["Chaque fleur est une bouche ouverte sur le matin,", "Et mon {NM} {V} avec elle, ivre de rien."]
        ],
        coe: [
            ["La forêt garde un {NM} que nul n'entend,", "J'y couche mon âme, nue, comme un enfant."],
            ["Ô rivière, emporte mon {NM} vers la mer,", "Je veux voir ce que l'eau fait de nos hivers."],
            ["La montagne me regarde avec ses yeux de roche,", "Et mon {NM}, {A:m}, soudain s'approche."]
        ],
        fin: [
            ["Et je comprends enfin, couché dans l'herbe du soir,", "Que la terre me garde : c'est assez d'y croire."],
            ["Tout ce qui pousse ici me connaît sans m'attendre,", "Et mon {NM} {V}, enfin compris, enfin tendre."]
        ],
        kc: [
            ["Si je devais définir {KC}, je parlerais d'aurore,", "De ce qui vient avant le jour, et qui le fait éclore encore."],
            ["Quand {KC} paraît, le monde retient son souffle un instant,", "Puis reprend sa course, mais plus beau qu'avant."]
        ]
    },
    nuit: {
        ouv: [
            ["La nuit pose sur moi ses grandes mains de velours,", "Et mon {NM} {V}, lourd de tant d'amour."],
            ["Chaque étoile est une {NF} piquée dans le noir,", "Et mon {NM} {V} doucement, plein d'espoir."],
            ["Minuit : le ciel descend dormir contre les toits,", "Et mon {NM} {V} avec la lune en moi."]
        ],
        coe: [
            ["Le silence garde un {NM} que le jour ne connaît pas,", "Viens y dormir, mon âme : il fait doux entre ses bras."],
            ["L'ombre n'est pas un mur : c'est une porte, vois,", "Mon {NM} {V} à travers, pour la première fois."]
        ],
        fin: [
            ["Au fond de chaque nuit, une promesse est couchée :", "Demain le jour dira ce que l'ombre a caché."],
            ["Et quand viendra le soir, je n'aurai qu'un vœu, qu'une envie :", "Avoir aimé assez pour que ça dure toute une vie."]
        ],
        kc: [
            ["Ô {KC}, tu es la lampe au fond de mon minuit,", "La veilleuse {A:f} qui empêche l'oubli."],
            ["Dire {KC}, c'est allumer une veilleuse en pleine nuit,", "Et savoir que, désormais, l'ombre conduit."],
            ["{KC}, ton nom est une chambre où le temps se repose,", "Une lampe {A:f} qui veille au cœur de toutes mes choses."]
        ]
    },
    espoir: {
        ouv: [
            ["Une graine suffit pour fendre tout le béton,", "Il suffit d'un {NM} pour forcer l'horizon."],
            ["Après la pluie, le monde a des yeux d'enfant lavés,", "Et mon {NM} {V} avec les flaques, enivré."]
        ],
        coe: [
            ["Même cassé, même nu, mon {NM} se lève encore :", "L'aube tient ses promesses : c'est là son trésor."],
            ["Ils ont dit : c'est fini ; j'ai répondu : regardez,", "Mon {NM} {V} plus haut que toutes leurs armées."],
            ["Mon {NM} {V} : ce n'est pas de la colère,", "C'est la vie {A:f} en moi qui refuse l'hiver."]
        ],
        fin: [
            ["Demain n'est pas un mot : c'est une main tendue,", "Et mon {NM} la prend, même pieds nus."],
            ["Ce qui profondément se creuse devient passage,", "Et l'âme la plus {A:f} est la plus belle des pages."],
            ["Et même si je tombe, je tomberai debout,", "Car ce qui rêve en moi ne s'éteindra pas du tout."]
        ],
        kc: [
            ["Ô {KC}, tu es la preuve que le jour revient,", "La première lumière {A:f} au front de demain."],
            ["Quand {KC} paraît, le monde retient son souffle un instant,", "Puis reprend sa course, mais plus beau qu'avant."],
            ["Si je devais définir {KC}, je parlerais d'aurore,", "De ce qui vient avant le jour, et qui le fait éclore encore."]
        ]
    },
    general: {
        ouv: [
            ["Une lumière {A:f} traverse le matin,", "Et réveille en secret ce qui dormait en vain."],
            ["Une fenêtre {A:f} s'allume au loin dans la ville,", "Comme une âme qui veille, obstinée et tranquille."]
        ],
        coe: [
            ["Je porte en moi des pays que nul n'a traversés,", "Des villes de silence aux portes condamnées."],
            ["Sommes-nous les passants, ou bien sommes-nous la route,", "Le rêve qui s'efface, ou la main qui l'écoute ?"],
            ["Mes souvenirs ne sont pas des images, mais des poids,", "Des pierres {A:f} que je porte sans savoir pourquoi."]
        ],
        fin: [
            ["Le temps ne prend rien : il nous rend à nous-mêmes,", "Délestés du superflu, nus comme des poèmes."],
            ["Ce que nous appelons mourir n'est peut-être que naître", "À une autre lumière, par une autre fenêtre."],
            ["Alors je cesse de craindre : rien de ce qui fut ne meurt,", "Ce qui est aimé demeure, plus fort que l'heure."]
        ],
        kc: [
            ["{KC}, ton nom est une chambre où le temps se repose,", "Une lampe {A:f} qui veille au cœur de toutes mes choses."],
            ["Dire {KC}, c'est allumer une veilleuse en pleine nuit,", "Et savoir que, désormais, l'ombre conduit."]
        ]
    }
};

function melanger(arr) {
    const c = [...arr];
    for (let i = c.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function cap(m) { return m.charAt(0).toUpperCase() + m.slice(1); }

const STOP = new Set(['pour','avec','dans','sur','sous','entre','vers','chez','par','de','du','des','le','la','les','un','une','ce','cette','ces','mon','ma','mes','ton','ta','tes','son','sa','ses','notre','votre','leur','qui','que','quoi','dont','où','quand','comment','pourquoi','si','mais','ou','et','donc','or','ni','car','je','tu','il','elle','nous','vous','ils','elles','suis','es','est','sommes','êtes','sont','ai','as','a','avons','avez','ont','fait','faire','dit','dire','veux','vouloir','peux','pouvoir','dois','devoir','vais','aller','aime','amour','poeme','poème']);

function extraireSujet(prompt) {
    const tokens = prompt.replace(/[.,!?;:'"()]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    const mots = tokens.filter(w => !STOP.has(w.toLowerCase()));
    if (mots.length === 0) return [];
    const propres = mots.filter(w => w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase());
    if (propres.length > 0) return propres.slice(0, 3).map(cap);
    if (mots.length === 1) return [cap(mots[0])];
    return [];
}

function remplir(ligne, t, rot) {
    let genre = 'm';
    const out = ligne.replace(/\{NM\}|\{NF\}|\{V\}|\{A(?::(m|f))?\}|\{KC\}/g, (tok) => {
        if (tok === '{NM}') { genre = 'm'; return pick(t.noms.filter(x => x[1] === 'm'))[0]; }
        if (tok === '{NF}') { genre = 'f'; return pick(t.noms.filter(x => x[1] === 'f'))[0]; }
        if (tok === '{V}')  return pick(t.verbes);
        if (tok === '{KC}') return rot.next() || 'l\'âme';
        const g = tok.startsWith('{A:') ? tok.charAt(3) : genre;
        const a = pick(ADJ);
        return g === 'm' ? a.m : a.f;
    });
    return out.charAt(0).toUpperCase() + out.slice(1);
}

function createurRotation(sujets) {
    let i = 0;
    return { next: () => sujets[i++ % sujets.length] };
}

function genererPoemeLocal(prompt, nombreVers, themeChoisi) {
    const id = themes[themeChoisi] ? themeChoisi : 'general';
    const t = themes[id];
    const b = bank[id];
    const sujets = extraireSujet(prompt);
    const rot = createurRotation(sujets);

    const pools = { ouv: melanger(b.ouv), coe: melanger(b.coe), fin: melanger(b.fin) };
    const kpool = melanger(b.kc);
    const draw = (role) => {
        if (pools[role].length === 0) pools[role] = melanger(b[role]);
        return pools[role].pop();
    };
    const drawKC = () => {
        if (kpool.length === 0) kpool.push(...melanger(b.kc));
        return kpool.pop();
    };
    const rand = (...o) => o[Math.floor(Math.random() * o.length)];

    const nbStrophes = Math.ceil(nombreVers / 4);
    const vers = [];
    let dernierKC = -2;
    const peutKC = (s) => sujets.length > 0 && (s - dernierKC) >= 2;

    for (let s = 0; s < nbStrophes; s++) {
        let plan;
        if (nbStrophes === 1)           plan = [peutKC(s) && Math.random() < 0.85 ? 'KC' : 'ouv', 'fin'];
        else if (s === 0)               plan = [peutKC(s) && Math.random() < 0.6 ? 'KC' : 'ouv', 'coe'];
        else if (s === nbStrophes - 1)  plan = [peutKC(s) && Math.random() < 0.35 ? 'KC' : 'coe', 'fin'];
        else {
            plan = [rand('coe', 'coe', 'ouv'), rand('coe', 'ouv')];
            if (peutKC(s) && Math.random() < 0.4) plan[0] = 'KC';
        }
        for (const role of plan) {
            const couplet = role === 'KC' ? drawKC() : draw(role);
            if (role === 'KC') dernierKC = s;
            vers.push(remplir(couplet[0], t, rot), remplir(couplet[1], t, rot));
        }
    }

    const strophes = [];
    for (let i = 0; i < vers.length; i += 4) strophes.push(vers.slice(i, i + 4).join('\n'));
    return `${cap(prompt.trim())}\n\n${strophes.join('\n\n')}`;
}

// ============ ROUTE API ============

app.post('/generate-poem', async (req, res) => {
    const { prompt, lines, theme } = req.body;
    if (!prompt || !prompt.trim()) return res.status(400).json({ error: "Le prompt est vide." });

    const nombreVers = parseInt(lines) || 16;
    const themeChoisi = theme === 'libre' ? 'general' : theme;

    let poeme = null;
    if (GROQ_KEY || GEMINI_KEY) {
        try {
            poeme = await poemeParIA(prompt, nombreVers, themeChoisi);
        } catch (e) {
            poeme = null; // panne IA → repli local
        }
    }
    if (!poeme) poeme = genererPoemeLocal(prompt, nombreVers, themeChoisi);

    setTimeout(() => res.json({ poem: poeme }), 600 + Math.random() * 600);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🪶 Serveur Plume d'Étoile démarré (mode : ${GROQ_KEY || GEMINI_KEY ? 'IA' : 'local'})`));

const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============ BASES DE DONNÉES POÉTIQUES ============

const themes = {
    amour: {
        mots: ['cœur', 'âme', 'amour', 'désir', 'passion', 'tendresse', 'étreinte', 'baiser', 'regard', 'soupir'],
        vers: [
            "Mon cœur s'emballe au rythme de tes pas,",
            "Dans tes yeux, je me perds et me retrouve,",
            "L'amour est un feu qui ne s'éteint pas,",
            "Ton souffle sur ma peau, une douce épreuve.",
            "Je t'aime comme la nuit aime la lune,",
            "Silencieusement, profondément, sans fin.",
            "Chaque battement de mon cœur t'importune,",
            "Car il ne vit que pour toi, mon destin.",
            "Tes mains sur mon visage, une caresse infinie,",
            "Ton rire résonne comme un chant de vie.",
            "Dans l'ombre de tes bras, je trouve mon abri,",
            "Loin du monde, loin du bruit, loin de l'oubli.",
            "Ton nom gravé dans l'or de ma mémoire,",
            "Chaque instant avec toi est une victoire.",
            "L'amour n'est pas un mot, c'est un univers,",
            "Où deux âmes dansent au bord de la mer."
        ]
    },
    tristesse: {
        mots: ['larmes', 'douleur', 'vide', 'absence', 'mélancolie', 'chagrin', 'silence', 'ombre', 'regret', 'solitude'],
        vers: [
            "Les larmes coulent comme une pluie d'automne,",
            "Le silence pèse sur mon cœur brisé.",
            "Dans l'ombre, je cherche ce qui me pardonne,",
            "Mais le chagrin refuse de s'apaiser.",
            "Ton absence creuse un vide en moi,",
            "Un écho lointain qui ne répond plus.",
            "Je marche seul, perdu, sans loi,",
            "Dans les rues grises de mes souvenirs vaincus.",
            "La mélancolie s'installe dans mes veines,",
            "Comme un poison doux qui m'empoisonne lentement.",
            "Chaque nuit, je compte mes peines,",
            "Et le matin me trouve encore gémissant.",
            "Le temps ne guérit rien, il ensevelit,",
            "Sous la poussière des jours, nos regrets enfouis.",
            "Je souris encore, mais c'est un masque fragile,",
            "Derrière, il n'y a qu'un océan tranquille."
        ]
    },
    nature: {
        mots: ['forêt', 'océan', 'montagne', 'fleur', 'arbre', 'rivière', 'ciel', 'soleil', 'lune', 'étoile'],
        vers: [
            "La forêt chante sous le vent du matin,",
            "Les feuilles dansent comme des papillons d'or.",
            "La rivière serpente, un ruban argenté, serein,",
            "Portant les rêves vers des rivages encore.",
            "L'océan rugit, immense et éternel,",
            "Ses vagues écrasent les rochers avec fureur.",
            "Le soleil se couche, peignant le ciel,",
            "De rouge, de pourpre, de mille couleurs.",
            "La montagne se dresse, fière et immuable,",
            "Témoin silencieux des siècles écoulés.",
            "Une fleur éclot, fragile et adorable,",
            "Dans l'herbe haute, humblement révélée.",
            "La lune veille sur le monde endormi,",
            "Sa lumière douce berce les insomnies.",
            "Les étoiles scintillent, phares de l'infini,",
            "Guidant les âmes perdues dans la nuit."
        ]
    },
    nuit: {
        mots: ['nuit', 'étoiles', 'lune', 'ombre', 'silence', 'rêve', 'insomnie', 'ténèbres', 'clair de lune', 'minuit'],
        vers: [
            "La nuit déploie son manteau d'étoiles,",
            "Le vent murmure à travers les voiles.",
            "Chaque mot est une étincelle,",
            "Dans l'ombre douce, une flamme fidèle.",
            "Le temps s'arrête, suspendu,",
            "Entre le rêve et l'inconnu.",
            "La plume danse, légère et libre,",
            "Écrivant l'âme, vers par vers, en équilibre.",
            "Minuit sonne, le monde se tait,",
            "Seule la lune éclaire mes secrets.",
            "Les ténèbres ne sont pas un ennemi,",
            "Mais un refuge pour les cœurs meurtris.",
            "Dans le silence, j'entends l'univers,",
            "Il me parle de mystères et d'hivers.",
            "L'insomnie est une compagne fidèle,",
            "Elle m'accompagne jusqu'à l'aube nouvelle."
        ]
    },
    espoir: {
        mots: ['lumière', 'espoir', 'demain', 'renaissance', 'aube', 'courage', 'force', 'avenir', 'renaître', 'flamme'],
        vers: [
            "Après la nuit la plus noire, l'aube renaît,",
            "Le soleil perce les nuages gris.",
            "L'espoir est une flamme qui ne s'éteint jamais,",
            "Même quand le vent souffle sur nos esprits.",
            "Demain est une page blanche à écrire,",
            "Un chemin nouveau qui s'ouvre devant moi.",
            "Le courage n'est pas l'absence de délire,",
            "Mais la force de se lever, encore, malgré tout, malgré soi.",
            "Chaque cicatrice est une leçon apprise,",
            "Chaque larme versée nourrit la terre.",
            "La renaissance commence dans la brise,",
            "Quand on accepte enfin de se libérer de ses chaînes.",
            "L'avenir n'est pas écrit, il est à inventer,",
            "Pas à pas, mot à mot, jour après jour.",
            "La lumière revient toujours, il faut y croire,",
            "Car même l'hiver le plus long cède au printemps un jour."
        ]
    },
    general: {
        mots: ['vie', 'temps', 'âme', 'cœur', 'rêve', 'monde', 'instant', 'mémoire', 'destin', 'vérité'],
        vers: [
            "Le temps passe, indifférent et souverain,",
            "Emportant nos jours comme des feuilles au vent.",
            "L'âme cherche sa route, un chemin incertain,",
            "Entre les ombres d'hier et les lueurs de demain.",
            "Chaque instant est un monde en soi,",
            "Un univers complet qui naît et qui meurt.",
            "La mémoire tisse ce que nous croyons être,",
            "Un fil fragile qui relie nos peurs.",
            "Le destin n'est pas une route tracée,",
            "Mais un jardin sauvage qu'on cultive en silence.",
            "La vérité se cache, souvent déguisée,",
            "Derrière les masques de notre existence.",
            "Nous sommes des voyageurs sans bagage,",
            "Portant seulement nos rêves et nos images.",
            "La vie est un poème qu'on écrit sans rature,",
            "Avec l'encre de nos joies et de nos blessures."
        ]
    }
};

const banques = {
    verbes: ['danse', 'chante', 'murmure', 's\'éveille', 's\'endort', 'brille', 'coule', 's\'envole', 'résonne', 'palpite', 's\'efface', 'renaît', 's\'illumine', 'tremble', 's\'apaise', 's\'embrase', 'flotte', 's\'effiloche', 's\'épanouit', 's\'évanouit'],
    adjectifs: ['doux', 'amer', 'lumineux', 'sombre', 'fragile', 'éternel', 'silencieux', 'ardent', 'mélancolique', 'serein', 'sauvage', 'tendre', 'profond', 'léger', 'intense', 'mystérieux', 'brûlant', 'glacé', 'vibrant', 'immobile'],
    images: ['comme une étoile filante dans le ciel nocturne', 'tel un souffle léger sur l\'eau tranquille', 'à l\'image d\'une fleur qui s\'ouvre au printemps', 'semblable à un écho perdu dans la vallée', 'comme le dernier rayon du soleil couchant', 'tel un secret murmuré à l\'oreille du vent', 'à la manière d\'une larme qui roule sur la joue', 'comme un papillon prisonnier de l\'ambre', 'tel un mot oublié sur les lèvres du temps', 'à l\'instar d\'une ombre qui s\'allonge au crépuscule', 'comme une mélodie suspendue entre deux silences', 'tel un rêve qui s\'effiloche à l\'aube', 'comme une flamme qui danse dans la nuit', 'tel un souvenir qui s\'estompe dans la brume', 'à l\'image d\'un oiseau libre dans l\'immensité'],
    connecteurs: ['Et', 'Mais', 'Pourtant', 'Alors', 'Car', 'Puis', 'Tandis que', 'Lorsque', 'Si bien que', 'Ainsi', 'Cependant', 'Néanmoins', 'Or', 'Donc', 'Enfin'],
    lieux: ['dans l\'ombre des forêts anciennes', 'au bord de l\'océan infini', 'sous le ciel étoilé', 'au cœur de la nuit silencieuse', 'dans les méandres du temps', 'au creux de l\'aube naissante', 'sur les rivages de l\'oubli', 'dans les jardins secrets de l\'âme', 'au sommet des montagnes brumeuses', 'dans les rues pavées de souvenirs', 'au fond des abysses du cœur', 'dans les champs dorés de l\'espoir'],
    emotions: ['une joie pure et sauvage', 'une mélancolie douce et profonde', 'une passion ardente et dévorante', 'une sérénité absolue', 'une nostalgie tendre et amère', 'un émerveillement enfantin', 'une douleur qui transfigure', 'un espoir qui résiste à tout', 'une liberté enivrante', 'une paix qui apaise les tempêtes']
};

// ============ FONCTIONS DE GÉNÉRATION ============

function extraireMotsCles(prompt) {
    const mots = prompt.toLowerCase().replace(/[.,!?;:'"()]/g, '').split(/\s+/).filter(mot => mot.length > 3);
    const stopWords = ['pour', 'avec', 'dans', 'sur', 'sous', 'entre', 'vers', 'chez', 'par', 'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une', 'ce', 'cette', 'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'votre', 'leur', 'qui', 'que', 'quoi', 'dont', 'où', 'quand', 'comment', 'pourquoi', 'si', 'mais', 'ou', 'et', 'donc', 'or', 'ni', 'car', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'suis', 'es', 'est', 'sommes', 'êtes', 'sont', 'ai', 'as', 'a', 'avons', 'avez', 'ont', 'fait', 'faire', 'dit', 'dire', 'veux', 'vouloir', 'peux', 'pouvoir', 'dois', 'devoir', 'vais', 'aller'];
    return mots.filter(mot => !stopWords.includes(mot)).slice(0, 5);
}

function melangerTableau(arr) {
    const copie = [...arr];
    for (let i = copie.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
}

function genererVers(motsCles, theme, index, usedPhrases) {
    let phrase = "";
    let attempts = 0;
    
    // Éviter les répétitions immédiates
    while (attempts < 5) {
        const structures = [
            () => {
                const sujet = theme.mots[Math.floor(Math.random() * theme.mots.length)];
                const verbe = banques.verbes[Math.floor(Math.random() * banques.verbes.length)];
                const adj = banques.adjectifs[Math.floor(Math.random() * banques.adjectifs.length)];
                return `${sujet.charAt(0).toUpperCase() + sujet.slice(1)} ${verbe}, ${adj} et libre,`;
            },
            () => {
                const image = banques.images[Math.floor(Math.random() * banques.images.length)];
                const motCle = motsCles[Math.floor(Math.random() * motsCles.length)] || 'rêve';
                return `${image.charAt(0).toUpperCase() + image.slice(1)}, portant le souffle de ${motCle}.`;
            },
            () => {
                const lieu = banques.lieux[Math.floor(Math.random() * banques.lieux.length)];
                const emotion = banques.emotions[Math.floor(Math.random() * banques.emotions.length)];
                const motCle = motsCles[Math.floor(Math.random() * motsCles.length)] || 'âme';
                return `${lieu.charAt(0).toUpperCase() + lieu.slice(1)}, où ${emotion} éveille ${motCle}.`;
            },
            () => {
                const connecteur = banques.connecteurs[Math.floor(Math.random() * banques.connecteurs.length)];
                const sujet = theme.mots[Math.floor(Math.random() * theme.mots.length)];
                const verbe = banques.verbes[Math.floor(Math.random() * banques.verbes.length)];
                const adj = banques.adjectifs[Math.floor(Math.random() * banques.adjectifs.length)];
                return `${connecteur} ${sujet} ${verbe}, ${adj} comme l'aurore,`;
            },
            () => {
                const motCle = motsCles[Math.floor(Math.random() * motsCles.length)] || 'temps';
                const verbe = banques.verbes[Math.floor(Math.random() * banques.verbes.length)];
                const adj = banques.adjectifs[Math.floor(Math.random() * banques.adjectifs.length)];
                return `Le ${motCle} ${verbe}, ${adj} et souverain,`;
            },
            () => {
                const versTheme = theme.vers[Math.floor(Math.random() * theme.vers.length)];
                return versTheme;
            }
        ];
        
        phrase = structures[index % structures.length]();
        
        // Vérifier si la phrase n'a pas déjà été utilisée
        if (!usedPhrases.has(phrase)) {
            usedPhrases.add(phrase);
            break;
        }
        attempts++;
    }
    
    return phrase;
}

function genererPoeme(prompt, nombreVers, themeChoisi) {
    const motsCles = extraireMotsCles(prompt);
    const theme = themes[themeChoisi] || themes.general;
    const vers = [];
    const usedPhrases = new Set();
    
    const versThemeMelanges = melangerTableau(theme.vers);
    let themeIndex = 0;
    
    // Générer exactement le nombre de vers demandé (1 phrase = 1 ligne)
    for (let i = 0; i < nombreVers; i++) {
        // Alterner entre les vers pré-écrits du thème et les vers générés
        if (i % 3 === 0 && themeIndex < versThemeMelanges.length) {
            let v = versThemeMelanges[themeIndex];
            // Éviter les répétitions même pour les vers du thème
            while (usedPhrases.has(v) && themeIndex < versThemeMelanges.length) {
                themeIndex++;
                v = versThemeMelanges[themeIndex];
            }
            if (themeIndex < versThemeMelanges.length) {
                usedPhrases.add(v);
                vers.push(v);
                themeIndex++;
            } else {
                vers.push(genererVers(motsCles, theme, i, usedPhrases));
            }
        } else {
            vers.push(genererVers(motsCles, theme, i, usedPhrases));
        }
    }
    
    const strophes = [];
    for (let i = 0; i < vers.length; i += 4) {
        strophes.push(vers.slice(i, i + 4).join('\n'));
    }
    return `${prompt}\n\n${strophes.join('\n\n')}`;
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

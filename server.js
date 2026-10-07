const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============ GÉNÉRATEUR DE POÈMES PROCÉDURAL ============

// Banques de mots et expressions poétiques
const banques = {
    sujets: [
        'le temps', 'la nuit', 'l\'amour', 'la vie', 'le rêve', 'l\'âme',
        'le silence', 'la lumière', 'l\'ombre', 'le vent', 'la mer',
        'le cœur', 'l\'espoir', 'la mémoire', 'le destin', 'l\'univers',
        'la solitude', 'la passion', 'le mystère', 'l\'infini'
    ],
    
    verbes: [
        'danse', 'chante', 'murmure', 's\'éveille', 's\'endort', 'brille',
        'coule', 's\'envole', 'résonne', 'palpite', 's\'efface', 'renaît',
        's\'illumine', 'tremble', 's\'apaise', 's\'embrase', 'flotte',
        's\'effiloche', 's\'épanouit', 's\'évanouit'
    ],
    
    adjectifs: [
        'doux', 'amer', 'lumineux', 'sombre', 'fragile', 'éternel',
        'silencieux', 'ardent', 'mélancolique', 'serein', 'sauvage',
        'tendre', 'profond', 'léger', 'intense', 'mystérieux',
        'brûlant', 'glacé', 'vibrant', 'immobile'
    ],
    
    images: [
        'comme une étoile filante dans le ciel nocturne',
        'tel un souffle léger sur l\'eau tranquille',
        'à l\'image d\'une fleur qui s\'ouvre au printemps',
        'semblable à un écho perdu dans la vallée',
        'comme le dernier rayon du soleil couchant',
        'tel un secret murmuré à l\'oreille du vent',
        'à la manière d\'une larme qui roule sur la joue',
        'comme un papillon prisonnier de l\'ambre',
        'tel un mot oublié sur les lèvres du temps',
        'à l\'instar d\'une ombre qui s\'allonge au crépuscule',
        'comme une mélodie suspendue entre deux silences',
        'tel un rêve qui s\'effiloche à l\'aube',
        'comme une flamme qui danse dans la nuit',
        'tel un souvenir qui s\'estompe dans la brume',
        'à l\'image d\'un oiseau libre dans l\'immensité'
    ],
    
    rimes_a: [
        ['nuit', 'luit', 'bruit', 's\'enfuit', 'luit', 'conduit'],
        ['amour', 'toujours', 'velours', 'alentour', 'séjour', 'retour'],
        ['ciel', 'éternel', 'essentiel', 'miel', 'arc-en-ciel', 'solennel'],
        ['cœur', 'bonheur', 'douleur', 'chaleur', 'pâleur', 'lueur'],
        ['vent', 'mouvement', 'firmament', 'serpent', 'moment', 'tourment'],
        ['âme', 'flamme', 'femme', 'drame', 'gamme', 'proclame'],
        ['temps', 'printemps', 'instant', 'néant', 'océan', 'diamant'],
        ['rêve', 'grève', 'trêve', 's\'achève', 'se lève', 'brève']
    ],
    
    rimes_b: [
        ['étoile', 'voile', 'toile', 'frêle', 'aile', 'fidèle'],
        ['ombre', 'sombre', 'nombre', 'pénombre', 'décombre', 'monde'],
        ['silence', 'absence', 'enfance', 'défense', 'immense', 'balance'],
        ['lumière', 'prière', 'entière', 'arrière', 'mystère', 'frontière'],
        ['murmure', 'nature', 'parure', 'blessure', 'aventure', 'mesure'],
        ['destin', 'matin', 'chemin', 'lointain', 'soudain', 'demain'],
        ['espoir', 'miroir', 'noir', 'devoir', 'pouvoir', 'savoir'],
        ['univers', 'hiver', 'amer', 'enfer', 'éclair', 'chair']
    ],
    
    connecteurs: [
        'Et', 'Mais', 'Pourtant', 'Alors', 'Car', 'Puis',
        'Tandis que', 'Lorsque', 'Si bien que', 'Ainsi',
        'Cependant', 'Néanmoins', 'Or', 'Donc', 'Enfin'
    ],
    
    lieux: [
        'dans l\'ombre des forêts anciennes',
        'au bord de l\'océan infini',
        'sous le ciel étoilé',
        'au cœur de la nuit silencieuse',
        'dans les méandres du temps',
        'au creux de l\'aube naissante',
        'sur les rivages de l\'oubli',
        'dans les jardins secrets de l\'âme',
        'au sommet des montagnes brumeuses',
        'dans les rues pavées de souvenirs',
        'au fond des abysses du cœur',
        'dans les champs dorés de l\'espoir'
    ],
    
    emotions: [
        'une joie pure et sauvage',
        'une mélancolie douce et profonde',
        'une passion ardente et dévorante',
        'une sérénité absolue',
        'une nostalgie tendre et amère',
        'un émerveillement enfantin',
        'une douleur qui transfigure',
        'un espoir qui résiste à tout',
        'une liberté enivrante',
        'une paix qui apaise les tempêtes'
    ]
};

// Fonction pour extraire les mots importants du prompt
function extraireMotsCles(prompt) {
    const mots = prompt.toLowerCase()
        .replace(/[.,!?;:'"()]/g, '')
        .split(/\s+/)
        .filter(mot => mot.length > 3);
    
    // Enlever les mots trop communs
    const stopWords = ['pour', 'avec', 'dans', 'sur', 'sous', 'entre', 'vers', 'chez', 'par', 'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une', 'ce', 'cette', 'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'votre', 'leur', 'qui', 'que', 'quoi', 'dont', 'où', 'quand', 'comment', 'pourquoi', 'si', 'mais', 'ou', 'et', 'donc', 'or', 'ni', 'car', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'suis', 'es', 'est', 'sommes', 'êtes', 'sont', 'ai', 'as', 'a', 'avons', 'avez', 'ont', 'fait', 'faire', 'dit', 'dire', 'veux', 'vouloir', 'peux', 'pouvoir', 'dois', 'devoir', 'vais', 'aller'];
    
    return mots.filter(mot => !stopWords.includes(mot)).slice(0, 5);
}

// Fonction pour générer un vers aléatoire
function genererVers(motsCles, index) {
    const structures = [
        () => {
            const sujet = banques.sujets[Math.floor(Math.random() * banques.sujets.length)];
            const verbe = banques.verbes[Math.floor(Math.random() * banques.verbes.length)];
            const adj = banques.adjectifs[Math.floor(Math.random() * banques.adjectifs.length)];
            return `${sujet.charAt(0).toUpperCase() + sujet.slice(1)} ${verbe}, ${adj} et libre,`;
        },
        () => {
            const image = banques.images[Math.floor(Math.random() * banques.images.length)];
            const motCle = motsCles[Math.floor(Math.random() * motsCles.length)] || 'rêve';
            return `${image.charAt(0).toUpperCase() + image.slice(1)},\nPortant en soi l'essence du ${motCle}.`;
        },
        () => {
            const lieu = banques.lieux[Math.floor(Math.random() * banques.lieux.length)];
            const emotion = banques.emotions[Math.floor(Math.random() * banques.emotions.length)];
            const motCle = motsCles[Math.floor(Math.random() * motsCles.length)] || 'âme';
            return `${lieu.charAt(0).toUpperCase() + lieu.slice(1)},\nOù ${emotion} rencontre le ${motCle}.`;
        },
        () => {
            const connecteur = banques.connecteurs[Math.floor(Math.random() * banques.connecteurs.length)];
            const sujet = banques.sujets[Math.floor(Math.random() * banques.sujets.length)];
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
            const rimeA = banques.rimes_a[Math.floor(Math.random() * banques.rimes_a.length)];
            const mot1 = rimeA[Math.floor(Math.random() * rimeA.length)];
            const mot2 = rimeA[Math.floor(Math.random() * rimeA.length)];
            const verbe = banques.verbes[Math.floor(Math.random() * banques.verbes.length)];
            return `Quand le ${mot1} ${verbe} dans la ${mot2},`;
        }
    ];
    
    return structures[index % structures.length]();
}

// Fonction pour créer une rime
function trouverRime(mot) {
    for (const groupe of [...banques.rimes_a, ...banques.rimes_b]) {
        if (groupe.some(rime => mot.endsWith(rime.slice(-3)))) {
            return groupe[Math.floor(Math.random() * groupe.length)];
        }
    }
    const rimesGeneriques = ['étoile', 'voile', 'toile', 'aile', 'fidèle', 'ombre', 'sombre', 'nombre', 'lumière', 'prière', 'entière'];
    return rimesGeneriques[Math.floor(Math.random() * rimesGeneriques.length)];
}

// Fonction principale de génération
function genererPoeme(prompt, nombreVers) {
    const motsCles = extraireMotsCles(prompt);
    const vers = [];
    
    // Générer des vers uniques
    for (let i = 0; i < nombreVers; i++) {
        const versGenere = genererVers(motsCles, i);
        vers.push(versGenere);
    }
    
    // Organiser en strophes de 4 vers
    const strophes = [];
    for (let i = 0; i < vers.length; i += 4) {
        strophes.push(vers.slice(i, i + 4).join('\n'));
    }
    
    // Créer un titre basé sur le prompt
    const titre = `✨ ${prompt} ✨`;
    
    return `${titre}\n\n${strophes.join('\n\n')}`;
}

// ============ ROUTE API ============

app.post('/generate-poem', async (req, res) => {
    const { prompt, lines } = req.body;

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: "Le prompt est vide." });
    }

    const nombreVers = parseInt(lines) || 16;
    const poeme = genererPoeme(prompt, nombreVers);

    // Petite pause pour simuler la "réflexion" poétique
    setTimeout(() => {
        res.json({ poem: poeme });
    }, 1000 + Math.random() * 1000); // Délai aléatoire entre 1 et 2 secondes
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🪶 Serveur Plume d'Étoile démarré sur le port ${PORT}`);
});

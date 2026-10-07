const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate-poem', async (req, res) => {
    const { prompt, lines } = req.body;

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: "Le prompt est vide." });
    }

    // Simulation de poème (à remplacer plus tard par un appel à une vraie IA)
    const poeme = `✨ Poème inspiré par : "${prompt}" ✨\n\n` +
        `La nuit déploie son manteau d'étoiles,\n` +
        `Le vent murmure à travers les voiles.\n` +
        `Chaque mot est une étincelle,\n` +
        `Dans l'ombre douce, une flamme fidèle.\n\n` +
        `Le temps s'arrête, suspendu,\n` +
        `Entre le rêve et l'inconnu.\n` +
        `La plume danse, légère et libre,\n` +
        `Écrivant l'âme, vers par vers, en équilibre.\n\n` +
        `(Version ${lines} vers - démo)`;

    setTimeout(() => {
        res.json({ poem: poeme });
    }, 1500);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

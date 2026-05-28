import express from 'express';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/generate-poem', async (req, res) => {
    // On récupère le prompt ET le nombre de vers choisis
    const { prompt, lines } = req.body;
    if (!prompt) return res.status(400).json({ error: "La description du poème est requise." });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            // On intègre la consigne stricte du nombre de vers dans le texte envoyé à l'IA
            contents: `Écris un poème magnifique, touchant et profond en suivant exactement ces instructions : "${prompt}". Tu as une contrainte absolue : le poème doit faire EXACTEMENT ${lines} vers en tout (ni plus, ni moins). Structure bien le texte avec des paragraphes (par exemple des quatrains) et écris-le entièrement en français.`,
        });

        res.json({ poem: response.text });
    } catch (error) {
        console.error("Erreur Gemini :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la génération." });
    }
});

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
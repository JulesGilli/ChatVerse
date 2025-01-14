const express = require('express');

const connectDb = require("../db/connection");

const router = express.Router();

// Route GET pour récupérer tous les utilisateurs
router.get("/", async (req, res) => {
    try {
        let client = await connectDb();
        let db = client.db("sample_mflix");
        let collection = await db.collection("users"); // Récupère tous les documents de la collection
        let results = await collection.find({}).toArray();
        console.log(results);
        res.status(200).json(results); // Renvoie les utilisateurs en JSON
    } catch (err) {
        console.error("Erreur lors de la récupération des utilisateurs :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
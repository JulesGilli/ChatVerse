const { MongoClient, ServerApiVersion } = require("mongodb");


 
const uri = process.env.ATLAS_URI || "";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
 
// Fonction pour connecter à la base de données
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connecté à MongoDB !");
    return client; // On retourne le client pour l'utiliser ailleurs
  } catch (err) {
    console.error("Erreur de connexion à MongoDB :", err);
    process.exit(1); // Arrêter le processus en cas d'erreur critique
  }
}

module.exports = connectToDatabase;
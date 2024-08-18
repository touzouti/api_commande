// path: app.js

const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");

// Import du middleware d'authentification
const authMiddleware = require('./middleware/authMiddleware'); 

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Appliquer le middleware d'authentification à toutes les routes
app.use(authMiddleware); 

app.get("/", (req, res) => {
    res.json({ message: "Bienvenue dans notre application API Commande" });
});

const commandesRoutes = require("./routes/commandesRoutes");
app.use("/api/commandes", commandesRoutes);

const PORT = process.env.PORT || 0;
app.listen(PORT, () => {
    console.log(`Le serveur tourne sur le port : http://localhost:${PORT}`);
});

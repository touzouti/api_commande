const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.json({ message: "Bienvenue dans notre application API." });
});

const commandesRoutes = require("./routes/commandesRoutes");
app.use("/api/commandes", commandesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Le serveur tourne sur le port : http://localhost:${PORT}`);
});

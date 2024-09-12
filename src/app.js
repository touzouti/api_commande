const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const { consumeFromQueue } = require('./config/rabbitmq');

dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({ message: "Bienvenue dans notre application API Commande" });
});

const commandesRoutes = require("./routes/commandesRoutes");
app.use("/api/order", commandesRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Le serveur tourne sur le port : http://localhost:${PORT}`);
});

// Consommer les réponses de validation de produit
consumeFromQueue('product_validation_response_queue', (message) => {
    const productValidation = JSON.parse(message);
    console.log('Validation du produit reçue:', productValidation);

    // Uniformiser le statut avec 'available'
    if (productValidation.status === 'available') {
        console.log(`Le produit ${productValidation.product_id} est disponible.`);
    } else {
        console.log(`Le produit ${productValidation.product_id} est en rupture de stock.`);
    }
});
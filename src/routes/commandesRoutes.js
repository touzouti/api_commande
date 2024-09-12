const express = require("express");
const router = express.Router();
const commandesController = require("../controllers/commandesController");

// Route pour créer une nouvelle commande
router.post("/", commandesController.create);

// Route pour récupérer toutes les commandes
router.get("/", commandesController.findAll);

// Route pour récupérer une commande par id_client et id_produit
router.get("/:id_commande", commandesController.findOne);

// Route pour mettre à jour une commande par id_commande
router.put("/:id_commande", commandesController.update);


// Route pour supprimer une commande par id
router.delete("/:id_commande", commandesController.delete);
module.exports = router;

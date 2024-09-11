const Commande = require("../models/commande");
const { publishToQueue, consumeFromQueue } = require('../config/rabbitmq');

// Fonction pour publier la demande de validation du produit
exports.create = (req, res) => {
    if (!req.body || !req.body.id_client || !req.body.id_produit) {
        return res.status(400).send({
            message: "Le contenu ne peut pas être vide !"
        });
    }

    // Préparer le message de validation du produit
    const validationMessage = {
        product_id: req.body.id_produit,
        requested_quantity: req.body.quantite,
        client_id: req.body.id_client,
        prix_total: req.body.prix_total
    };

    // Envoyer la demande de validation du produit à RabbitMQ
    publishToQueue('product_validation_queue', JSON.stringify(validationMessage));
    console.log('Demande de validation de produit envoyée:', validationMessage);

    // Répondre immédiatement au client que la demande est en cours
    return res.status(200).send({
        message: "Votre commande est en attente de validation de produit.",
        status: "200"
    });
};

// Fonction pour créer la commande après validation de RabbitMQ
exports.createOrderAfterValidation = (responseMessage) => {
    const response = JSON.parse(responseMessage);

    // Si le produit est disponible, créer la commande
    if (response.status === 'available') {
        const commande = new Commande({
            id_client: response.client_id,
            id_produit: response.product_id,
            quantite: response.requested_quantity,
            date_commande: new Date(),
            prix_total: response.prix_total
        });

        // Enregistrer la commande dans la base de données
        Commande.create(commande, (err, data) => {
            if (err) {
                console.error("Erreur lors de la création de la commande : ", err);
            } else {
                // Publier l'événement de création de commande dans RabbitMQ
                publishToQueue('order_creation_queue', JSON.stringify(data));
                    // Répondre immédiatement au client que la demande est en cours
                console.log("Commande créée avec succès : ", data);

                

            }
        });

    } else if (response.status === 'unavailable') {
        console.log(`Le produit ${response.product_id} est en rupture de stock.`);

    }
    else {
        console.log(`Le produit ${response.product_id} n'existe pas`);
    }
};

// Consommer les messages de validation du produit
consumeFromQueue('product_validation_response_queue', (message) => {
    console.log('Message reçu pour la validation du produit:', message);   
    // Appeler la fonction pour traiter la validation
    exports.createOrderAfterValidation(message);
});

exports.findAll = (req, res) => {
    Commande.getAll((err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Une erreur est survenue lors de la récupération des commandes."
            });
        else res.send(data);
    });
};

exports.findOne = (req, res) => {
    Commande.findById(req.params.id_client, req.params.id_produit, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Commande non trouvée avec l'id_client ${req.params.id_client} et l'id_produit ${req.params.id_produit}.`
                });
            } else {
                res.status(500).send({
                    message: "Erreur de connexion à la base de données"
                });
            }
        } else res.send(data);
    });
};

exports.update = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Le contenu ne peut pas être vide !"
        });
        return;
    }

    // Utilise l'id_commande pour la mise à jour
    Commande.updateById(
        req.params.id_commande,  
        new Commande(req.body),  
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Commande non trouvée avec l'id_commande ${req.params.id_commande}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Erreur de mise à jour de la commande"
                    });
                }
            } else res.send(data);  
        }
    );
};

exports.delete = (req, res) => {
    Commande.remove(req.params.id_commande, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Commande non trouvée avec l'id_commande ${req.params.id_commande}.`
                });
            } else {
                res.status(500).send({
                    message: "Impossible de supprimer la commande"
                });
            }
        } else res.send({ message: `La commande a été supprimée avec succès !` });
    });
};

const Commande = require("../models/commande");

exports.create = (req, res) => {
    if (!req.body || !req.body.id_client || !req.body.id_produit) {
        return res.status(400).send({
            message: "Le contenu ne peut pas être vide !"
        });
    }

    const commande = new Commande({
        id_client: req.body.id_client,
        id_produit: req.body.id_produit,
        quantite: req.body.quantite,
        date_commande: req.body.date_commande,
        statut_commande: req.body.statut_commande,
        prix_total: req.body.prix_total
    });

    Commande.create(commande, (err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Une erreur est survenue lors de la création de la commande."
            });
        else res.send(data);
    });
};


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

    Commande.updateById(
        req.params.id_client,
        req.params.id_produit,
        new Commande(req.body),
        (err, data) => {
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
        }
    );
};


exports.delete = (req, res) => {
    Commande.remove(req.params.id_client, req.params.id_produit, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Commande non trouvée avec l'id_client ${req.params.id_client} et l'id_produit ${req.params.id_produit}.`
                });
            } else {
                res.status(500).send({
                    message: "Impossible de supprimer la commande"
                });
            }
        } else res.send({ message: `La commande a été supprimée avec succès !` });
    });
};

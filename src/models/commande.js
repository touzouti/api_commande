const db = require('../config/db.config');

const Commande = function(commande) {
    this.id_client = commande.id_client;
    this.id_produit = commande.id_produit;
    this.quantite = commande.quantite;
    this.date_commande = commande.date_commande;
    this.statut_commande = commande.statut_commande;
    this.prix_total = commande.prix_total;
};

Commande.create = (newCommande, result) => {
    db.query("INSERT INTO commandes SET ?", newCommande, (err, res) => {
        if (err) {
            console.log("erreur: ", err);
            result(err, null);
            return;
        }
        console.log("commande créée : ", { id_commande: res.insertId, ...newCommande });
        result(null, { id_commande: res.insertId, ...newCommande });
    });
};

Commande.findById = (id_client, id_produit, result) => {
    db.query(`SELECT * FROM commandes WHERE id_client = ? AND id_produit = ?`, [id_client, id_produit], (err, res) => {
        if (err) {
            console.log("erreur: ", err);
            result(err, null);
            return;
        }
        if (res.length) {
            console.log("commande trouvée : ", res[0]);
            result(null, res[0]);
            return;
        }
        result({ kind: "not_found" }, null);
    });
};

Commande.getAll = result => {
    db.query("SELECT * FROM commandes", (err, res) => {
        if (err) {
            console.log("erreur: ", err);
            result(null, err);
            return;
        }
        console.log("commandes: ", res);
        result(null, res);
    });
};

Commande.updateById = (id_client, id_produit, commande, result) => {
    db.query(
        "UPDATE commandes SET quantite = ?, date_commande = ?, statut_commande = ?, prix_total = ? WHERE id_client = ? AND id_produit = ?",
        [commande.quantite, commande.date_commande, commande.statut_commande, commande.prix_total, id_client, id_produit],
        (err, res) => {
            if (err) {
                console.log("erreur: ", err);
                result(null, err);
                return;
            }
            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }
            console.log("commande mise à jour : ", { id_client: id_client, id_produit: id_produit, ...commande });
            result(null, { id_client: id_client, id_produit: id_produit, ...commande });
        }
    );
};

Commande.remove = (id_client, id_produit, result) => {
    db.query("DELETE FROM commandes WHERE id_client = ? AND id_produit = ?", [id_client, id_produit], (err, res) => {
        if (err) {
            console.log("erreur: ", err);
            result(null, err);
            return;
        }
        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }
        console.log("commande supprimée avec l'id_client : ", id_client, " et id_produit : ", id_produit);
        result(null, res);
    });
};

module.exports = Commande;

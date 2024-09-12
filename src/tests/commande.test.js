const Commande = require('../models/commande');
const db = require('../config/db.config');

jest.mock('../config/db.config');


describe('Commande Model', () => {

    describe('create', () => {
        it('devrait créer une commande avec succès', () => {
            const newCommande = {
                id_client: 1,
                id_produit: 2,
                quantite: 5,
                date_commande: new Date(),
                prix_total: 100
            };

            const insertId = 1;
            db.query.mockImplementation((query, values, callback) => {
                callback(null, { insertId });
            });

            const resultCallback = jest.fn();
            Commande.create(newCommande, resultCallback);

            expect(db.query).toHaveBeenCalledWith("INSERT INTO commandes SET ?", newCommande, expect.any(Function));
            expect(resultCallback).toHaveBeenCalledWith(null, { id: insertId, ...newCommande });
        });

        it('devrait gérer une erreur lors de la création d\'une commande', () => {
            const newCommande = {
                id_client: 1,
                id_produit: 2,
                quantite: 5,
                date_commande: new Date(),
                prix_total: 100
            };

            const errorMessage = 'Erreur lors de l\'insertion';
            db.query.mockImplementation((query, values, callback) => {
                callback(new Error(errorMessage), null);
            });

            const resultCallback = jest.fn();
            Commande.create(newCommande, resultCallback);

            expect(db.query).toHaveBeenCalledWith("INSERT INTO commandes SET ?", newCommande, expect.any(Function));
            expect(resultCallback).toHaveBeenCalledWith(expect.any(Error), null);
        });
    });

    describe('findById', () => {
        it('devrait trouver une commande par id_client et id_produit', () => {
            const id_client = 1;
            const id_produit = 2;
            const expectedCommande = { id: 1, id_client, id_produit };

            db.query.mockImplementation((query, values, callback) => {
                callback(null, [expectedCommande]);
            });

            const resultCallback = jest.fn();
            Commande.findById(id_client, id_produit, resultCallback);

            expect(db.query).toHaveBeenCalledWith(
                "SELECT * FROM commandes WHERE id_client = ? AND id_produit = ?",
                [id_client, id_produit],
                expect.any(Function)
            );
            expect(resultCallback).toHaveBeenCalledWith(null, expectedCommande);
        });

        it('devrait retourner une erreur si la commande n\'est pas trouvée', () => {
            const id_client = 1;
            const id_produit = 2;

            db.query.mockImplementation((query, values, callback) => {
                callback(null, []);
            });

            const resultCallback = jest.fn();
            Commande.findById(id_client, id_produit, resultCallback);

            expect(db.query).toHaveBeenCalledWith(
                "SELECT * FROM commandes WHERE id_client = ? AND id_produit = ?",
                [id_client, id_produit],
                expect.any(Function)
            );
            expect(resultCallback).toHaveBeenCalledWith({ kind: 'not_found' }, null);
        });

        it('devrait gérer une erreur lors de la recherche de la commande', () => {
            const id_client = 1;
            const id_produit = 2;
            const errorMessage = 'Erreur lors de la requête';

            db.query.mockImplementation((query, values, callback) => {
                callback(new Error(errorMessage), null);
            });

            const resultCallback = jest.fn();
            Commande.findById(id_client, id_produit, resultCallback);

            expect(db.query).toHaveBeenCalledWith(
                "SELECT * FROM commandes WHERE id_client = ? AND id_produit = ?",
                [id_client, id_produit],
                expect.any(Function)
            );
            expect(resultCallback).toHaveBeenCalledWith(expect.any(Error), null);
        });
    });

    describe('getAll', () => {
        it('devrait retourner toutes les commandes', () => {
            const expectedCommandes = [{ id: 1 }, { id: 2 }];

            db.query.mockImplementation((query, callback) => {
                callback(null, expectedCommandes);
            });

            const resultCallback = jest.fn();
            Commande.getAll(resultCallback);

            expect(db.query).toHaveBeenCalledWith("SELECT * FROM commandes", expect.any(Function));
            expect(resultCallback).toHaveBeenCalledWith(null, expectedCommandes);
        });

        it('devrait gérer une erreur lors de la récupération des commandes', () => {
            const errorMessage = 'Erreur lors de la récupération des commandes';

            db.query.mockImplementation((query, callback) => {
                callback(new Error(errorMessage), null);
            });

            const resultCallback = jest.fn();
            Commande.getAll(resultCallback);

            expect(db.query).toHaveBeenCalledWith("SELECT * FROM commandes", expect.any(Function));
            expect(resultCallback).toHaveBeenCalledWith(null, expect.any(Error));
        });
    });

    describe('updateById', () => {
        // it('devrait mettre à jour une commande avec succès', () => {
        //     const updatedCommande = {
        //         id_client: 1,
        //         id_produit: 2,
        //         quantite: 10,
        //         date_commande: new Date(),
        //         statut_commande: 2,
        //         prix_total: 200
        //     };

        //     db.query.mockImplementation((query, values, callback) => {
        //         callback(null, { affectedRows: 1 });
        //     });

        //     const resultCallback = jest.fn();
        //     Commande.updateById(1, updatedCommande, resultCallback);

        //     expect(db.query).toHaveBeenCalledWith(
        //         "UPDATE commandes SET id_client = ?, id_produit = ?, quantite = ?, date_commande = ?, statut_commande = ?, prix_total = ? WHERE id = ?",
        //         [updatedCommande.id_client, updatedCommande.id_produit, updatedCommande.quantite, updatedCommande.date_commande, updatedCommande.statut_commande, updatedCommande.prix_total, 1],
        //         expect.any(Function)
        //     );
        //     expect(resultCallback).toHaveBeenCalledWith(null, {
        //         id: 1,
        //         ...updatedCommande
        //     });
        // });

        it('devrait gérer le cas où la commande à mettre à jour n\'est pas trouvée', () => {
            db.query.mockImplementation((query, values, callback) => {
                callback(null, { affectedRows: 0 });
            });

            const resultCallback = jest.fn();
            Commande.updateById(1, {}, resultCallback);

            expect(db.query).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
            expect(resultCallback).toHaveBeenCalledWith({ kind: 'not_found' }, null);
        });

        it('devrait gérer une erreur lors de la mise à jour de la commande', () => {
            const errorMessage = 'Erreur lors de la mise à jour';

            db.query.mockImplementation((query, values, callback) => {
                callback(new Error(errorMessage), null);
            });

            const resultCallback = jest.fn();
            Commande.updateById(1, {}, resultCallback);

            expect(db.query).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
            expect(resultCallback).toHaveBeenCalledWith(null, expect.any(Error));
        });
    });

    describe('remove', () => {
        it('devrait supprimer une commande avec succès', () => {
            db.query.mockImplementation((query, values, callback) => {
                callback(null, { affectedRows: 1 });
            });

            const resultCallback = jest.fn();
            Commande.remove(1, resultCallback);

            expect(db.query).toHaveBeenCalledWith("DELETE FROM commandes WHERE id = ?", [1], expect.any(Function));
            expect(resultCallback).toHaveBeenCalledWith(null, { affectedRows: 1 });
        });

        it('devrait gérer le cas où la commande à supprimer n\'est pas trouvée', () => {
            db.query.mockImplementation((query, values, callback) => {
                callback(null, { affectedRows: 0 });
            });

            const resultCallback = jest.fn();
            Commande.remove(1, resultCallback);

            expect(db.query).toHaveBeenCalledWith("DELETE FROM commandes WHERE id = ?", [1], expect.any(Function));
            expect(resultCallback).toHaveBeenCalledWith({ kind: 'not_found' }, null);
        });

        it('devrait gérer une erreur lors de la suppression de la commande', () => {
            const errorMessage = 'Erreur lors de la suppression';

            db.query.mockImplementation((query, values, callback) => {
                callback(new Error(errorMessage), null);
            });

            const resultCallback = jest.fn();
            Commande.remove(1, resultCallback);

            expect(db.query).toHaveBeenCalledWith("DELETE FROM commandes WHERE id = ?", [1], expect.any(Function));
            expect(resultCallback).toHaveBeenCalledWith(null, expect.any(Error));
        });
    });

});

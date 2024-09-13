const request = require('supertest');
const express = require('express');
const commandesController = require('../controllers/commandesController');
const Commande = require('../models/commande');
const { publishToQueue, consumeFromQueue } = require('../config/rabbitmq');

jest.mock('../models/commande');
jest.mock('../config/rabbitmq');
jest.spyOn(console, 'log').mockImplementation(() => {}); 

const app = express();
app.use(express.json());
app.post('/create', commandesController.create);
app.get('/order', commandesController.findAll);
app.get('/order/:id_commande', commandesController.findOne);
app.put('/order/:id_commande', commandesController.update);
app.delete('/order/:id_commande', commandesController.delete);

describe('Contrôleur des commandes', () => {

    describe('create', () => {
        it('devrait retourner 400 si les champs requis sont manquants', async () => {
            const res = await request(app)
                .post('/create')
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Le contenu ne peut pas être vide !");
        });
    });

    describe('createOrderAfterValidation', () => {
        it('devrait créer une commande si le produit est disponible', () => {
            const mockMessage = JSON.stringify({
                status: 'available',
                client_id: 1,
                product_id: 2,
                requested_quantity: 5,
                prix_total: 100
            });

            Commande.create.mockImplementationOnce((newCommande, callback) => callback(null, newCommande));
            publishToQueue.mockResolvedValueOnce();

            commandesController.createOrderAfterValidation(mockMessage);

            expect(Commande.create).toHaveBeenCalledWith(expect.any(Object), expect.any(Function));
            expect(publishToQueue).toHaveBeenCalledWith('order_creation_queue', expect.any(String));
        });

        it('devrait ne pas créer une commande si le produit est en rupture de stock', () => {
            const mockMessage = JSON.stringify({
                status: 'unavailable',
                product_id: 2
            });

            Commande.create.mockClear();

            commandesController.createOrderAfterValidation(mockMessage);

            expect(Commande.create).not.toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith(`Le produit 2 est en rupture de stock.`);
        });

        it('devrait ne pas créer une commande si le produit n\'existe pas', () => {
            const mockMessage = JSON.stringify({
                status: 'not_found',
                product_id: 2
            });

            Commande.create.mockClear();

            commandesController.createOrderAfterValidation(mockMessage);

            expect(Commande.create).not.toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith(`Le produit 2 n'existe pas.`);
        });
    });

    describe('findAll', () => {
        it('devrait retourner toutes les commandes', async () => {
            Commande.getAll.mockImplementationOnce((callback) => callback(null, [{ id_commande: 1 }]));
            const res = await request(app).get('/order');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([{ id_commande: 1 }]);
        });

        it('devrait retourner 500 si une erreur survient lors de la récupération des commandes', async () => {
            Commande.getAll.mockImplementationOnce((callback) => callback(new Error('Erreur lors de la récupération')));
            const res = await request(app).get('/order');
            expect(res.status).toBe(500);
            expect(res.body.message).toBe("Erreur lors de la récupération");
        });
    });

    describe('findOne', () => {
        it('devrait retourner une commande spécifique', async () => {
            Commande.findById.mockImplementationOnce((id_commande, callback) => callback(null, { id_commande: 1 }));
            const res = await request(app).get('/order/1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ id_commande: 1 });
        });

        it('devrait retourner une erreur si la commande n\'est pas trouvée', async () => {
            Commande.findById.mockImplementationOnce((id_commande, callback) => callback({ kind: 'not_found' }, null));
            const res = await request(app).get('/order/1');
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Commande non trouvée avec l'id 1");
        });

        it('devrait retourner une erreur 500 si une erreur survient lors de la connexion à la base de données', async () => {
            Commande.findById.mockImplementationOnce((id_commande, callback) => callback(new Error('Erreur de connexion')));
            const res = await request(app).get('/order/1');
            expect(res.status).toBe(500);
            expect(res.body.message).toBe("Erreur de connexion à la base de données");
        });
    });

    describe('update', () => {
        it('devrait retourner 404 si la commande à mettre à jour n\'est pas trouvée', async () => {
            Commande.updateById.mockImplementationOnce((id_commande, commande, callback) => callback({ kind: "not_found" }));
            const res = await request(app)
                .put('/order/1')
                .send({ quantite: 10 });
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Commande non trouvée avec l'id_commande 1.");
        });

        it('devrait retourner une erreur 500 si une erreur survient lors de la mise à jour de la commande', async () => {
            Commande.updateById.mockImplementationOnce((id_commande, commande, callback) => callback(new Error('Erreur de mise à jour')));
            const res = await request(app).put('/order/1').send({ quantite: 10 });
            expect(res.status).toBe(500);
            expect(res.body.message).toBe("Erreur de mise à jour de la commande");
        });
    });

    describe('delete', () => {
        it('devrait supprimer une commande avec succès', async () => {
            Commande.remove.mockImplementationOnce((id_commande, callback) => callback(null, { message: "Commande supprimée" }));
            const res = await request(app).delete('/order/1');
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("La commande a été supprimée avec succès !");
        });

        it('devrait retourner 404 si la commande à supprimer n\'est pas trouvée', async () => {
            Commande.remove.mockImplementationOnce((id_commande, callback) => callback({ kind: "not_found" }));
            const res = await request(app).delete('/order/1');
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Commande non trouvée avec l'id_commande 1.");
        });

        it('devrait retourner une erreur 500 si une erreur survient lors de la suppression de la commande', async () => {
            Commande.remove.mockImplementationOnce((id_commande, callback) => callback(new Error('Erreur de suppression')));
            const res = await request(app).delete('/order/1');
            expect(res.status).toBe(500);
            expect(res.body.message).toBe("Impossible de supprimer la commande");
        });
    });
});

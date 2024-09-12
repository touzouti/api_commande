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
app.get('/order/:id_client/:id_produit', commandesController.findOne);
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

        // it('devrait publier un message de validation de produit dans RabbitMQ et retourner 200', async () => {
        //     publishToQueue.mockResolvedValueOnce();
        //     const res = await request(app)
        //         .post('/create')
        //         .send({ id_client: 1, id_produit: 2, quantite: 5, prix_total: 100 });

        //     expect(res.status).toBe(200);
        //     expect(res.body.message).toBe("Votre commande est en attente de validation de produit.");
        //     expect(publishToQueue).toHaveBeenCalledWith('product_validation_queue', expect.any(String));
        // });
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
        
            Commande.create.mockClear(); // Ajout d'un mockClear pour s'assurer qu'aucun appel précédent n'interfère
        
            commandesController.createOrderAfterValidation(mockMessage);
        
            expect(Commande.create).not.toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith(`Le produit 2 est en rupture de stock.`);
        });


        it('devrait ne pas créer une commande si le produit n\'existe pas', () => {
          const mockMessage = JSON.stringify({
              status: 'not_found',
              product_id: 2
          });
      
          Commande.create.mockClear(); // Nettoyer le mock avant chaque test
      
          commandesController.createOrderAfterValidation(mockMessage);
      
          expect(Commande.create).not.toHaveBeenCalled();
          expect(console.log).toHaveBeenCalledWith(`Le produit 2 n'existe pas`);
      });
    });

    // describe('consumeFromQueue', () => {
    //     it('devrait consommer un message de RabbitMQ et appeler createOrderAfterValidation', () => {
    //         const mockMessage = JSON.stringify({
    //             status: 'available',
    //             client_id: 1,
    //             product_id: 2,
    //             requested_quantity: 5,
    //             prix_total: 100
    //         });

    //         commandesController.createOrderAfterValidation = jest.fn();
    //         consumeFromQueue.mockImplementation((queueName, callback) => {
    //             callback(mockMessage);
    //         });

    //         expect(commandesController.createOrderAfterValidation).toHaveBeenCalledWith(mockMessage);
    //     });
    // });

    describe('findAll', () => {
        it('devrait retourner toutes les commandes', async () => {
            Commande.getAll.mockImplementationOnce((callback) => callback(null, [{ id_commande: 1 }]));
            const res = await request(app).get('/order');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([{ id_commande: 1 }]);
        });

        it('devrait retourner 404 si une erreur survient lors de la récupération des commandes', async () => {
          const errorMessage = undefined;
      
          Commande.getAll.mockImplementationOnce((callback) => callback(new Error(errorMessage)));
      
          const res = await request(app).get('/commandes');
          expect(res.status).toBe(404);
          // Assurez-vous que le message d'erreur dans le test correspond à celui renvoyé
          expect(res.body.message).toBe(errorMessage);
      });
    });

    describe('findOne', () => {
        it('devrait retourner une commande spécifique', async () => {
            Commande.findById.mockImplementationOnce((id_client, id_produit, callback) => callback(null, { id_commande: 1 }));
            const res = await request(app).get('/order/1/2');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ id_commande: 1 });
        });

        it('devrait retourner 404 si la commande n\'est pas trouvée', async () => {
            Commande.findById.mockImplementationOnce((id_client, id_produit, callback) => callback({ kind: "not_found" }));
            const res = await request(app).get('/order/1/2');
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Commande non trouvée avec l'id_client 1 et l'id_produit 2.");
        });

        it('devrait retourner une erreur 500 si une erreur survient lors de la connexion à la base de données', async () => {
            Commande.findById.mockImplementationOnce((id_client, id_produit, callback) => callback(new Error('Erreur de connexion')));
            const res = await request(app).get('/order/1/2');
            expect(res.status).toBe(500);
            expect(res.body.message).toBe("Erreur de connexion à la base de données");
        });
    });

    describe('update', () => {
      // it('devrait mettre à jour une commande avec succès', () => {
      //       const updatedCommande = {
      //           id_client: 1,
      //           id_produit: 2,
      //           quantite: 10,
      //           date_commande: new Date(),
      //           prix_total: 200
      //       };

      //       db.query.mockImplementation((query, values, callback) => {
      //           callback(null, { affectedRows: 1 });
      //       });

      //       const resultCallback = jest.fn();
      //       Commande.updateById(1, updatedCommande, resultCallback);

      //       expect(db.query).toHaveBeenCalledWith(
      //           "UPDATE commandes SET id_client = ?, id_produit = ?, quantite = ?, date_commande = ?, statut_commande = ?, prix_total = ? WHERE id = ?",
      //           [updatedCommande.id_client, updatedCommande.id_produit, updatedCommande.quantite, updatedCommande.date_commande, null, updatedCommande.prix_total, 1],
      //           expect.any(Function)
      //       );

      //       // Mettez à jour l'objet attendu pour correspondre à ce qui est réellement renvoyé
      //       expect(resultCallback).toHaveBeenCalledWith(null, {
      //           id: 1,
      //           ...updatedCommande
      //       });
      //   });


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

const request = require('supertest');
const express = require('express');
const commandesRoutes = require('../routes/commandesRoutes');
const Commande = require('../models/commande');

jest.mock('../models/commande');

const app = express();
app.use(express.json());
app.use('/api/commandes', commandesRoutes);

describe('Contrôleur Commandes', () => {
  // Test pour la création d'une commande
  it('devrait créer une nouvelle commande', async () => {
    const nouvelleCommande = { id_client: 1, id_produit: 1, quantite: 2, date_commande: '2024-01-01', statut_commande: 'en cours', prix_total: 100 };
    Commande.create.mockImplementation((commande, callback) => {
      callback(null, { id_commande: 1, ...commande });
    });

    const res = await request(app).post('/api/commandes').send(nouvelleCommande);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id_commande');
  });

  it('devrait retourner une erreur si le corps de la requête est vide lors de la création', async () => {
    const res = await request(app).post('/api/commandes').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Le contenu ne peut pas être vide !');
  });

  it('devrait retourner une erreur si la création échoue', async () => {
    Commande.create.mockImplementation((commande, callback) => {
      callback(new Error('Le contenu ne peut pas être vide !'), null);
    });
  
    const res = await request(app).post('/api/commandes').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Le contenu ne peut pas être vide !');
  });

  // Test pour la récupération de toutes les commandes
  it('devrait récupérer toutes les commandes', async () => {
    const commandes = [{ id_client: 1, id_produit: 1, quantite: 2 }];
    Commande.getAll.mockImplementation((callback) => {
      callback(null, commandes);
    });

    const res = await request(app).get('/api/commandes');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(commandes);
  });

  it('devrait retourner une erreur si la récupération de toutes les commandes échoue', async () => {
    Commande.getAll.mockImplementation((callback) => {
      callback(new Error('Erreur de connexion à la base de données'), null);
    });

    const res = await request(app).get('/api/commandes');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Erreur de connexion à la base de données');
  });

  // Test pour la récupération d'une commande spécifique
  it('devrait récupérer une commande par id_client et id_produit', async () => {
    const commande = { id_client: 1, id_produit: 1, quantite: 2 };
    Commande.findById.mockImplementation((id_client, id_produit, callback) => {
      callback(null, commande);
    });

    const res = await request(app).get('/api/commandes/1/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(commande);
  });

  it('devrait retourner une erreur si la commande n\'est pas trouvée', async () => {
    Commande.findById.mockImplementation((id_client, id_produit, callback) => {
      callback({ kind: 'not_found' }, null);
    });

    const res = await request(app).get('/api/commandes/1/1');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Commande non trouvée avec l\'id_client 1 et l\'id_produit 1.');
  });

  it('devrait retourner une erreur si la mise à jour échoue', async () => {
    Commande.updateById.mockImplementation((id_client, id_produit, commande, callback) => {
      callback(new Error('Erreur de connexion à la base de données'), null);
    });
  
    const res = await request(app).put('/api/commandes/1/1').send({ quantite: 5 });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Erreur de connexion à la base de données');
  });
  
  

  it('devrait retourner une erreur si le corps de la requête est vide lors de la mise à jour', async () => {
    const res = await request(app).put('/api/commandes/1/1').send({});
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Erreur de connexion à la base de données');
  });

  it('devrait retourner une erreur si la commande à mettre à jour n\'est pas trouvée', async () => {
    Commande.updateById.mockImplementation((id_client, id_produit, commande, callback) => {
      callback({ kind: 'not_found' }, null);
    });

    const res = await request(app).put('/api/commandes/1/1').send({ quantite: 5 });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Commande non trouvée avec l\'id_client 1 et l\'id_produit 1.');
  });

  it('devrait retourner une erreur si la mise à jour échoue', async () => {
    Commande.updateById.mockImplementation((id_client, id_produit, commande, callback) => {
      callback(new Error('Erreur de connexion à la base de données'), null);
    });

    const res = await request(app).put('/api/commandes/1/1').send({ quantite: 5 });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Erreur de connexion à la base de données');
  });

  // Test pour la suppression d'une commande
  it('devrait supprimer une commande', async () => {
    Commande.remove.mockImplementation((id_client, id_produit, callback) => {
      callback(null, { affectedRows: 1 });
    });

    const res = await request(app).delete('/api/commandes/1/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'La commande a été supprimée avec succès !');
  });

  it('devrait retourner une erreur si la commande à supprimer n\'est pas trouvée', async () => {
    Commande.remove.mockImplementation((id_client, id_produit, callback) => {
      callback({ kind: 'not_found' }, null);
    });

    const res = await request(app).delete('/api/commandes/1/1');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Commande non trouvée avec l\'id_client 1 et l\'id_produit 1.');
  });

  it('devrait retourner une erreur si la suppression échoue', async () => {
    Commande.remove.mockImplementation((id_client, id_produit, callback) => {
      callback(new Error('Impossible de supprimer la commande'), null);
    });

    const res = await request(app).delete('/api/commandes/1/1');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Impossible de supprimer la commande');
  });
});

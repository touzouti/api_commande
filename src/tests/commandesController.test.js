const request = require('supertest');
const express = require('express');
const commandesRoutes = require('../routes/commandesRoutes');
const Commande = require('../models/commande');

jest.mock('../models/commande');

const app = express();
app.use(express.json());
app.use('/api/commandes', commandesRoutes);

describe('Contrôleur Commandes', () => {
  it('devrait créer une nouvelle commande', async () => {
    const nouvelleCommande = { id_client: 1, id_produit: 1, quantite: 2, date_commande: '2024-01-01', statut_commande: 'en cours', prix_total: 100 };
    Commande.create.mockImplementation((commande, callback) => {
      callback(null, { id_commande: 1, ...commande });
    });

    const res = await request(app).post('/api/commandes').send(nouvelleCommande);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id_commande');
  });

  it('devrait récupérer toutes les commandes', async () => {
    const commandes = [{ id_client: 1, id_produit: 1, quantite: 2 }];
    Commande.getAll.mockImplementation((callback) => {
      callback(null, commandes);
    });

    const res = await request(app).get('/api/commandes');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(commandes);
  });

  it('devrait récupérer une commande par id_client et id_produit', async () => {
    const commande = { id_client: 1, id_produit: 1, quantite: 2 };
    Commande.findById.mockImplementation((id_client, id_produit, callback) => {
      callback(null, commande);
    });

    const res = await request(app).get('/api/commandes/1/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(commande);
  });

  it('devrait supprimer une commande', async () => {
    Commande.remove.mockImplementation((id_client, id_produit, callback) => {
      callback(null, { affectedRows: 1 });
    });

    const res = await request(app).delete('/api/commandes/1/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'La commande a été supprimée avec succès !');
  });
});

const request = require('supertest');
const express = require('express');
const commandesRoutes = require('../routes/commandesRoutes');
const Commande = require('../models/commande');

jest.mock('../models/commande');

const app = express();
app.use(express.json());
app.use('/api/commandes', commandesRoutes);

describe('Commandes Controller', () => {
  it('should create a new commande', async () => {
    const newCommande = { id_client: 1, id_produit: 1, quantite: 2, date_commande: '2024-01-01', statut_commande: 'en cours', prix_total: 100 };
    Commande.create.mockImplementation((commande, callback) => {
      callback(null, { id_commande: 1, ...commande });
    });

    const res = await request(app).post('/api/commandes').send(newCommande);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id_commande');
  });

  it('should get all commandes', async () => {
    const commandes = [{ id_client: 1, id_produit: 1, quantite: 2 }];
    Commande.getAll.mockImplementation((callback) => {
      callback(null, commandes);
    });

    const res = await request(app).get('/api/commandes');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(commandes);
  });

  it('should get a commande by id', async () => {
    const commande = { id_client: 1, id_produit: 1, quantite: 2 };
    Commande.findById.mockImplementation((id_client, id_produit, callback) => {
      callback(null, commande);
    });

    const res = await request(app).get('/api/commandes/1/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(commande);
  });



  it('should delete a commande', async () => {
    Commande.remove.mockImplementation((id_client, id_produit, callback) => {
      callback(null, { affectedRows: 1 });
    });

    const res = await request(app).delete('/api/commandes/1/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'La commande a été supprimée avec succès !');
  });
});

const db = require('../config/db.config');
const Commande = require('../models/commande');

jest.mock('../config/db.config');

describe('Modèle Commande', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait créer une nouvelle commande', (done) => {
    const nouvelleCommande = { 
      id_client: 1, 
      id_produit: 1, 
      quantite: 2, 
      date_commande: '2024-01-01', 
      statut_commande: 'en cours', 
      prix_total: 100 
    };
    
    db.query.mockImplementation((query, values, callback) => {
      callback(null, { insertId: 1 });
    });

    Commande.create(nouvelleCommande, (err, data) => {
      try {
        expect(err).toBeNull();
        expect(data).toEqual({ id_commande: 1, ...nouvelleCommande });
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('devrait retourner une erreur lorsque la base de données échoue à créer une commande', (done) => {
    const nouvelleCommande = { 
      id_client: 1, 
      id_produit: 1, 
      quantite: 2, 
      date_commande: '2024-01-01', 
      statut_commande: 'en cours', 
      prix_total: 100 
    };
    
    db.query.mockImplementation((query, values, callback) => {
      callback(new Error('Erreur de connexion à la base de données'), null);
    });

    Commande.create(nouvelleCommande, (err, data) => {
      try {
        expect(err).not.toBeNull();
        expect(err.message).toEqual('Erreur de connexion à la base de données');
        expect(data).toBeNull();
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('devrait trouver une commande par id_client et id_produit', (done) => {
    const mockCommande = { 
      id_client: 1, 
      id_produit: 1, 
      quantite: 2, 
      date_commande: '2024-01-01', 
      statut_commande: 'en cours', 
      prix_total: 100 
    };
    
    db.query.mockImplementation((query, values, callback) => {
      callback(null, [mockCommande]);
    });

    Commande.findById(1, 1, (err, data) => {
      try {
        expect(err).toBeNull();
        expect(data).toEqual(mockCommande);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('devrait retourner une erreur lorsque la base de données échoue à trouver une commande', (done) => {
    db.query.mockImplementation((query, values, callback) => {
      callback(new Error('Erreur de connexion à la base de données'), null);
    });

    Commande.findById(1, 1, (err, data) => {
      try {
        expect(err).not.toBeNull();
        expect(err.message).toEqual('Erreur de connexion à la base de données');
        expect(data).toBeNull();
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('devrait supprimer une commande par id_client et id_produit', (done) => {
    db.query.mockImplementation((query, values, callback) => {
      callback(null, { affectedRows: 1 });
    });

    Commande.remove(1, 1, (err, data) => {
      try {
        expect(err).toBeNull();
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('devrait retourner une erreur lorsque la base de données échoue à supprimer une commande', (done) => {
    db.query.mockImplementation((query, values, callback) => {
      callback(new Error('Erreur de connexion à la base de données'), null);
    });

    Commande.remove(1, 1, (err, data) => {
      try {
        expect(err).not.toBeNull();
        expect(err.message).toEqual('Erreur de connexion à la base de données');
        expect(data).toBeNull();
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});

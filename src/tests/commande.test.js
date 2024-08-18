const db = require('../config/db.config');
const Commande = require('../models/commande');

jest.mock('../config/db.config');

describe('Commande Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new commande', (done) => {
    const newCommande = { id_client: 1, id_produit: 1, quantite: 2, date_commande: '2024-01-01', statut_commande: 'en cours', prix_total: 100 };
    db.query.mockImplementation((query, values, callback) => {
      callback(null, { insertId: 1 });
    });

    Commande.create(newCommande, (err, data) => {
      expect(err).toBeNull();
      expect(data).toEqual({ id_commande: 1, ...newCommande });
      done();
    });
  });

  it('should find a commande by id_client and id_produit', (done) => {
    const mockCommande = { id_client: 1, id_produit: 1, quantite: 2, date_commande: '2024-01-01', statut_commande: 'en cours', prix_total: 100 };
    db.query.mockImplementation((query, values, callback) => {
      callback(null, [mockCommande]);
    });

    Commande.findById(1, 1, (err, data) => {
      expect(err).toBeNull();
      expect(data).toEqual(mockCommande);
      done();
    });
  });



  it('should delete a commande by id_client and id_produit', (done) => {
    db.query.mockImplementation((query, values, callback) => {
      callback(null, { affectedRows: 1 });
    });

    Commande.remove(1, 1, (err, data) => {
      expect(err).toBeNull();
      done();
    });
  });
});

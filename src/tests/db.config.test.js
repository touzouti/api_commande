const dbConn = require('../config/db.config');

describe('Connexion à la base de données', () => {
  beforeAll((done) => {
    dbConn.connect((err) => {
      if (err) return done(err);
      done();
    });
  });

  afterAll((done) => {
    dbConn.end((err) => {
      if (err) return done(err);
      done();
    });
  });

  it('devrait se connecter à la base de données sans erreur', () => {
    expect(dbConn.state).toBe('connected');
  });

  it('devrait retourner une erreur si la connexion échoue', (done) => {
    dbConn.connect.mockImplementation((callback) => {
      callback(new Error('Erreur de connexion'));
    });
  
    dbConn.connect((err) => {
      expect(err).not.toBeNull();
      expect(err.message).toBe('Erreur de connexion');
      done();
    });
  });
  
  it('devrait retourner une erreur si la fermeture échoue', (done) => {
    dbConn.end.mockImplementation((callback) => {
      callback(new Error('Erreur de fermeture'));
    });
  
    dbConn.end((err) => {
      expect(err).not.toBeNull();
      expect(err.message).toBe('Erreur de fermeture');
      done();
    });
  });
  
});

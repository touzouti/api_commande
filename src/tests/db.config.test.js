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
});

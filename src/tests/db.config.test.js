const mysql = require('mysql');
jest.mock('mysql');

const mockConnect = jest.fn((callback) => callback(null));
const mockEnd = jest.fn((callback) => callback(null));

mysql.createConnection.mockReturnValue({
  connect: mockConnect,
  end: mockEnd,
  state: 'connected',
});

const dbConn = require('../config/db.config');

describe('Connexion à la base de données', () => {
  it('devrait se connecter à la base de données sans erreur', () => {
    expect(dbConn.state).toBe('connected');
    expect(mockConnect).toHaveBeenCalled();
  });

  it('devrait retourner une erreur si la connexion échoue', (done) => {
    mockConnect.mockImplementationOnce((callback) => {
      callback(new Error('Erreur de connexion'));
    });

    dbConn.connect((err) => {
      expect(err).not.toBeNull();
      expect(err.message).toBe('Erreur de connexion');
      done();
    });
  });

  it('devrait retourner une erreur si la fermeture échoue', (done) => {
    mockEnd.mockImplementationOnce((callback) => {
      callback(new Error('Erreur de fermeture'));
    });

    dbConn.end((err) => {
      expect(err).not.toBeNull();
      expect(err.message).toBe('Erreur de fermeture');
      done();
    });
  });
});

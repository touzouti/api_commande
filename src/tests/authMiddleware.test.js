const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios');
jest.mock('axios');

describe('Middleware d\'authentification', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  it('devrait retourner 403 si aucun token n\'est fourni', () => {
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({ message: 'Aucun token fourni !' });
  });

  it('devrait retourner 500 si la vérification du token échoue', async () => {
    req.headers['x-access-token'] = 'invalid_token';
    axios.get.mockRejectedValue(new Error('Token error'));

    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Un problème est survenu lors de la vérification du token !',
      error: 'Token error'
    });
  });

  it('devrait appeler next si le token est valide', async () => {
    req.headers['x-access-token'] = 'valid_token';
    axios.get.mockResolvedValue({ status: 200 });

    await authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('devrait retourner 401 si le token est expiré', async () => {
    req.headers['x-access-token'] = 'expired_token';
    axios.get.mockResolvedValue({ status: 401 });
  
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Token expiré ou invalide',
    });
  });
  
});

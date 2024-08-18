const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios');
jest.mock('axios');

describe('Auth Middleware', () => {
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

  it('should return 403 if no token is provided', () => {
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({ message: 'Aucun token fourni !' });
  });

  it('should return 500 if token verification fails', async () => {
    req.headers['x-access-token'] = 'invalid_token';
    axios.get.mockRejectedValue(new Error('Token error'));

    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Un problème est survenu lors de la vérification du token !',
      error: 'Token error'
    });
  });

  it('should call next if token is valid', async () => {
    req.headers['x-access-token'] = 'valid_token';
    axios.get.mockResolvedValue({ status: 200 });

    await authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

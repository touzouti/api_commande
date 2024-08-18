let server;

beforeAll(() => {
  server = require('../app');
});

afterAll((done) => {
  server.close(done); // Fermez le serveur après les tests
});

describe('App Initialization', () => {
  it('should respond with a welcome message at the root route', async () => {
    const res = await request(server).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ message: "Bienvenue dans notre application API Commande" });
  });

  it('should handle invalid routes', async () => {
    const res = await request(server).get('/invalid-route');
    expect(res.statusCode).toEqual(404);
  });
});

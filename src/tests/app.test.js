const request = require('supertest');
const app = require('../app');

let server;

beforeAll(() => {
  server = app.listen(); // Démarre le serveur sur un port aléatoire
});

afterAll((done) => {
  server.close(done); // Ferme le serveur après les tests
});

describe('Initialisation de l\'application', () => {
  it('devrait répondre avec un message de bienvenue à la route racine', async () => {
    const res = await request(server).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ message: "Bienvenue dans notre application API Commande" });
  });

  it('devrait gérer les routes invalides', async () => {
    const res = await request(server).get('/invalid-route');
    expect(res.statusCode).toEqual(404);
  });
});

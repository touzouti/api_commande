const dbConn = require('../config/db.config');

describe('Database Connection', () => {
  beforeAll((done) => {
    dbConn.connect((err) => {
      done(err);
    });
  });

  afterAll((done) => {
    dbConn.end((err) => {
      done(err);
    });
  });


});

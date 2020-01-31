/* eslint-disable quotes */
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Games Endpoints', function() {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testGames = helpers.makeGamesArray();
  const testUser = testUsers[0];
  const secondTestUser = testUsers[1];

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe(`POST /api/games`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    it(`responds with a 400 when the game_room isn't supplied in the request body`, () => {
      return supertest(app)
        .post('/api/games')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send({})
        .expect(400, {
          message: 'game_room must be supplied in the request body'
        });
    });
    it(`responds with a 201 when the game_room is supplied in the request body`, () => {
      return supertest(app)
        .post('/api/games')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send({ game_room: 'fne3qwrfq78fna' })
        .expect(201);
    });
  });

  describe(`GET /api/games/:game_room`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert games', () => helpers.seedGames(db, testGames));
    it(`responds with a 404 when the game doesn't exist`, () => {
      return supertest(app)
        .get('/api/games/game999')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(404);
    });
    it(`responds with a 200 when a game does exist`, () => {
      return supertest(app)
        .get('/api/games/game1')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200);
    });
  });
  describe(`POST /api/games/:game_room`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert games', () => helpers.seedGames(db, testGames));
    it(`responds with a 401 unauthorized when a player sends a request without a auth token`, () => {
      return supertest(app)
        .post(`/api/games/game1`)
        .expect(401);
    });
    it(`responds with a 200 when a game_room and player is supplied`, () => {
      return supertest(app)
        .post(`/api/games/game1`)
        .set('Authorization', helpers.makeAuthHeader(secondTestUser))
        .expect(200);
    });
  });
  describe(`PATCH /api/games/:game_room`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert games', () => helpers.seedGames(db, testGames));

    it(`responds with a 201 when the game_room is supplied in the request body`, () => {
      return supertest(app)
        .patch('/api/games/game1')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send({
          board: 'X0000O000',
          next_player: '2'
        })
        .expect(201);
    });
    it(`responds with a 404 not found when the game_room isn't supplied in the request body`, () => {
      return supertest(app)
        .patch('/api/games')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send({
          board: 'X0000O000',
          next_player: '2'
        })
        .expect(404);
    });
  });
});

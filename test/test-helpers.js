const knex = require('knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * create a knex instance connected to postgres
 * @returns {knex instance}
 */
function makeKnexInstance() {
  return knex({
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL
  });
}

/**
 * create a knex instance connected to postgres
 * @returns {array} of user objects
 */
function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      password: 'password'
    },
    {
      id: 2,
      user_name: 'test-user-2',
      password: 'password'
    }
  ];
}

function makeGamesArray() {
  return [
    {
      game_id: 1,
      game_room: 'game1',
      date_created: '2020-01-30T23:34:20.352Z',
      player_one_id: 1,
      player_one_usrname: 'test-user-1',
      player_one_score: 0,
      player_two_id: null,
      player_two_usrname: null,
      player_two_score: 0,
      current_player: 1,
      board: '000000000',
      round: 0
    },
    {
      game_id: 2,
      game_room: 'game2',
      date_created: '2020-01-30T23:34:20.352Z',
      player_one_id: 1,
      player_one_usrname: 'test-user-1',
      player_one_score: 0,
      player_two_id: 2,
      player_two_usrname: 'test-user-2',
      player_two_score: 0,
      current_player: 2,
      board: '0X0000000',
      round: 0
    }
  ];
}

/**
 * generate fixtures of languages and words for a given user
 * @param {object} user - contains `id` property
 */

/**
 * make a bearer token with jwt for authorization header
 * @param {object} user - contains `id`, `username`
 * @param {string} secret - used to create the JWT
 * @returns {string} - for HTTP authorization header
 */
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256'
  });
  return `Bearer ${token}`;
}

/**
 * remove data from tables and reset sequences for SERIAL id fields
 * @param {knex instance} db
 * @returns {Promise} - when tables are cleared
 */
function cleanTables(db) {
  return db.transaction((trx) =>
    trx
      .raw(
        `TRUNCATE
        "users",
        "game_session"
        CASCADE
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('users_id_seq', 0)`),

          trx.raw(
            `ALTER SEQUENCE game_session_game_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(`SELECT setval('game_session_game_id_seq', 0)`)
        ])
      )
  );
}

/**
 * insert users into db with bcrypted passwords and update sequence
 * @param {knex instance} db
 * @param {array} users - array of user objects for insertion
 * @returns {Promise} - when users table seeded
 */
function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db.transaction(async (trx) => {
    await trx.into('users').insert(preppedUsers);
    await trx.raw(`SELECT setval('users_id_seq', ?)`, [
      users[users.length - 1].id
    ]);
  });
}

function seedGames(db, games) {
  return db.transaction(async (trx) => {
    await trx.into('game_session').insert(games);
    await trx.raw(`SELECT setval('game_session_game_id_seq', ?)`, [
      games[games.length - 1].game_id
    ]);
  });
}

/**
 * seed the databases with words and update sequence counter
 * @param {knex instance} db
 * @param {array} users - array of user objects for insertion
 * @returns {Promise} - when all tables seeded
 */

module.exports = {
  makeKnexInstance,
  makeUsersArray,
  makeGamesArray,
  makeAuthHeader,
  cleanTables,
  seedUsers,
  seedGames
};

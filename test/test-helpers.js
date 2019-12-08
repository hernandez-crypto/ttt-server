const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      full_name: 'Test user 1',
      nickname: 'TU1',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 2,
      user_name: 'test-user-2',
      full_name: 'Test user 2',
      nickname: 'TU2',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 3,
      user_name: 'test-user-3',
      full_name: 'Test user 3',
      nickname: 'TU3',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 4,
      user_name: 'test-user-4',
      full_name: 'Test user 4',
      nickname: 'TU4',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z',
    },
  ];
}

function makeGamesArray(users) {
  return [
    {
      id: 1,
      title: 'First test thing!',
      image: 'http://placehold.it/500x500',
      user_id: users[0].id,
      date_created: '2029-01-22T16:28:32.615Z',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 2,
      title: 'Second test thing!',
      image: 'http://placehold.it/500x500',
      user_id: users[1].id,
      date_created: '2029-01-22T16:28:32.615Z',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 3,
      title: 'Third test thing!',
      image: 'http://placehold.it/500x500',
      user_id: users[2].id,
      date_created: '2029-01-22T16:28:32.615Z',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 4,
      title: 'Fourth test thing!',
      image: 'http://placehold.it/500x500',
      user_id: users[3].id,
      date_created: '2029-01-22T16:28:32.615Z',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
  ];
}

function makeExpectedThing(users, thing, reviews = []) {
  const user = users.find(user => user.id === thing.user_id);

  const thingReviews = reviews.filter(review => review.thing_id === thing.id);

  const number_of_reviews = thingReviews.length;
  const average_review_rating = calculateAverageReviewRating(thingReviews);

  return {
    id: thing.id,
    image: thing.image,
    title: thing.title,
    content: thing.content,
    date_created: thing.date_created,
    number_of_reviews,
    average_review_rating,
    user: {
      id: user.id,
      user_name: user.user_name,
      full_name: user.full_name,
      nickname: user.nickname,
      date_created: user.date_created,
    },
  };
}

function makeGamesFixtures() {
  const testUsers = makeUsersArray();
  const testThings = makeGamesArray(testUsers);
  return { testUsers, testGames };
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      thingful_things,
      thingful_users,
      thingful_reviews
      RESTART IDENTITY CASCADE`
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into('thingful_users')
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(`SELECT setval('thingful_users_id_seq', ?)`, [
        users[users.length - 1].id,
      ])
    );
}

function seedGamesTables(db, users, things, reviews = []) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users);

    await trx.into('thingful_things').insert(things);
    // update the auto sequence to match the forced id values

    await trx.raw(`SELECT setval('thingful_things_id_seq', ?)`, [
      things[things.length - 1].id,
    ]);
    await trx.into('thingful_reviews').insert(reviews);
    // only insert reviews if there are some, also update the sequence counter
  });
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256',
  });

  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeThingsArray,
  makeExpectedThing,
  makeExpectedThingReviews,
  makeMaliciousThing,
  makeReviewsArray,

  makeGamesFixtures,
  cleanTables,
  seedThingsTables,
  seedMaliciousThing,
  makeAuthHeader,
  seedUsers,
};

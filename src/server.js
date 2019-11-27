require('dotenv').config();

const knex = require('knex');
const app = require('./app');
let { PORT, DB_URL } = require('./config');

const db = knex({
  client: 'pg',
  connection: DB_URL,
});

app.set('db', db);

PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

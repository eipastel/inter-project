// Este arquivo mantém as configurações do banco de dados
const postgres = require('postgres');
const dotenv = require('dotenv');

dotenv.config();

const db = postgres({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: 5432,
  ssl: 'require',
  connection: {
    options: `project=${process.env.ENDPOINT_ID}`,
  },
});

module.exports = db;
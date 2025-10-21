import knex from 'knex';
import knexfile from '../knexfile.js';

const db = knex(knexfile.production);

export { db };
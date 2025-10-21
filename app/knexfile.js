// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  production: {
    client: 'sqlite3',
    connection: {
      filename: './s7-db.sqlite3'
    },
    useNullAsDefault: true,
  }
};

import knex from 'knex';

export default knex({
  client: process.env.DB_CLIENT,
  connection: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    timezone: 'Z',
    typeCast: (field: any, next: any) => {
      if (field.type === 'TINY' && field.length === 1) {
        // Convert tinyint fields to booleans
        return field.string() === '1';
      }
      return next();
    },
  },
  pool: { min: 2, max: 50 },
});

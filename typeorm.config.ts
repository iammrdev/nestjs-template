import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'ep-empty-math-a2w76lj7.eu-central-1.aws.neon.tech',
  port: 5432,
  username: 'iashchuk.dev',
  password: '5BAkQKN3XvEq',
  database: 'neondb',
  entities: ['src/**/postgresql/*.entity.ts'],
  migrations: ['migrations/*.ts'],
  extra: {
    ssl: 'true',
  },
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

export default AppDataSource;

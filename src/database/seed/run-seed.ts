// import dataSource from '../data-source';
import { seedAuthorization } from './authorization.seed';
import dataSource from '../data-source';

async function bootstrap() {
  await dataSource.initialize();

  try {
    await seedAuthorization(dataSource);

    console.log('Authorization seed completed');
  } finally {
    await dataSource.destroy();
  }
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});

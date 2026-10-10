// import dataSource from '../data-source';
import { seedAuthorization } from './authorization.seed';
import dataSource from '../data-source';
import { seedBootstrapAdmin } from './init-admin';

async function bootstrap() {
  await dataSource.initialize();

  try {
    await seedAuthorization(dataSource);
    await seedBootstrapAdmin(dataSource);
    // await seedBootstrapAdmin(dataSource);
    console.log('Authorization and bootstrap admin seed completed');
  } finally {
    await dataSource.destroy();
  }
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});

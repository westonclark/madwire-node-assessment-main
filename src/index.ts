import 'dotenv/config';
import buildServer from './infra/web/server';
import plugins from './infra/web/prod.plugins';
import { isDevelopment } from './infra/environment';

const start = async () => {
  try {
    const app = buildServer(
      {
        logger: {
          level: 'info',
          transport: {
            target: isDevelopment ? 'pino-pretty' : 'pino/file',
          },
        },
      },
      plugins
    );

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const host = process.env.ADDR || '127.0.0.1';

    await app.listen({ port, host });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
};

start();

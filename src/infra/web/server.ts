import fastify, { FastifyServerOptions } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { isProduction } from '../environment';
import { ServerPlugin } from './types';
import { BadRequestError, ResourceNotFoundError } from '../../errors';

export default function buildServer(
  opts: FastifyServerOptions = {},
  plugins: ServerPlugin[] = []
) {
  const GENERIC_ERROR_MSG = 'An error has occurred';
  const app = fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

  plugins.forEach(({ plugin, options }) => {
    app.register(plugin, options);
  });

  app.setNotFoundHandler((request, reply) => {
    reply
      .code(404)
      .send({ error: { message: `Route ${request.url} not found` } });
  });

  app.setErrorHandler((error, request, reply) => {
    if (error.validation || error instanceof BadRequestError) {
      // Fastify validation error
      reply.code(400).send({ error: { message: error.message } });
    } else if (error instanceof ResourceNotFoundError) {
      reply.code(404).send({ error: { message: error.message } });
    } else {
      reply.log.error({ err: error }, error.message ?? GENERIC_ERROR_MSG);
      reply.code(500).send({
        error: {
          message: isProduction
            ? `${GENERIC_ERROR_MSG} (${request.id})`
            : error.message,
        },
      });
    }
  });

  return app;
}

import { Type } from '@fastify/type-provider-typebox';

export const errorResponse = Type.Object({
  error: Type.Object({
    message: Type.String(),
    name: Type.Optional(Type.String()),
    code: Type.Optional(Type.String()),
  }),
});

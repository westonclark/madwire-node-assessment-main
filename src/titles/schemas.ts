import { Type } from '@fastify/type-provider-typebox';
import { errorResponse } from '../infra/web/schemas';

const TRecordId = Type.Number({
  minimum: 1,
  maximum: 2 ** 31 - 1, // max int32 is 2^31 - 1
});

export const titleSchema = Type.Object({
  employeeNumber: TRecordId,
  title: Type.String({ minLength: 1, maxLength: 50 }),
  fromDate: Type.String({ format: 'date' }),
  toDate: Type.Optional(
    Type.Union([Type.String({ format: 'date' }), Type.Null()])
  ),
});

export const partialTitleSchema = Type.Partial(titleSchema);

export const titleKeySchema = Type.Pick(titleSchema, [
  'employeeNumber',
  'title',
  'fromDate',
]);

export const createTitleSchema = {
  body: titleSchema,
  response: {
    '201': titleSchema,
    '4xx': errorResponse,
  },
};

export const patchTitleSchema = {
  params: titleKeySchema,
  body: partialTitleSchema,
  response: {
    '200': titleSchema,
    '4xx': errorResponse,
  },
};

export const deleteTitleSchema = {
  params: titleKeySchema,
  response: {
    '204': Type.Null(),
    '4xx': errorResponse,
  },
};

export const getTitleSchema = {
  params: titleKeySchema,
  response: {
    '200': titleSchema,
    '4xx': errorResponse,
  },
};

export const getTitlesSchema = {
  querystring: Type.Object({
    limit: Type.Optional(Type.Integer({ minimum: 1 })),
    employeeNumber: Type.Optional(TRecordId),
  }),
  response: {
    '200': Type.Array(titleSchema),
  },
};

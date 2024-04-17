import { Type } from '@fastify/type-provider-typebox';
import { errorResponse } from '../infra/web/schemas';

const TRecordId = Type.Integer({ minimum: 1, maximum: 2 ** 31 - 1 });

export const salarySchema = Type.Object({
  employeeNumber: Type.Integer(),
  salary: Type.Integer({ minimum: 1, maximum: 2 ** 31 - 1 }),
  fromDate: Type.String({ format: 'date' }),
  toDate: Type.String({ format: 'date' }),
});

export const salaryKeySchema = Type.Pick(salarySchema, [
  'employeeNumber',
  'fromDate',
]);

export const newSalarySchema = Type.Omit(salarySchema, ['employeeNumber']);
export const partialSalarySchema = Type.Partial(
  Type.Omit(salarySchema, ['employeeNumber'])
);

export const createSalarySchema = {
  body: salarySchema,
  response: {
    '2xx': salarySchema,
    '4xx': errorResponse,
  },
};

export const deleteSalarySchema = {
  params: salaryKeySchema,
  response: {
    '204': Type.Null(),
    '404': errorResponse,
  },
};

export const patchSalarySchema = {
  params: salaryKeySchema,
  body: partialSalarySchema,
  response: {
    '2xx': salarySchema,
    '4xx': errorResponse,
  },
};

export const getSalariesSchema = {
  params: Type.Object({
    employeeNumber: TRecordId,
  }),
  response: {
    '200': Type.Array(salarySchema),
  },
};

export const getSalarySchema = {
  params: salaryKeySchema,
  response: {
    '200': salarySchema,
    '404': errorResponse,
  },
};

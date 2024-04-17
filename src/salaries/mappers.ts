import { Static } from '@fastify/type-provider-typebox';
import { partialSalarySchema, salaryKeySchema, salarySchema } from './schemas';
import { Salary, SalaryKey } from './types';

export const forResponse = (a: Salary): Static<typeof salarySchema> => ({
  ...a,
  fromDate: a.fromDate.toISOString().slice(0, 10),
  toDate: a.toDate.toISOString().slice(0, 10),
});

export const newSalaryFromRequest = (
  salary: Static<typeof salarySchema>
): Salary => ({
  ...salary,
  fromDate: new Date(salary.fromDate),
  toDate: new Date(salary.toDate),
});

export const patchSalaryFromRequest = (
  patch: Static<typeof partialSalarySchema>
): Partial<Salary> => ({
  ...patch,
  fromDate: patch.fromDate ? new Date(patch.fromDate) : undefined,
  toDate: patch.toDate ? new Date(patch.toDate) : undefined,
});

export const salaryKeyFromRequest = (
  params: Static<typeof salaryKeySchema>
): SalaryKey => ({
  employeeNumber: params.employeeNumber,
  fromDate: new Date(params.fromDate),
});

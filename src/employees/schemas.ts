import { Type } from '@fastify/type-provider-typebox';
import { errorResponse } from '../infra/web/schemas';

/**
 * Potential Question:
 * The employees table has nearly reached the max id value of 2^31 - 1.
 * How can we increase the limit of ids (i.e. avoid integer overflow), while also keeping the size of the field at 4 bytes?
 * Answer:
 * Change the id field type to an unsigned int
 * Follow-up question:
 * The table has become large/active enough that altering the field (especially the primary key) will
 * be prohibitively slow. So the plan is to delay the migration to the next off-hours maintenence period.
 * How can we increase the limit of ids temporarily without altering the db table?
 * Answer:
 * Use negative ids to effectively double the number of possible ids. This can be done by
 * inserting negative ids on the application side, or setting the auto increment value to -2^31.
 */
const TEmployeeNumber = Type.Number({
  minimum: 1,
  maximum: 2 ** 31 - 1, // max int32 is 2^31 - 1
});

export const employeeSchema = Type.Object({
  employeeNumber: TEmployeeNumber,
  firstName: Type.String({ minLength: 1, maxLength: 14 }), // mysql in strict mode cuts off the string after the max length. maybe add a case for this and have them figure out why
  lastName: Type.String({ minLength: 1, maxLength: 16 }),
  birthDate: Type.String({ format: 'date' }),
  hireDate: Type.String({ format: 'date' }),
  gender: Type.Enum({ male: 'M', female: 'F', other: 'O' }),
});

export const newEmployeeSchema = Type.Omit(employeeSchema, ['employeeNumber']);
export const patchEmployeeSchemaBody = Type.Partial(newEmployeeSchema);

export const createEmployeeSchema = {
  body: newEmployeeSchema,
  response: {
    '201': employeeSchema,
  },
};

export const getEmployeesSchema = {
  response: {
    '200': Type.Array(employeeSchema),
  },
};

export const getEmployeeSchema = {
  params: Type.Object({ employeeNumber: TEmployeeNumber }),
  response: {
    '200': employeeSchema,
    '404': errorResponse,
  },
};

export const patchEmployeeSchema = {
  params: Type.Object({ employeeNumber: TEmployeeNumber }),
  body: patchEmployeeSchemaBody,
  response: {
    '200': employeeSchema,
    '404': errorResponse,
  },
};

export const deleteEmployeeSchema = {
  params: Type.Object({ employeeNumber: TEmployeeNumber }),
  response: {
    '204': Type.Null(),
    '404': errorResponse,
  },
};

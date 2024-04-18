/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  FastifyPluginAsyncTypebox,
  ServerPlugin,
  FastifyRequestTypebox,
  FastifyReplyTypebox,
} from '../infra/web/types';
import {
  forResponse,
  newEmployeeFromRequest,
  patchEmployeeFromRequest,
} from './mappers';
import {
  createEmployeeSchema,
  deleteEmployeeSchema,
  getEmployeesSchema,
  getEmployeeSchema,
  patchEmployeeSchema,
} from './schemas';
import {
  createEmployee,
  deleteEmployee,
  editEmployee,
  getEmployees,
  getEmployee,
} from './service';

const createEmployeeOptions = {
  schema: createEmployeeSchema,
  async handler(
    request: FastifyRequestTypebox<typeof this.schema>,
    reply: FastifyReplyTypebox<typeof this.schema>
  ) {
    const newEmployee = await createEmployee(
      newEmployeeFromRequest(request.body)
    );

    reply.status(201).send(forResponse(newEmployee));
  },
};
const getEmployeesOptions = {
  schema: getEmployeesSchema,
  async handler(
    request: FastifyRequestTypebox<typeof this.schema>,
    reply: FastifyReplyTypebox<typeof this.schema>
  ) {
    const employees = await getEmployees(request.query);

    reply.send(employees.map(forResponse));
  },
};

const getEmployeeOptions = {
  schema: getEmployeeSchema,
  async handler(
    request: FastifyRequestTypebox<typeof this.schema>,
    reply: FastifyReplyTypebox<typeof this.schema>
  ) {
    const employee = await getEmployee(request.params.employeeNumber);

    reply.send(forResponse(employee));
  },
};
const patchEmployeeOptions = {
  schema: patchEmployeeSchema,
  async handler(
    request: FastifyRequestTypebox<typeof this.schema>,
    reply: FastifyReplyTypebox<typeof this.schema>
  ) {
    const updatedEmployee = await editEmployee(
      request.params.employeeNumber,
      patchEmployeeFromRequest(request.body)
    );

    reply.send(forResponse(updatedEmployee));
  },
};
const deleteEmployeeOptions = {
  schema: deleteEmployeeSchema,
  async handler(
    request: FastifyRequestTypebox<typeof this.schema>,
    reply: FastifyReplyTypebox<typeof this.schema>
  ) {
    await deleteEmployee(request.params.employeeNumber);

    reply.status(204);
  },
};

const plugin: ServerPlugin<FastifyPluginAsyncTypebox> = {
  plugin: async (fastify) => {
    fastify
      .post('/employees', createEmployeeOptions)
      .get('/employees', getEmployeesOptions)
      .get('/employees/:employeeNumber', getEmployeeOptions)
      .patch('/employees/:employeeNumber', patchEmployeeOptions)
      .delete('/employees/:employeeNumber', deleteEmployeeOptions);
  },
};

export default plugin;

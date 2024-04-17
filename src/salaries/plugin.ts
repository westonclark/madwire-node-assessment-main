import {
  FastifyPluginAsyncTypebox,
  FastifyReplyTypebox,
  FastifyRequestTypebox,
  ServerPlugin,
} from '../infra/web/types';
import {
  forResponse,
  newSalaryFromRequest,
  patchSalaryFromRequest,
  salaryKeyFromRequest,
} from './mappers';
import {
  createSalarySchema,
  getSalariesSchema,
  getSalarySchema,
  patchSalarySchema,
  deleteSalarySchema,
} from './schemas';
import {
  createSalary,
  getSalaries,
  getSalary,
  patchSalary,
  deleteSalary,
} from './service';

const createSalaryOptions = {
  schema: createSalarySchema,
  async handler(
    request: FastifyRequestTypebox<typeof this.schema>,
    reply: FastifyReplyTypebox<typeof this.schema>
  ) {
    const { body: newSalary } = request;

    const salary = await createSalary(newSalaryFromRequest(newSalary));

    reply.status(201).send(forResponse(salary));
  },
};

const getSalariesOptions = {
  schema: getSalariesSchema,
  async handler(
    request: FastifyRequestTypebox<typeof this.schema>,
    reply: FastifyReplyTypebox<typeof this.schema>
  ) {
    const salaries = await getSalaries(request.params.employeeNumber);

    reply.send(salaries.map(forResponse));
  },
};

const getSalaryOptions = {
  schema: getSalarySchema,
  async handler(
    request: FastifyRequestTypebox<typeof this.schema>,
    reply: FastifyReplyTypebox<typeof this.schema>
  ) {
    const salary = await getSalary(salaryKeyFromRequest(request.params));

    reply.send(forResponse(salary));
  },
};

const patchSalaryOptions = {
  schema: patchSalarySchema,
  async handler(
    request: FastifyRequestTypebox<typeof this.schema>,
    reply: FastifyReplyTypebox<typeof this.schema>
  ) {
    const { body: patch, params } = request;

    const salary = await patchSalary(
      salaryKeyFromRequest(params),
      patchSalaryFromRequest(patch)
    );

    reply.send(forResponse(salary));
  },
};

const deleteSalaryOptions = {
  schema: deleteSalarySchema,
  async handler(
    request: FastifyRequestTypebox<typeof this.schema>,
    reply: FastifyReplyTypebox<typeof this.schema>
  ) {
    await deleteSalary(salaryKeyFromRequest(request.params));

    reply.status(204).send(null);
  },
};

const plugin: ServerPlugin<FastifyPluginAsyncTypebox> = {
  plugin: async (fastify) => {
    fastify
      .post('/salaries', createSalaryOptions)
      .patch('/salaries/:employeeNumber/:fromDate', patchSalaryOptions)
      .delete('/salaries/:employeeNumber/:fromDate', deleteSalaryOptions)
      .get('/salaries/:employeeNumber', getSalariesOptions)
      .get('/salaries/:employeeNumber/:fromDate', getSalaryOptions);
  },
};

export default plugin;

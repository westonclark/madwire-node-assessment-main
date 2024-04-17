/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  FastifyPluginAsyncTypebox,
  ServerPlugin,
  FastifyRequestTypebox,
  FastifyReplyTypebox,
} from '../infra/web/types';
import { forResponse, fromRequest } from './mappers';

import {
  createTitleSchema,
  deleteTitleSchema,
  getTitleSchema,
  getTitlesSchema,
  patchTitleSchema,
} from './schemas';
import {
  createTitle,
  deleteTitle,
  getTitle,
  editTitle,
  getTitles,
} from './service';

const createTitleOptions = {
  schema: createTitleSchema,
  async handler(
    request: FastifyRequestTypebox<typeof this.schema>,
    reply: FastifyReplyTypebox<typeof this.schema>
  ) {
    const newTitle = await createTitle(fromRequest(request.body));

    reply.status(201).send(forResponse(newTitle));
  },
};
const getTitleOptions = {
  schema: getTitleSchema,
  async handler(
    request: FastifyRequestTypebox<typeof this.schema>,
    reply: FastifyReplyTypebox<typeof this.schema>
  ) {
    const title = await getTitle(fromRequest(request.params));

    reply.send(forResponse(title));
  },
};
const getTitlesOptions = {
  schema: getTitlesSchema,
  async handler(
    request: FastifyRequestTypebox<typeof this.schema>,
    reply: FastifyReplyTypebox<typeof this.schema>
  ) {
    const titles = await getTitles(fromRequest(request.query));

    reply.send(titles.map(forResponse));
  },
};
const patchTitlesOptions = {
  schema: patchTitleSchema,
  async handler(
    request: FastifyRequestTypebox<typeof this.schema>,
    reply: FastifyReplyTypebox<typeof this.schema>
  ) {
    const patch = fromRequest(request.body);

    const updatedTitle = await editTitle(fromRequest(request.params), patch);

    reply.send(forResponse(updatedTitle));
  },
};
const deleteTitleOptions = {
  schema: deleteTitleSchema,
  async handler(
    request: FastifyRequestTypebox<typeof this.schema>,
    reply: FastifyReplyTypebox<typeof this.schema>
  ) {
    await deleteTitle(fromRequest(request.params));

    reply.status(204);
  },
};

const plugin: ServerPlugin<FastifyPluginAsyncTypebox> = {
  plugin: async (fastify) => {
    fastify
      .post('/titles', createTitleOptions)
      .patch('/titles/:employeeNumber/:title/:fromDate', patchTitlesOptions)
      .delete('/titles/:employeeNumber/:title/:fromDate', deleteTitleOptions)
      .get('/titles/:employeeNumber/:title/:fromDate', getTitleOptions)
      .get('/titles', getTitlesOptions);
  },
};

export default plugin;

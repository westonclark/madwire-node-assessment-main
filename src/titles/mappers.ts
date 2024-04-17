import { Static } from '@fastify/type-provider-typebox';
import { titleSchema } from './schemas';
import { Title } from './types';

type RequestTitle = Static<typeof titleSchema>;

export const fromRequest = <T extends RequestTitle | Partial<RequestTitle>>(
  title: T
): T extends RequestTitle ? Title : Partial<Title> =>
  ({
    ...title,
    fromDate: title.fromDate ? new Date(title.fromDate) : undefined,
    toDate: title.toDate ? new Date(title.toDate) : undefined,
  }) as Title;

export const forResponse = (title: Title): RequestTitle => ({
  ...title,
  fromDate: title.fromDate.toISOString().slice(0, 10),
  toDate: title.toDate ? title.toDate.toISOString().slice(0, 10) : null,
});

import {
  ContextConfigDefault,
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
  FastifySchema,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify';
import { RouteGenericInterface } from 'fastify/types/route';
import {
  FastifyPluginAsyncTypebox,
  FastifyPluginCallbackTypebox,
  TypeBoxTypeProvider,
} from '@fastify/type-provider-typebox';

export {
  FastifyPluginAsyncTypebox,
  FastifyPluginCallbackTypebox,
} from '@fastify/type-provider-typebox';

export type FastifyRequestTypebox<TSchema extends FastifySchema> =
  FastifyRequest<
    RouteGenericInterface,
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    TSchema,
    TypeBoxTypeProvider
  >;

export type FastifyReplyTypebox<TSchema extends FastifySchema> = FastifyReply<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  RouteGenericInterface,
  ContextConfigDefault,
  TSchema,
  TypeBoxTypeProvider
>;

export type FastifyInstanceTypebox = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;

export interface ServerPlugin<
  PluginType = FastifyPluginAsyncTypebox | FastifyPluginCallbackTypebox,
> {
  plugin: PluginType;
  options?: FastifyPluginOptions;
}

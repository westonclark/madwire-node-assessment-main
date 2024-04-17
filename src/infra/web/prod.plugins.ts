import fastifyHelmet from '@fastify/helmet';
import { ServerPlugin } from './types';
import employeePlugin from '../../employees/plugin';
import titlePlugin from '../../titles/plugin';
import salaryPlugin from '../../salaries/plugin';

const prodPlugins: ServerPlugin[] = [
  {
    plugin: fastifyHelmet,
    options: {
      contentSecurityPolicy: false,
    },
  },
  employeePlugin,
  titlePlugin,
  salaryPlugin,
];

export default prodPlugins;

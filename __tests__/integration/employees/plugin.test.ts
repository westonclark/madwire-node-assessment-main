import 'jest-extended';
import db from '../../../src/infra/database/knex';
import buildServer from '../../../src/infra/web/server';
import employeesPlugin from '../../../src/employees/plugin';
import { FastifyInstanceTypebox } from '../../../src/infra/web/types';

const expectEmployee = () =>
  expect.objectContaining({
    employeeNumber: expect.any(Number),
    firstName: expect.any(String),
    lastName: expect.any(String),
    gender: expect.any(String),
    hireDate: expect.any(String),
    birthDate: expect.any(String),
  });

describe('employees plugin', () => {
  let server: FastifyInstanceTypebox;

  beforeAll(() => {
    server = buildServer({}, [employeesPlugin]);
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('GET /employees', () => {
    it('should return employees with default limit of 10', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/employees',
      });
      const body = JSON.parse(response.body);

      expect(body.length).toEqual(10);
      expect(body).toEqual(expect.arrayContaining([expectEmployee()]));
    });

    it('should return employees filtered by title with default limit 10', async () => {
      const title = 'engineer';
      const response = await server.inject({
        method: 'GET',
        url: `/employees?title=${title}`,
      });
      const body = JSON.parse(response.body);

      expect(body.length).toBe(10);
      expect(body).toEqual(expect.arrayContaining([expectEmployee()]));
      body.forEach((emp: any) => {
        expect(emp.title.toLowerCase()).toEqual(title.toLowerCase());
      });
    });

    it('should return employees with custom limit', async () => {
      const limit = 5;
      const response = await server.inject({
        method: 'GET',
        url: `employees?limit=${limit}`,
      });
      const body = JSON.parse(response.body);

      expect(body.length).toEqual(limit);
      expect(body).toEqual(expect.arrayContaining([expectEmployee()]));
    });

    it('should return employees filtered by title and with a custom limit', async () => {
      const title = 'engineer';
      const limit = 3;

      const response = await server.inject({
        method: 'GET',
        url: `employees?title=${title}&limit=${limit}`,
      });
      const body = JSON.parse(response.body);

      expect(body.length).toEqual(limit);
      expect(body).toEqual(expect.arrayContaining([expectEmployee()]));
      body.forEach((emp: any) => {
        expect(emp.title.toLowerCase()).toEqual(title.toLowerCase());
      });
    });

    it('should return a 404 code and error message when an employee with title is not found', async () => {
      const title = 'badTitle';

      const response = await server.inject({
        method: 'GET',
        url: `employees?title=${title}`,
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toHaveProperty('error');
    });

    it('should return a 400 code and error message when an empty title query parameter is sent', async () => {
      const title = '';

      const response = await server.inject({
        method: 'GET',
        url: `employees?title=${title}`,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
    });

    it('should return a 400 code and error message when an empty limit query parameter is sent', async () => {
      const limit = '';

      const response = await server.inject({
        method: 'GET',
        url: `employees?limit=${limit}`,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
    });

    it('should return a 400 code and error message when an title query parameter greater than 50 characters is sent', async () => {
      const title = '...................................................';

      const response = await server.inject({
        method: 'GET',
        url: `employees?title=${title}`,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
    });
  });
});

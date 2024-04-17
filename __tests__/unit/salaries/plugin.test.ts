import 'jest-extended';
import { Static } from '@sinclair/typebox';
import salaryPlugin from '../../../src/salaries/plugin';
import buildServer from '../../../src/infra/web/server';
import { FastifyInstanceTypebox } from '../../../src/infra/web/types';
import { mockDependency } from '../../_utils';
import { ResourceNotFoundError } from '../../../src/errors';

import {
  createSalary,
  deleteSalary,
  getSalary,
  patchSalary,
} from '../../../src/salaries/service';
import { Salary, SalaryKey } from '../../../src/salaries/types';
import { forResponse } from '../../../src/salaries/mappers';
import {
  newSalarySchema,
  partialSalarySchema,
} from '../../../src/salaries/schemas';

jest.mock('../../../src/salaries/service');
const mockGetSalary = mockDependency(getSalary);
const mockCreateSalary = mockDependency(createSalary);
const mockPatchSalary = mockDependency(patchSalary);
const mockDeleteSalary = mockDependency(deleteSalary);

describe('salaries plugin', () => {
  let server: FastifyInstanceTypebox;

  const employeeNumber = 1;
  const fromDate = '2020-01-01';
  const toDate = '2020-02-01';

  const salary: Salary = {
    employeeNumber,
    salary: 10000,
    fromDate: new Date(fromDate),
    toDate: new Date(toDate),
  };
  const salaryKey: SalaryKey = {
    employeeNumber,
    fromDate: new Date(fromDate),
  };
  const responseSalary = forResponse(salary);

  beforeAll(() => {
    server = buildServer({}, [salaryPlugin]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('GET /salaries/:employeeNumber/:fromDate', () => {
    it('should return salary', async () => {
      mockGetSalary.mockResolvedValue(salary);

      const response = await server.inject({
        method: 'GET',
        url: `/salaries/${salary.employeeNumber}/${fromDate}`,
      });
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body).toStrictEqual(responseSalary);
      expect(mockGetSalary).toHaveBeenCalledWith(
        expect.objectContaining(salaryKey)
      );
    });

    it('should return 404 when salary does not exist', async () => {
      const errMessage = 'Salary not found';
      mockGetSalary.mockRejectedValue(new ResourceNotFoundError(errMessage));

      const response = await server.inject({
        method: 'GET',
        url: '/salaries/100/2020-01-01',
      });
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(404);
      expect(body).toEqual({ error: { message: errMessage } });
    });
  });

  describe('POST /salaries', () => {
    const payload = {
      employeeNumber,
      salary: 10000,
      fromDate,
      toDate,
    };

    it('should return created salary', async () => {
      mockCreateSalary.mockResolvedValue(salary);

      const response = await server.inject({
        url: '/salaries',
        method: 'POST',
        payload,
      });
      const body = await JSON.parse(response.body);

      expect(response.statusCode).toBe(201);
      expect(body).toStrictEqual(payload);
      expect(mockCreateSalary).toHaveBeenCalledWith(salary);
    });

    const validPayload = { ...payload };
    type NewSalaryPayload = Static<typeof newSalarySchema>;
    type InvalidPayloadTestCase = [string, Partial<NewSalaryPayload>, string];
    const invalidPayloads: InvalidPayloadTestCase[] = [
      [
        'fromDate must be date',
        {
          ...validPayload,
          fromDate: 'notAdate',
        },
        'body/fromDate must match format "date"',
      ],
      [
        'toDate must be date',
        {
          ...validPayload,
          toDate: 'notAdate',
        },
        'body/toDate must match format "date"',
      ],
      [
        'salary must be greater than 0',
        {
          ...validPayload,
          salary: 0,
        },
        'body/salary must be >= 1',
      ],
    ];
    it.each(invalidPayloads)(
      'should reject invalid payload %s',
      async (
        testName: string,
        p: Partial<NewSalaryPayload>,
        expectedMessage: string
      ) => {
        const response = await server.inject({
          url: '/salaries',
          method: 'POST',
          payload: p,
        });
        const body = JSON.parse(response.body);

        expect(response.statusCode).toBe(400);
        expect(body).toEqual({ error: { message: expectedMessage } });
      }
    );
  });

  describe('PATCH /salaries/:employeeNumber/:fromDate', () => {
    it('should return edited salary', async () => {
      const payload = { salary: 100 };

      mockPatchSalary.mockResolvedValue({
        ...salary,
        ...payload,
      });

      const response = await server.inject({
        url: `/salaries/${employeeNumber}/${fromDate}`,
        method: 'PATCH',
        payload,
      });
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body).toStrictEqual({ ...responseSalary, ...payload });
      expect(mockPatchSalary).toHaveBeenCalledOnce();
      expect(mockPatchSalary).toHaveBeenCalledWith(
        { employeeNumber, fromDate: new Date(fromDate) },
        payload
      );
    });

    it('should return 404 when salary does not exist', async () => {
      const errMessage = 'Salary not found';
      mockPatchSalary.mockRejectedValue(new ResourceNotFoundError(errMessage));
      const nonExistentEmployeeNumber = 2002;
      const payload = { salary: 100 };
      const response = await server.inject({
        url: `/salaries/${nonExistentEmployeeNumber}/${fromDate}`,
        method: 'PATCH',
        payload,
      });
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(404);
      expect(body).toEqual({ error: { message: errMessage } });
      expect(mockPatchSalary).toHaveBeenCalledOnce();
      expect(mockPatchSalary).toHaveBeenCalledWith(
        {
          employeeNumber: nonExistentEmployeeNumber,
          fromDate: new Date(fromDate),
        },
        expect.objectContaining(payload)
      );
    });

    type SalaryPatch = Static<typeof partialSalarySchema>;
    type InvalidPayloadTestCase = [string, SalaryPatch, string];
    const invalidPayloads: InvalidPayloadTestCase[] = [
      [
        'fromDate must be date',
        {
          fromDate: 'notAdate',
        },
        'body/fromDate must match format "date"',
      ],
      [
        'toDate must be date',
        {
          toDate: 'notAdate',
        },
        'body/toDate must match format "date"',
      ],
      [
        'salary must be greater than 0',
        {
          salary: 0,
        },
        'body/salary must be >= 1',
      ],
    ];
    it.each(invalidPayloads)(
      'should reject invalid payload %s',
      async (
        testName: string,
        payload: SalaryPatch,
        expectedMessage: string
      ) => {
        const response = await server.inject({
          url: `/salaries/${employeeNumber}/${fromDate}`,
          method: 'PATCH',
          payload,
        });
        const body = JSON.parse(response.body);

        expect(response.statusCode).toBe(400);
        expect(body).toEqual({ error: { message: expectedMessage } });
      }
    );
  });

  describe('DELETE /salaries/:employeeNumber/:fromDate', () => {
    it('should return 204 on successful deletion', async () => {
      mockDeleteSalary.mockResolvedValueOnce();

      const response = await server.inject({
        url: `/salaries/${employeeNumber}/${fromDate}`,
        method: 'DELETE',
      });

      expect(response.statusCode).toBe(204);
      expect(mockDeleteSalary).toHaveBeenCalledOnce();
      expect(mockDeleteSalary).toHaveBeenCalledWith({
        employeeNumber,
        fromDate: new Date(fromDate),
      });
    });

    it('should return 404 when salary does not exist', async () => {
      const errMessage = 'Salary not found';
      mockDeleteSalary.mockRejectedValue(new ResourceNotFoundError(errMessage));
      const nonExistentEmployeeNumber = 2002;
      const response = await server.inject({
        url: `/salaries/${nonExistentEmployeeNumber}/${fromDate}`,
        method: 'DELETE',
      });
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(404);
      expect(body).toEqual({ error: { message: errMessage } });
      expect(mockDeleteSalary).toHaveBeenCalledOnce();
      expect(mockDeleteSalary).toHaveBeenCalledWith({
        employeeNumber: nonExistentEmployeeNumber,
        fromDate: new Date(fromDate),
      });
    });
  });
});

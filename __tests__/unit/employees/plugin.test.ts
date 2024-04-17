import 'jest-extended';
import { Static } from '@sinclair/typebox';
import employeePlugin from '../../../src/employees/plugin';
import buildServer from '../../../src/infra/web/server';
import { FastifyInstanceTypebox } from '../../../src/infra/web/types';
import { mockDependency } from '../../_utils';
import {
  createEmployee,
  deleteEmployee,
  editEmployee,
  getEmployee,
} from '../../../src/employees/service';
import { Gender } from '../../../src/employees/types';
import { ResourceNotFoundError } from '../../../src/errors';
import {
  newEmployeeSchema,
  patchEmployeeSchemaBody,
} from '../../../src/employees/schemas';

jest.mock('../../../src/employees/service');
const mockGetEmployee = mockDependency(getEmployee);
const mockCreateEmployee = mockDependency(createEmployee);
const mockEditEmployee = mockDependency(editEmployee);
const mockDeleteEmployee = mockDependency(deleteEmployee);

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
  const hireDate = new Date().toISOString().slice(0, 10);
  const birthDate = new Date().toISOString().slice(0, 10);
  const employee = {
    firstName: 'firstName',
    lastName: 'lastName',
    gender: Gender.female,
    hireDate: new Date(hireDate),
    birthDate: new Date(birthDate),
  };
  const employeeNumber = 1;

  beforeAll(() => {
    server = buildServer({}, [employeePlugin]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('GET /employees/:employeeNumber', () => {
    it('should return employee', async () => {
      mockGetEmployee.mockResolvedValue({ ...employee, employeeNumber });

      const response = await server.inject({
        method: 'GET',
        url: `/employees/${employeeNumber}`,
      });
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body).toEqual(expectEmployee());
      expect(mockGetEmployee).toHaveBeenCalledWith(employeeNumber);
    });

    it('should return 404 when employee does not exist', async () => {
      const errMessage = 'employee not found';
      mockGetEmployee.mockRejectedValue(new ResourceNotFoundError(errMessage));

      const response = await server.inject({
        method: 'GET',
        url: 'employees/100',
      });
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(404);
      expect(body).toEqual({ error: { message: errMessage } });
    });
  });

  describe('POST /employees', () => {
    it('should return created employee', async () => {
      mockCreateEmployee.mockResolvedValue({ ...employee, employeeNumber });
      const payload = {
        ...employee,
        birthDate,
        hireDate,
      };

      const response = await server.inject({
        url: '/employees',
        method: 'POST',
        payload,
      });
      const body = await JSON.parse(response.body);

      expect(response.statusCode).toBe(201);
      expect(body).toEqual(expectEmployee());
      expect(mockCreateEmployee).toHaveBeenCalledWith(employee);
      expect(mockCreateEmployee).toHaveBeenCalledOnce();
    });

    const validPayload = {
      ...employee,
      hireDate,
      birthDate,
    };
    type NewEmployeeePayload = Static<typeof newEmployeeSchema>;
    type InvalidPayloadTestCase = [
      string,
      Partial<NewEmployeeePayload>,
      string,
    ];
    const invalidPayloads: InvalidPayloadTestCase[] = [
      [
        'hireDate must be date',
        {
          ...validPayload,
          hireDate: 'notAdate',
        },
        'body/hireDate must match format "date"',
      ],
      [
        'birthDate must be date',
        {
          ...validPayload,
          birthDate: 'notAdate',
        },
        'body/birthDate must match format "date"',
      ],
      [
        'gender must match enum',
        {
          ...validPayload,
          gender: 'not a valid gender value' as Gender,
        },
        'body/gender must be equal to constant, body/gender must be equal to constant, body/gender must be equal to constant, body/gender must match a schema in anyOf',
      ],
      [
        'first name cannot be empty',
        {
          ...validPayload,
          firstName: '',
        },
        'body/firstName must NOT have fewer than 1 characters',
      ],
      [
        'last name cannot be empty',
        {
          ...validPayload,
          lastName: '',
        },
        'body/lastName must NOT have fewer than 1 characters',
      ],
    ];
    it.each(invalidPayloads)(
      'should reject invalid payload %s',
      async (
        testName: string,
        payload: Partial<NewEmployeeePayload>,
        expectedMessage: string
      ) => {
        const response = await server.inject({
          url: '/employees',
          method: 'POST',
          payload,
        });
        const body = JSON.parse(response.body);

        expect(response.statusCode).toBe(400);
        expect(body).toEqual({ error: { message: expectedMessage } });
      }
    );
  });

  describe('PATCH /employees/:employeeNumber', () => {
    it('should return edited employee', async () => {
      mockEditEmployee.mockResolvedValue({
        ...employee,
        employeeNumber,
        firstName: 'changed',
      });
      const payload = { firstName: 'changed' };

      const response = await server.inject({
        url: `/employees/${employeeNumber}`,
        method: 'PATCH',
        payload,
      });
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body).toEqual(expectEmployee());
      expect(mockEditEmployee).toHaveBeenCalledOnce();
      expect(mockEditEmployee).toHaveBeenCalledWith(employeeNumber, payload);
    });

    it('should return 404 when employee does not exist', async () => {
      const errMessage = 'employee not found';
      mockEditEmployee.mockRejectedValue(new ResourceNotFoundError(errMessage));
      const nonExistentEmployeeNumber = 2002;
      const payload = { firstName: 'changed' };
      const response = await server.inject({
        url: `/employees/${nonExistentEmployeeNumber}`,
        method: 'PATCH',
        payload,
      });
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(404);
      expect(body).toEqual({ error: { message: errMessage } });
      expect(mockEditEmployee).toHaveBeenCalledOnce();
      expect(mockEditEmployee).toHaveBeenCalledWith(
        nonExistentEmployeeNumber,
        expect.objectContaining(payload)
      );
    });
    type EmployeePatch = Static<typeof patchEmployeeSchemaBody>;
    type InvalidPayloadTestCase = [string, EmployeePatch, string];
    const invalidPayloads: InvalidPayloadTestCase[] = [
      [
        'hireDate must be date',
        {
          hireDate: 'notAdate',
        },
        'body/hireDate must match format "date"',
      ],
      [
        'birthDate must be date',
        {
          birthDate: 'notAdate',
        },
        'body/birthDate must match format "date"',
      ],
      [
        'gender must match enum',
        {
          gender: 'not a valid gender value' as Gender,
        },
        'body/gender must be equal to constant, body/gender must be equal to constant, body/gender must be equal to constant, body/gender must match a schema in anyOf',
      ],
      [
        'first name cannot be empty',
        {
          firstName: '',
        },
        'body/firstName must NOT have fewer than 1 characters',
      ],
      [
        'last name cannot be empty',
        {
          lastName: '',
        },
        'body/lastName must NOT have fewer than 1 characters',
      ],
    ];
    it.each(invalidPayloads)(
      'should reject invalid payload %s',
      async (
        testName: string,
        payload: EmployeePatch,
        expectedMessage: string
      ) => {
        const response = await server.inject({
          url: `/employees/${employeeNumber}`,
          method: 'PATCH',
          payload,
        });
        const body = JSON.parse(response.body);

        expect(response.statusCode).toBe(400);
        expect(body).toEqual({ error: { message: expectedMessage } });
      }
    );
  });

  describe('DELETE /employees/:employeeNumber', () => {
    it('should return 204 on successful deletion', async () => {
      const response = await server.inject({
        url: `/employees/${employeeNumber}`,
        method: 'DELETE',
      });

      expect(response.statusCode).toBe(204);
      expect(mockDeleteEmployee).toHaveBeenCalledOnce();
      expect(mockDeleteEmployee).toHaveBeenCalledWith(employeeNumber);
    });

    it('should return 404 when employee does not exist', async () => {
      const errMessage = 'employee not found';
      mockDeleteEmployee.mockRejectedValue(
        new ResourceNotFoundError(errMessage)
      );
      const nonExistentEmployeeNumber = 2002;
      const response = await server.inject({
        url: `/employees/${nonExistentEmployeeNumber}`,
        method: 'DELETE',
      });
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(404);
      expect(body).toEqual({ error: { message: errMessage } });
      expect(mockDeleteEmployee).toHaveBeenCalledOnce();
      expect(mockDeleteEmployee).toHaveBeenCalledWith(
        nonExistentEmployeeNumber
      );
    });
  });
});

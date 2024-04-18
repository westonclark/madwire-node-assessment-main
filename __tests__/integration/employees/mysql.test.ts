import 'jest-extended';
import {
  deleteEmployeeByNumber,
  getEmployeeByNumber,
  insertEmployee,
  saveEmployee,
  listEmployees,
} from '../../../src/employees/mysql';
import db from '../../../src/infra/database/knex';
import { ResourceNotFoundError } from '../../../src/errors';
import { Employee, Gender } from '../../../src/employees/types';

const expectEmployee = () =>
  expect.objectContaining({
    employeeNumber: expect.any(Number),
    firstName: expect.any(String),
    lastName: expect.any(String),
    gender: expect.any(String),
    hireDate: expect.any(Date),
    birthDate: expect.any(Date),
  });

describe('Mysql Persistence', () => {
  const employeeNumber = 10020;
  const employeeNumberWrite = 100;
  const newEmployee: Employee = {
    employeeNumber: employeeNumberWrite,
    firstName: 'testName',
    lastName: 'testLastName',
    gender: Gender.female,
    hireDate: new Date(),
    birthDate: new Date(),
  };

  afterAll(async () => {
    await db.destroy();
  });

  describe('getEmployeeByNumber', () => {
    it('should return employee', async () => {
      const employee = await getEmployeeByNumber(employeeNumber);
      expect(employee).toEqual(expectEmployee());
    });

    it('should throw error when employee does not exist', async () => {
      expect(() => getEmployeeByNumber(-1)).rejects.toThrow(
        ResourceNotFoundError
      );
    });
  });

  describe('listEmployees', () => {
    it('should retrieve employees with provided limit', async () => {
      const limit = 3;
      const results = await listEmployees({ limit });

      expect(results.length).toBe(limit);
      expect(results).toEqual(expect.arrayContaining([expectEmployee()]));
    });

    it('should retrieve employees with default limit of 10', async () => {
      const results = await listEmployees({});
      expect(results.length).toBe(10);
      expect(results).toEqual(expect.arrayContaining([expectEmployee()]));
    });

    it('should retrieve employees filtered by title with provided limit', async () => {
      const limit = 3;
      const title = 'Staff';
      const results = await listEmployees({ limit, title });
      expect(results.length).toEqual(limit);
      expect(results).toEqual(expect.arrayContaining([expectEmployee()]));
      results.forEach((employee) => {
        expect(employee.title).toEqual(title);
      });
    });

    it('should retreive employees filtered by title with default limit', async () => {
      const title = 'Staff';
      const results = await listEmployees({ title });
      expect(results.length).toEqual(10);
      expect(results).toEqual(expect.arrayContaining([expectEmployee()]));
      results.forEach((employee) => {
        expect(employee.title).toEqual(title);
      });
    });

    it('should throw error when employee does not exist', async () => {
      const title = 'wrongTitle';
      expect(() => listEmployees({ title })).rejects.toThrow(
        ResourceNotFoundError
      );
    });
  });

  describe('insertEmployee', () => {
    it('should insert employee', async () => {
      await insertEmployee(newEmployee);

      const employee = await getEmployeeByNumber(employeeNumberWrite);
      expect(employee.employeeNumber).toEqual(employeeNumberWrite);
      expect(employee.firstName).toEqual(newEmployee.firstName);
      expect(employee.hireDate.toISOString().slice(0, 10)).toEqual(
        newEmployee.hireDate.toISOString().slice(0, 10)
      );
    });
  });

  describe('saveEmployee', () => {
    it('should edit employee', async () => {
      const editedEmployee = {
        ...newEmployee,
        firstName: 'differentName',
      };
      await saveEmployee(editedEmployee);
      const updatedEmployee = await getEmployeeByNumber(
        editedEmployee.employeeNumber
      );

      expect(updatedEmployee.firstName).toEqual(editedEmployee.firstName);
      expect(updatedEmployee.employeeNumber).toEqual(
        editedEmployee.employeeNumber
      );
    });

    it('should throw error when employee does not exist', async () => {
      const editedEmployee = {
        ...newEmployee,
        employeeNumber: -1,
      };
      expect(() => saveEmployee(editedEmployee)).rejects.toThrow(
        ResourceNotFoundError
      );
    });
  });

  describe('deleteEmployee', () => {
    it('should delete employee', async () => {
      await deleteEmployeeByNumber(employeeNumberWrite);
      expect(() => getEmployeeByNumber(employeeNumberWrite)).rejects.toThrow(
        ResourceNotFoundError
      );
    });

    it('should throw error if employee does not exist', async () => {
      expect(() => deleteEmployeeByNumber(employeeNumberWrite)).rejects.toThrow(
        ResourceNotFoundError
      );
    });
  });
});

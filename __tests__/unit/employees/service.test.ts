import 'jest-extended';
import {
  createEmployee,
  deleteEmployee,
  editEmployee,
  getEmployee,
} from '../../../src/employees/service';
import { Employee, Gender, NewEmployee } from '../../../src/employees/types';
import {
  deleteEmployeeByNumber,
  getEmployeeByNumber,
  insertEmployee,
  saveEmployee,
  listEmployees,
} from '../../../src/employees/mysql';
import { mockDependency } from '../../_utils';
import { ResourceNotFoundError } from '../../../src/errors';

jest.mock('../../../src/employees/mysql');
const mockGetEmployeeByNumber = mockDependency(getEmployeeByNumber);
const mockListEmployees = mockDependency(listEmployees);
const mockInsertEmployee = mockDependency(insertEmployee);
const mockSaveEmployee = mockDependency(saveEmployee);
const mockDeleteEmployee = mockDependency(deleteEmployeeByNumber);

describe('employees service', () => {
  const employee: Employee = {
    employeeNumber: 1,
    firstName: 'test',
    lastName: 'name',
    birthDate: new Date(),
    hireDate: new Date(),
    gender: Gender.male,
  };

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('getEmployee', () => {
    it('should return employee', async () => {
      mockGetEmployeeByNumber.mockResolvedValue(employee);

      const result = await getEmployee(employee.employeeNumber);
      expect(result).toEqual(employee);
      expect(mockGetEmployeeByNumber).toHaveBeenCalledOnce();
      expect(mockGetEmployeeByNumber).toHaveBeenCalledWith(
        employee.employeeNumber
      );
    });

    it('should throw error if employee is not found', async () => {
      mockGetEmployeeByNumber.mockRejectedValue(
        new ResourceNotFoundError('employee not found')
      );
      expect(() => getEmployee(1)).rejects.toThrow(ResourceNotFoundError);
    });
  });

  describe('getEmployees', () => {
    it('should pass filter options to db method', async () => {
      mockListEmployees.mockResolvedValueOnce([]);

      const filterOpts = {
        limit: 10,
        title: 'test',
      };
      await listEmployees(filterOpts);

      expect(mockListEmployees).toHaveBeenCalledOnce();
      expect(mockListEmployees).toHaveBeenCalledWith(filterOpts);
    });
  });

  describe('createEmployee', () => {
    it('should create employee', async () => {
      mockGetEmployeeByNumber.mockResolvedValue(employee);
      const newEmployee: NewEmployee = {
        firstName: 'test2',
        lastName: 'test3',
        birthDate: new Date(),
        hireDate: new Date(),
        gender: Gender.female,
      };

      await createEmployee(newEmployee);

      expect(mockGetEmployeeByNumber).toHaveBeenCalledOnce();
      const funcCalls = mockGetEmployeeByNumber.mock.lastCall || [];
      const employeeNumber = funcCalls[0];
      expect(mockInsertEmployee).toHaveBeenCalledOnce();
      expect(mockInsertEmployee).toHaveBeenCalledWith({
        ...newEmployee,
        employeeNumber,
      });
    });
  });

  describe('editEmployee', () => {
    it('should edit employee', async () => {
      mockGetEmployeeByNumber.mockResolvedValueOnce(employee);
      const patch = { firstName: 'newtestname' };
      const employeeNumber = 1;

      await editEmployee(employeeNumber, patch);

      expect(mockGetEmployeeByNumber).toHaveBeenCalledTimes(2);
      expect(mockGetEmployeeByNumber).toHaveBeenCalledWith(employeeNumber);
      expect(mockSaveEmployee).toHaveBeenCalledOnce();
      expect(mockSaveEmployee).toHaveBeenCalledWith({
        ...employee,
        ...patch,
      });
    });

    it('should throw error if employee does not exist', async () => {
      mockGetEmployeeByNumber.mockRejectedValue(
        new ResourceNotFoundError('employee not found')
      );
      expect(() => editEmployee(1, { firstName: 'name' })).rejects.toThrow(
        ResourceNotFoundError
      );
    });
  });

  describe('deleteEmployee', () => {
    it('should delete employee', async () => {
      const employeeNumber = 1;
      await deleteEmployee(employeeNumber);

      expect(mockDeleteEmployee).toHaveBeenCalledOnce();
      expect(mockDeleteEmployee).toHaveBeenCalledWith(employeeNumber);
    });

    it('should throw error if employee does not exist', async () => {
      mockDeleteEmployee.mockRejectedValue(
        new ResourceNotFoundError('employee not found')
      );
      expect(() => deleteEmployee(1)).rejects.toThrow(ResourceNotFoundError);
    });
  });
});

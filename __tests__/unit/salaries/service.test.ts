import 'jest-extended';
import {
  createSalary,
  getSalary,
  patchSalary,
} from '../../../src/salaries/service';
import { mockDependency } from '../../_utils';
import { BadRequestError, ResourceNotFoundError } from '../../../src/errors';
import {
  deleteSalaryByKey,
  getOverlappingSalaries,
  getSalaryByKey,
  insertSalary,
  saveSalary,
} from '../../../src/salaries/mysql';
import { Salary } from '../../../src/salaries/types';

jest.mock('../../../src/salaries/mysql');
const mockGetSalaryByKey = mockDependency(getSalaryByKey);
const mockInsertSalary = mockDependency(insertSalary);
const mockSaveSalary = mockDependency(saveSalary);
const mockDeleteSalary = mockDependency(deleteSalaryByKey);
const mockGetOverlappingSalaries = mockDependency(
  getOverlappingSalaries
).mockResolvedValue([]);

describe('salaries service', () => {
  const salary: Salary = {
    employeeNumber: 1,
    salary: 10000,
    fromDate: new Date(),
    toDate: new Date(),
  };

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('getSalary', () => {
    it('should return salary', async () => {
      mockGetSalaryByKey.mockResolvedValue(salary);
      const key = {
        employeeNumber: salary.employeeNumber,
        fromDate: salary.fromDate,
      };

      const result = await getSalary(key);
      expect(result).toEqual(salary);
      expect(mockGetSalaryByKey).toHaveBeenCalledOnce();
      expect(mockGetSalaryByKey).toHaveBeenCalledWith(
        expect.objectContaining(key)
      );
    });

    it('should throw error if salary is not found', async () => {
      mockGetSalaryByKey.mockRejectedValue(
        new ResourceNotFoundError('Salary not found')
      );
      expect(() =>
        getSalary({ employeeNumber: 2, fromDate: new Date() })
      ).rejects.toThrow(ResourceNotFoundError);
    });
  });

  describe('createSalary', () => {
    it('should create salary', async () => {
      mockGetOverlappingSalaries.mockResolvedValueOnce([]);

      const newSalary = {
        employeeNumber: 2,
        salary: 1,
        fromDate: new Date('2020-01-01'),
        toDate: new Date('2020-02-01'),
      };

      await createSalary(newSalary);

      expect(mockGetOverlappingSalaries).toHaveBeenCalledOnce();

      expect(mockInsertSalary).toHaveBeenCalledOnce();
      expect(mockInsertSalary).toHaveBeenCalledWith(newSalary);
    });

    it('should throw error when toDate <= fromDate', async () => {
      expect.assertions(2);

      const newSalary = {
        employeeNumber: 2,
        salary: 1,
        fromDate: new Date('2020-02-01'),
        toDate: new Date('2020-01-01'),
      };

      await expect(() => createSalary(newSalary)).rejects.toThrow(
        new BadRequestError('Invalid salary date range')
      );

      expect(mockGetOverlappingSalaries).toHaveBeenCalledTimes(0);
    });

    it('should throw error when salary already exists', () => {
      expect.assertions(1);

      const newSalary = {
        employeeNumber: 2,
        salary: 1,
        fromDate: new Date('2020-01-01'),
        toDate: new Date('2020-02-01'),
      };

      mockGetOverlappingSalaries.mockResolvedValueOnce([newSalary]);

      expect(() => createSalary(newSalary)).rejects.toThrow(
        new BadRequestError('Salary already exists')
      );
    });

    it('should throw error when salary date range overlaps with existing date ranges', () => {
      expect.assertions(1);

      const newSalary = {
        employeeNumber: 2,
        salary: 1,
        fromDate: new Date('2020-01-01'),
        toDate: new Date('2020-02-01'),
      };

      const existingSalary = {
        employeeNumber: 2,
        salary: 2,
        fromDate: new Date('2020-01-02'),
        toDate: new Date('2020-02-01'),
      };

      mockGetOverlappingSalaries.mockResolvedValueOnce([existingSalary]);

      expect(() => createSalary(newSalary)).rejects.toThrow(
        new BadRequestError('Invalid salary date range')
      );
    });
  });

  describe('patchSalary', () => {
    const key = {
      employeeNumber: salary.employeeNumber,
      fromDate: salary.fromDate,
    };

    it('should edit salary', async () => {
      mockGetSalaryByKey.mockResolvedValueOnce(salary);
      mockSaveSalary.mockResolvedValueOnce();

      const patch = { salary: 20000 };

      mockGetSalaryByKey.mockResolvedValueOnce({
        ...salary,
        ...patch,
      });

      await patchSalary(key, patch);

      expect(mockGetSalaryByKey).toHaveBeenCalledTimes(2);
      expect(mockGetSalaryByKey).toHaveBeenCalledWith(
        expect.objectContaining(key)
      );
      expect(mockSaveSalary).toHaveBeenCalledOnce();
      expect(mockSaveSalary).toHaveBeenCalledWith(key, { ...salary, ...patch });
    });

    it('should throw error if employee does not exist', async () => {
      mockGetSalaryByKey.mockRejectedValue(
        new ResourceNotFoundError('Salary not found')
      );
      expect(() => patchSalary(key, {})).rejects.toThrow(ResourceNotFoundError);
    });

    it('should throw error when salary date range overlaps with existing date ranges', () => {
      expect.assertions(1);

      const existingSalary = {
        employeeNumber: 2,
        salary: 1,
        fromDate: new Date('2020-01-01'),
        toDate: new Date('2020-02-01'),
      };

      const overlappingSalary = {
        employeeNumber: 2,
        salary: 5,
        fromDate: new Date('2020-02-02'),
        toDate: new Date('2020-03-02'),
      };

      mockGetSalaryByKey.mockResolvedValueOnce(existingSalary);
      mockGetOverlappingSalaries.mockResolvedValueOnce([overlappingSalary]);

      const patch = {
        toDate: new Date('2020-02-05'),
      };

      expect(() =>
        patchSalary(
          {
            employeeNumber: existingSalary.employeeNumber,
            fromDate: existingSalary.fromDate,
          },
          patch
        )
      ).rejects.toThrow(new BadRequestError('Invalid salary date range'));
    });
  });

  describe('deleteSalary', () => {
    const key = { employeeNumber: 1, fromDate: new Date() };

    it('should delete salary', async () => {
      await deleteSalaryByKey(key);

      expect(mockDeleteSalary).toHaveBeenCalledOnce();
      expect(mockDeleteSalary).toHaveBeenCalledWith(key);
    });

    it('should throw error if salary does not exist', async () => {
      mockDeleteSalary.mockRejectedValue(
        new ResourceNotFoundError('Salary not found')
      );
      expect(() => deleteSalaryByKey(key)).rejects.toThrow(
        ResourceNotFoundError
      );
    });
  });
});

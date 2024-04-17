import 'jest-extended';
import {
  deleteSalaryByKey,
  getOverlappingSalaries,
  getSalaryByKey,
  insertSalary,
  saveSalary,
} from '../../../src/salaries/mysql';
import db from '../../../src/infra/database/knex';
import { ResourceNotFoundError } from '../../../src/errors';
import { Salary, SalaryKey } from '../../../src/salaries/types';

describe('Mysql Persistence', () => {
  const existingSalary: Salary = {
    employeeNumber: 10001,
    salary: 62102,
    fromDate: new Date('1987-06-26'),
    toDate: new Date('1988-06-25'),
  };

  const newSalaryKey: SalaryKey = {
    employeeNumber: 10001,
    fromDate: new Date('2023-01-01'),
  };

  const newSalary: Salary = {
    employeeNumber: 10001,
    salary: 100000,
    fromDate: new Date('2023-01-01'),
    toDate: new Date('2023-02-01'),
  };

  const invalidSalaryKey: SalaryKey = {
    employeeNumber: -1,
    fromDate: new Date(),
  };

  afterAll(async () => {
    await db.destroy();
  });

  describe('getSalaryByKey', () => {
    it('should return a salary', async () => {
      const salary = await getSalaryByKey({
        employeeNumber: existingSalary.employeeNumber,
        fromDate: existingSalary.fromDate,
      });
      expect(salary).toEqual(existingSalary);
    });

    it('should throw error when salary does not exist', async () => {
      expect(() => getSalaryByKey(invalidSalaryKey)).rejects.toThrow(
        ResourceNotFoundError
      );
    });
  });

  describe('getOverlappingSalaries', () => {
    /**
     * EXISTING SALARIES in DB:
     * (10001,60117,'1986-06-26','1987-06-26')
     * (10001,62102,'1987-06-26','1988-06-25')
     */
    const dbSalaries = {
      '1986-06-26': {
        employeeNumber: 10001,
        salary: 60117,
        fromDate: new Date('1986-06-26'),
        toDate: new Date('1987-06-26'),
      },
      '1987-06-26': {
        employeeNumber: 10001,
        salary: 62102,
        fromDate: new Date('1987-06-26'),
        toDate: new Date('1988-06-25'),
      },
    };
    const baseSalary = { employeeNumber: 10001, salary: 1 };

    const cases: [string, Salary, Salary[]][] = [
      [
        'salary fromDate already exists for employee (A.employeeNumber = B.employeeNumber & A.fromDate = B.fromDate)',
        {
          ...baseSalary,
          fromDate: new Date('1986-06-26'),
          toDate: new Date('1986-06-27'),
        },
        [dbSalaries['1986-06-26']],
      ],
      [
        "salary starts before but ends after existing salary's fromDate (A.fromDate < B.fromDate < A.toDate)",
        {
          ...baseSalary,
          fromDate: new Date('1986-06-25'),
          toDate: new Date('1986-06-27'),
        },
        [dbSalaries['1986-06-26']],
      ],
      [
        "salary starts after and ends after existing salary's toDate (B.fromDate < A.fromDate < B.toDate)",
        {
          ...baseSalary,
          fromDate: new Date('1986-06-27'),
          toDate: new Date('1987-06-27'),
        },
        [dbSalaries['1986-06-26'], dbSalaries['1987-06-26']],
      ],
      [
        "given salary's date range fully contains existing salary's date range (B.fromDate < A.fromDate < A.toDate < B.toDate)",
        {
          ...baseSalary,
          fromDate: new Date('1986-06-25'),
          toDate: new Date('1987-06-27'),
        },
        [dbSalaries['1986-06-26'], dbSalaries['1987-06-26']],
      ],
      [
        "existing salary's date range fully contains given salary's date range (A.fromDate < B.fromDate & A.toDate > B.toDate)",
        {
          ...baseSalary,
          fromDate: new Date('1986-06-27'),
          toDate: new Date('1987-06-24'),
        },
        [dbSalaries['1986-06-26']],
      ],
    ];

    it.each(cases)(
      'should return overlapping salaries when %s',
      async (testName, salary, expected) => {
        expect(await getOverlappingSalaries(salary)).toEqual(expected);
      }
    );
  });

  describe('insertSalary', () => {
    it('should insert salary', async () => {
      await insertSalary(newSalary);

      const salary = await getSalaryByKey({
        employeeNumber: newSalary.employeeNumber,
        fromDate: newSalary.fromDate,
      });
      expect(salary).toEqual(newSalary);
    });
  });

  describe('saveSalary', () => {
    it('should edit salary', async () => {
      await saveSalary(newSalaryKey, {
        salary: 200000,
      });

      const updatedSalary = await getSalaryByKey(newSalaryKey);

      expect(updatedSalary.salary).toBe(200000);
    });

    it('should throw error when salary does not exist', async () => {
      expect(() =>
        saveSalary(invalidSalaryKey, { salary: 200000 })
      ).rejects.toThrow(ResourceNotFoundError);
    });
  });

  describe('deleteSalary', () => {
    it('should delete salary', async () => {
      await deleteSalaryByKey(newSalaryKey);
      expect(() => getSalaryByKey(newSalaryKey)).rejects.toThrow(
        ResourceNotFoundError
      );
    });

    it('should throw error if employee does not exist', async () => {
      expect(() => deleteSalaryByKey(newSalaryKey)).rejects.toThrow(
        ResourceNotFoundError
      );
    });
  });
});

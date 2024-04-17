import { BadRequestError } from '../errors';
import {
  insertSalary,
  getOverlappingSalaries,
  deleteSalaryByKey,
  getSalaryByKey,
  saveSalary,
  getSalariesByEmployeeNumber,
} from './mysql';
import { Salary, SalaryKey } from './types';

export const createSalary = async (salary: Salary): Promise<Salary> => {
  if (salary.toDate <= salary.fromDate) {
    throw new BadRequestError('Invalid salary date range');
  }

  const overlappingSalaries = await getOverlappingSalaries(salary);

  if (overlappingSalaries.length > 0) {
    if (
      overlappingSalaries.findIndex(
        (s) =>
          s.employeeNumber === salary.employeeNumber &&
          s.fromDate === salary.fromDate
      ) !== -1
    ) {
      throw new BadRequestError('Salary already exists');
    }
    throw new BadRequestError('Invalid salary date range');
  }

  await insertSalary(salary);

  return getSalaryByKey({
    employeeNumber: salary.employeeNumber,
    fromDate: salary.fromDate,
  });
};

function applyPatch(salary: Salary, patch: Partial<Salary>): Salary {
  return Object.entries(patch)
    .filter(([, v]) => v !== undefined)
    .reduce((c, [k, v]) => ({ ...c, [k]: v }), salary);
}

export const patchSalary = async (key: SalaryKey, patch: Partial<Salary>) => {
  let salary = await getSalaryByKey(key);

  salary = applyPatch(salary, patch);

  if (patch.fromDate !== undefined || patch.toDate !== undefined) {
    const overlappingSalaries = await getOverlappingSalaries(salary);
    if (overlappingSalaries.length > 0) {
      throw new BadRequestError('Invalid salary date range');
    }
  }

  await saveSalary(key, salary);

  return getSalaryByKey(key);
};

export const deleteSalary = async (key: SalaryKey) => deleteSalaryByKey(key);

export const getSalaries = async (employeeNumber: number) =>
  getSalariesByEmployeeNumber(employeeNumber);

export const getSalary = async (key: SalaryKey) => getSalaryByKey(key);

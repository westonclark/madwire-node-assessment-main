import { ResourceNotFoundError } from '../errors';
import db from '../infra/database/knex';
import { Salary, SalaryKey } from './types';

type SalaryModel = {
  emp_no: number;
  salary: number;
  from_date: Date;
  to_date: Date;
};

const fromDb = (s: SalaryModel): Salary => ({
  employeeNumber: s.emp_no,
  salary: s.salary,
  fromDate: s.from_date,
  toDate: s.to_date,
});

const forDb = (s: Salary): SalaryModel => ({
  emp_no: s.employeeNumber,
  salary: s.salary,
  from_date: s.fromDate,
  to_date: s.toDate,
});

export const getOverlappingSalaries = async (
  salary: Salary
): Promise<Salary[]> => {
  const qb = db<SalaryModel>('salaries')
    .select()
    .whereRaw(
      `emp_no = :emp_no AND
        (
          (:from_date = from_date) OR 
          (:from_date < from_date and :to_date > from_date) OR 
          (from_date < :from_date and to_date > :from_date)
        )`,
      forDb(salary)
    );

  const salaries = await qb;

  return salaries.map(fromDb);
};

export const getSalariesByEmployeeNumber = async (
  employeeNumber: number
): Promise<Salary[]> => {
  const salaryRecords = await db<SalaryModel>('salaries').where({
    emp_no: employeeNumber,
  });
  return salaryRecords.map(fromDb);
};

export const getSalaryByKey = async (key: SalaryKey): Promise<Salary> => {
  const qb = db<SalaryModel>('salaries')
    .first()
    .where({ emp_no: key.employeeNumber, from_date: key.fromDate });

  const salary = await qb;

  if (!salary) {
    throw new ResourceNotFoundError('Salary not found');
  }

  return fromDb(salary);
};

export const insertSalary = async (salary: Salary): Promise<number> => {
  const qb = db<SalaryModel>('salaries').insert(forDb(salary));

  const [id] = await qb;

  return id;
};

export const saveSalary = async (
  key: SalaryKey,
  patch: Partial<Salary>
): Promise<void> => {
  const qb = db<SalaryModel>('salaries')
    .update(patch)
    .where({ emp_no: key.employeeNumber, from_date: key.fromDate });

  const rowsAffected = await qb;

  if (rowsAffected < 1) {
    throw new ResourceNotFoundError('Salary not found');
  }
};

export const deleteSalaryByKey = async (key: SalaryKey): Promise<void> => {
  const deletedCount = await db('salaries')
    .del()
    .where({ emp_no: key.employeeNumber, from_date: key.fromDate });

  if (deletedCount < 1) {
    throw new ResourceNotFoundError('Salary not found');
  }
};

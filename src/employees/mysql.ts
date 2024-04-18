import db from '../infra/database/knex';
import {
  Employee,
  EmployeesFilterOptions,
  Gender,
  EmployeeWithTitle,
} from './types';
import { ResourceNotFoundError } from '../errors';

type EmployeeModel = {
  emp_no: number;
  birth_date: Date;
  first_name: string;
  last_name: string;
  gender: Gender;
  hire_date: Date;
  title?: string;
};

function fromDb(emp: EmployeeModel): EmployeeWithTitle {
  return {
    employeeNumber: emp.emp_no,
    birthDate: emp.birth_date,
    firstName: emp.first_name,
    lastName: emp.last_name,
    gender: emp.gender,
    hireDate: emp.hire_date,
    title: emp.title,
  };
}

function forDb(emp: Employee): EmployeeModel {
  return {
    emp_no: emp.employeeNumber,
    birth_date: emp.birthDate,
    first_name: emp.firstName,
    last_name: emp.lastName,
    gender: emp.gender,
    hire_date: emp.hireDate,
  };
}

const DEFAULT_LIMIT = 10;

export async function listEmployees({
  limit = DEFAULT_LIMIT,
  ...filter
}: EmployeesFilterOptions): Promise<EmployeeWithTitle[]> {
  let employees;

  if (filter.title) {
    employees = await db<EmployeeModel>('employees')
      .select('employees.*', 'titles.title')
      .innerJoin('titles', 'employees.emp_no', '=', 'titles.emp_no')
      .where('titles.title', filter.title)
      .limit(limit);
  } else {
    employees = await db<EmployeeModel>('employees').select('*').limit(limit);
  }

  if (!employees || employees.length == 0) {
    throw new ResourceNotFoundError('employees not found');
  }

  return employees.map(fromDb);
}

export async function getEmployeeByNumber(
  employeeNumber: number
): Promise<Employee> {
  const employee = await db<EmployeeModel>('employees')
    .select('*')
    .where('emp_no', employeeNumber)
    .first();

  if (!employee) {
    throw new ResourceNotFoundError('employee not found');
  }

  return fromDb(employee);
}

export async function insertEmployee(employee: Employee): Promise<number> {
  const [id] = await db<EmployeeModel>('employees').insert(forDb(employee));

  return id;
}

export async function saveEmployee(employee: Employee): Promise<void> {
  const rowsAffected = await db<EmployeeModel>('employees')
    .where('emp_no', employee.employeeNumber)
    .update(forDb(employee));

  if (rowsAffected < 1) {
    throw new ResourceNotFoundError('employee not found');
  }
}

export async function deleteEmployeeByNumber(
  employeeNumber: number
): Promise<void> {
  const rowsAffected = await db<EmployeeModel>('employees')
    .where('emp_no', employeeNumber)
    .del();

  if (rowsAffected < 1) {
    throw new ResourceNotFoundError('employee not found');
  }
}

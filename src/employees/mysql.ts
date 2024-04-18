import db from '../infra/database/knex';
import { Employee, Gender } from './types';
import { ResourceNotFoundError } from '../errors';

type EmployeeModel = {
  emp_no: number;
  birth_date: Date;
  first_name: string;
  last_name: string;
  gender: Gender;
  hire_date: Date;
};

function fromDb(emp: EmployeeModel): Employee {
  return {
    employeeNumber: emp.emp_no,
    birthDate: emp.birth_date,
    firstName: emp.first_name,
    lastName: emp.last_name,
    gender: emp.gender,
    hireDate: emp.hire_date,
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

export async function getEmployeesByTitle(limit: number): Promise<Employee[]> {
  const employees = await db<EmployeeModel>('employees')
    .select('*')
    .limit(limit);

  if (!employees || employees.length == 0) {
    throw new ResourceNotFoundError('employees not found');
  }

  return employees.map((employee) => fromDb(employee));
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

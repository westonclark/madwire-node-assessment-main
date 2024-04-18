import {
  deleteEmployeeByNumber,
  listEmployees,
  getEmployeeByNumber,
  insertEmployee,
  saveEmployee,
} from './mysql';
import {
  Employee,
  EmployeeWithTitle,
  EmployeePatch,
  NewEmployee,
  EmployeesFilterOptions,
} from './types';

export async function getEmployees(
  employeesFilterOptions: EmployeesFilterOptions
): Promise<EmployeeWithTitle[]> {
  return listEmployees(employeesFilterOptions);
}

export async function getEmployee(employeeNumber: number): Promise<Employee> {
  return getEmployeeByNumber(employeeNumber);
}

export async function createEmployee(
  newEmployee: NewEmployee
): Promise<Employee> {
  const newEmployeeNumber = Math.floor(Math.random() * 10000);
  await insertEmployee({
    ...newEmployee,
    employeeNumber: newEmployeeNumber,
  });

  return getEmployeeByNumber(newEmployeeNumber);
}

function applyPatch(
  employee: Employee,
  employeePatch: EmployeePatch
): Employee {
  return Object.entries(employeePatch)
    .filter(([, v]) => v !== undefined)
    .reduce((c, [k, v]) => ({ ...c, [k]: v }), employee);
}

export async function editEmployee(
  employeeNumber: number,
  employeePatch: EmployeePatch
): Promise<Employee> {
  const employee = await getEmployeeByNumber(employeeNumber);

  const updatedEmployee = applyPatch(employee, employeePatch);
  await saveEmployee(updatedEmployee);

  return getEmployeeByNumber(employeeNumber);
}

export async function deleteEmployee(employeeNumber: number): Promise<void> {
  await deleteEmployeeByNumber(employeeNumber);
}

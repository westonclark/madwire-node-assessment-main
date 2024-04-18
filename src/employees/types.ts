export enum Gender {
  male = 'M',
  female = 'F',
  other = 'O',
}

export type Employee = {
  employeeNumber: number;
  firstName: string;
  lastName: string;
  birthDate: Date;
  hireDate: Date;
  gender: Gender;
};

export type EmployeesFilterOptions = {
  title?: string;
  limit?: number;
};

export interface EmployeeWithTitle extends Employee {
  title?: string;
}

export type EmployeePatch = Partial<Employee>;
export type NewEmployee = Omit<Employee, 'employeeNumber'>;

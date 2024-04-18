import { Static } from '@fastify/type-provider-typebox';
import {
  EmployeeWithTitle,
  Employee,
  EmployeePatch,
  Gender,
  NewEmployee,
} from './types';
import {
  employeeSchema,
  newEmployeeSchema,
  patchEmployeeSchemaBody,
} from './schemas';

function mapGender(genderString: string): Gender {
  if (genderString.toLowerCase() === 'f') {
    return Gender.female;
  }
  if (genderString.toLowerCase() === 'm') {
    return Gender.male;
  }
  return Gender.other;
}

export function forResponse(employee: Employee): Static<typeof employeeSchema> {
  return {
    ...employee,
    birthDate: employee.birthDate.toISOString(),
    hireDate: employee.hireDate.toISOString(),
  };
}

export function newEmployeeFromRequest(
  employee: Static<typeof newEmployeeSchema>
): NewEmployee {
  return {
    ...employee,
    gender: mapGender(employee.gender),
    birthDate: new Date(employee.birthDate),
    hireDate: new Date(employee.hireDate),
  };
}

export function patchEmployeeFromRequest(
  employee: Static<typeof patchEmployeeSchemaBody>
): EmployeePatch {
  return {
    ...employee,
    gender: employee.gender ? mapGender(employee.gender) : undefined,
    birthDate: employee.birthDate ? new Date(employee.birthDate) : undefined,
    hireDate: employee.hireDate ? new Date(employee.hireDate) : undefined,
  };
}

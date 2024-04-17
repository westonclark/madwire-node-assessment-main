export const mockDependency = <T extends (...args: any) => any>(
  dep: T
): jest.MockedFunction<T> => dep as jest.MockedFunction<T>;

export const env: string = process.env.ENV ?? 'development';
export const isTest: boolean = process.env.NODE_ENV === 'test';
export const isDevelopment: boolean = env === 'development';
export const isProduction: boolean = env === 'production';

export const config = {
  baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',
  defaultTimeout: 30_000,
} as const;

export const urls = {
  home: '/',
  login: '/welcome',
  contacts: '/objects/people',
  companies: '/objects/companies',
  pipeline: '/objects/opportunities',
} as const;

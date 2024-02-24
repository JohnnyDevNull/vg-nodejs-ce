import { Prisma } from '@prisma/client';

export const customers: Prisma.CustomerUpsertArgs['create'][] = [
  {
    id: '9e391faf-64b2-4d4c-b879-463532920fd3',
    email: 'user@gmail.com',
    role: 0,
    activated: false,
    activationCode: '123456',
    password: 'randow-password',
  },
  {
    id: '9e391faf-64b2-4d4c-b879-463532920fd4',
    email: 'user2@gmail.com',
    role: 1,
    activated: true,
    activationCode: '654321',
    password: 'randow-password',
  },
  {
    id: '9e391faf-64b2-4d4c-b879-463532920fd5',
    email: 'admin1@gmail.com',
    role: 2,
    activated: true,
    activationCode: '321987',
    password: 'randow-password-admin',
  },
];

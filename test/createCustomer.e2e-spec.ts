import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth/auth.service';
import { CustomerService } from 'src/customer/customer.service';
import * as request from 'supertest';
import { gqlEndpoint } from './constants';
import { seedCustomerData } from './util/seed-customer-data.function';

describe('GraphQL CustomerResolver (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let customerService: CustomerService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await seedCustomerData(moduleFixture);
    authService = moduleFixture.get(AuthService);
    customerService = moduleFixture.get(CustomerService);

    try {
      await customerService.deleteCustomerByEmail('test-user3@gmail.com');
    } catch {}
  });

  afterAll(async () => {
    await app.close();
  });

  describe('mutation createCustomer', () => {
    it('should return Unauthorized for createCustomer call without token', () => {
      return request(app.getHttpServer())
        .post(gqlEndpoint)
        .send({
          query: `mutation {
          createCustomer(data: {
            email: "test-user3@gmail.com",
            password: "testXYZ456",
            role: 1
          }) {
            id, email, role, activated, activationCode
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeNull();
          expect(res.body.errors).toHaveLength(1);
          expect(res.body.errors[0]).toStrictEqual({
            extensions: {
              code: 'UNAUTHENTICATED',
              response: { message: 'Unauthorized', statusCode: 401 },
            },
            message: 'Unauthorized',
          });
        });
    });

    it('should return Forbidden resource for createCustomer call with PUBLIC role token', async () => {
      const user = await customerService.findOneByEmail('test-user1@gmail.com');
      const tokenData = authService.createToken(user);

      return request(app.getHttpServer())
        .post(gqlEndpoint)
        .set('Authorization', `Bearer ${tokenData.accessToken}`)
        .send({
          query: `mutation {
          createCustomer(data: {
            email: "test-user3@gmail.com",
            password: "testXYZ456",
            role: 1
          }) {
            id, email, role, activated, activationCode
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeNull();
          expect(res.body.errors).toHaveLength(1);
          expect(res.body.errors[0]).toStrictEqual({
            extensions: {
              code: 'FORBIDDEN',
              response: {
                error: 'Forbidden',
                message: 'Forbidden resource',
                statusCode: 403,
              },
            },
            message: 'Forbidden resource',
          });
        });
    });

    it('should return Forbidden resource for createCustomer call with USER role token', async () => {
      const user = await customerService.findOneByEmail('test-user2@gmail.com');
      const tokenData = authService.createToken(user);

      return request(app.getHttpServer())
        .post(gqlEndpoint)
        .set('Authorization', `Bearer ${tokenData.accessToken}`)
        .send({
          query: `mutation {
          createCustomer(data: {
            email: "test-user3@gmail.com",
            password: "testXYZ456",
            role: 1
          }) {
            id, email, role, activated, activationCode
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeNull();
          expect(res.body.errors).toHaveLength(1);
          expect(res.body.errors[0]).toStrictEqual({
            extensions: {
              code: 'FORBIDDEN',
              response: {
                error: 'Forbidden',
                message: 'Forbidden resource',
                statusCode: 403,
              },
            },
            message: 'Forbidden resource',
          });
        });
    });

    it('should return the created customer for ADMIN role by id', async () => {
      const user = await customerService.findOneByEmail(
        'test-admin1@gmail.com',
      );
      const tokenData = authService.createToken(user);

      return request(app.getHttpServer())
        .post(gqlEndpoint)
        .set('Authorization', `Bearer ${tokenData.accessToken}`)
        .send({
          query: `mutation {
          createCustomer(data: {
            email: "test-user3@gmail.com",
            password: "testXYZ456",
            role: 1
          }) {
            id, email, role, activated, activationCode
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).not.toBeNull();
          expect(res.body.data.createCustomer).not.toBeNull();
          expect(res.body.data.createCustomer.email).toEqual(
            'test-user3@gmail.com',
          );
          expect(res.body.data.createCustomer.password).toBeUndefined();
          expect(res.body.data.createCustomer.role).toEqual(1);
          expect(res.body.data.createCustomer.activated).toEqual(false);
          expect(res.body.data.createCustomer.activationCode).toHaveLength(6);
          expect(res.body.errors).toBeUndefined();
        });
    });
  });
});

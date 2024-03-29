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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('mutation updateCustomer', () => {
    it('should return Unauthorized for updateCustomer call without token', () => {
      return request(app.getHttpServer())
        .post(gqlEndpoint)
        .send({
          query: `mutation {
          updateCustomer(data: { id: "1e391faf-64b2-4d4c-b879-463532920fd1", role: 1 }) {
            id, email, role, activated, activationCode, createdAt, updatedAt
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toStrictEqual({ updateCustomer: null });
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

    it('should return Forbidden resource for updateCustomer call with PUBLIC role token', async () => {
      const user = await customerService.findOneByEmail('test-user1@gmail.com');
      const tokenData = authService.createToken(user);

      return request(app.getHttpServer())
        .post(gqlEndpoint)
        .set('Authorization', `Bearer ${tokenData.accessToken}`)
        .send({
          query: `mutation {
          updateCustomer(data: { id: "1e391faf-64b2-4d4c-b879-463532920fd1", role: 1 }) {
            id, email, role, activated, activationCode, createdAt, updatedAt
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toStrictEqual({ updateCustomer: null });
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

    it('should return Forbidden resource for updateCustomer call with USER role token', async () => {
      const user = await customerService.findOneByEmail('test-user2@gmail.com');
      const tokenData = authService.createToken(user);

      return request(app.getHttpServer())
        .post(gqlEndpoint)
        .set('Authorization', `Bearer ${tokenData.accessToken}`)
        .send({
          query: `mutation {
          updateCustomer(data: { id: "1e391faf-64b2-4d4c-b879-463532920fd1", role: 1 }) {
            id, email, role, activated, activationCode, createdAt, updatedAt
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toStrictEqual({ updateCustomer: null });
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

    it('should return the updated customer for ADMIN role', async () => {
      const user = await customerService.findOneByEmail(
        'test-admin1@gmail.com',
      );
      const tokenData = authService.createToken(user);

      return request(app.getHttpServer())
        .post(gqlEndpoint)
        .set('Authorization', `Bearer ${tokenData.accessToken}`)
        .send({
          query: `mutation {
          updateCustomer(data: { id: "1e391faf-64b2-4d4c-b879-463532920fd1", role: 1 }) {
            id, email, role, activated, activationCode
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).not.toEqual(null);
          expect(res.body.data.updateCustomer).toStrictEqual({
            activated: false,
            activationCode: '',
            email: 'test-user1@gmail.com',
            id: '1e391faf-64b2-4d4c-b879-463532920fd1',
            role: 1,
          });
          expect(res.body.errors).toBeUndefined();
        });
    });
  });
});

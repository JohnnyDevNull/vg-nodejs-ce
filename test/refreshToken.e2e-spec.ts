import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth/auth.service';
import { CustomerService } from 'src/customer/customer.service';
import * as request from 'supertest';
import { gqlEndpoint } from './constants';
import { seedCustomerData } from './util/seed-customer-data.function';

describe('GraphQL AuthResolver (e2e)', () => {
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

  describe('query refreshToken', () => {
    it('should return a token response for a valid request', async () => {
      const user = await customerService.findOneByEmail(
        'test-admin1@gmail.com',
      );
      const tokenData = authService.createToken(user);

      return request(app.getHttpServer())
        .post(gqlEndpoint)
        .send({
          query: `{
          refreshToken(data: { token: "${tokenData.refreshToken}" }) {
            accessToken,
            refreshToken,
            user {
              id, email, role
            }
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).not.toBeNull();
          expect(res.body.data.refreshToken.accessToken).toBeTruthy();
          expect(res.body.data.refreshToken.refreshToken).toBeTruthy();
          expect(res.body.data.refreshToken.user.email).toEqual(
            'test-admin1@gmail.com',
          );
          expect(res.body.data.refreshToken.user.id).toBeTruthy();
          expect(res.body.data.refreshToken.user.role).toEqual(2);
          expect(res.body.errors).toBeUndefined();
        });
    });

    it('should not return a token response for an accessToken', async () => {
      const user = await customerService.findOneByEmail(
        'test-admin1@gmail.com',
      );
      const tokenData = authService.createToken(user);

      return request(app.getHttpServer())
        .post(gqlEndpoint)
        .send({
          query: `{
          refreshToken(data: { token: "${tokenData.accessToken}" }) {
            accessToken,
            refreshToken,
            user {
              id, email, role
            }
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toStrictEqual({ refreshToken: null });
          expect(res.body.errors).toBeUndefined();
        });
    });
  });
});

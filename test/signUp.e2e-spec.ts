import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { CustomerService } from 'src/customer/customer.service';
import * as request from 'supertest';
import { gqlEndpoint } from './constants';
import { seedCustomerData } from './util/seed-customer-data.function';

describe('GraphQL AuthResolver (e2e)', () => {
  let app: INestApplication;
  let customerService: CustomerService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await seedCustomerData(moduleFixture);
    customerService = moduleFixture.get(CustomerService);

    try {
      await customerService.deleteCustomerByEmail('test-user3@gmail.com');
    } catch {}
  });

  afterAll(async () => {
    await app.close();
  });

  describe('query signUp', () => {
    it('should return a token response for a valid request', async () => {
      return request(app.getHttpServer())
        .post(gqlEndpoint)
        .send({
          query: `{
          signUp(data: { email: "test-user3@gmail.com", password: "testXYZ999" }) {
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
          expect(res.body.data.signUp.accessToken).toBeTruthy();
          expect(res.body.data.signUp.refreshToken).toBeTruthy();
          expect(res.body.data.signUp.user.email).toEqual(
            'test-user3@gmail.com',
          );
          expect(res.body.data.signUp.user.id).toBeTruthy();
          expect(res.body.data.signUp.user.role).toEqual(0);
          expect(res.body.errors).toBeUndefined();
        });
    });
  });
});

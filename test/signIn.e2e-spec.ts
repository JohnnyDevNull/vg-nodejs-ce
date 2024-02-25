import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';
import { gqlEndpoint } from './constants';
import { seedCustomerData } from './util/seed-customer-data.function';

describe('GraphQL AuthResolver (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await seedCustomerData(moduleFixture);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('query signIn', () => {
    it('should return a token response for a valid request', async () => {
      return request(app.getHttpServer())
        .post(gqlEndpoint)
        .send({
          query: `{
          signIn(data: { email: "test-user1@gmail.com", password: "testABC123" }) {
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
          expect(res.body.data.signIn.accessToken).toBeTruthy();
          expect(res.body.data.signIn.refreshToken).toBeTruthy();
          expect(res.body.data.signIn.user).toStrictEqual({
            email: 'test-user1@gmail.com',
            id: '1e391faf-64b2-4d4c-b879-463532920fd1',
            role: 0,
          });
          expect(res.body.errors).toBeUndefined();
        });
    });

    it('should not return a token response for an invalid password', async () => {
      return request(app.getHttpServer())
        .post(gqlEndpoint)
        .send({
          query: `{
          signIn(data: { email: "test-user1@gmail.com", password: "xxxxxx" }) {
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
          expect(res.body.data).toStrictEqual({ signIn: null });
          expect(res.body.errors).toBeUndefined();
        });
    });

    it('should not return a token response for an invalid email', async () => {
      return request(app.getHttpServer())
        .post(gqlEndpoint)
        .send({
          query: `{
          signIn(data: { email: "unknown-user@gmail.com", password: "testABC123" }) {
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
          expect(res.body.data).toStrictEqual({ signIn: null });
          expect(res.body.errors).toBeUndefined();
        });
    });
  });
});

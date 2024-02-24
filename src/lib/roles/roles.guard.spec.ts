import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from './roles.enum';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflcetor: Reflector;

  beforeEach(() => {
    reflcetor = getReflectorMock();
    guard = new RolesGuard(reflcetor);
    GqlExecutionContext.create = jest.fn();
  });

  it('should return true for no role', () => {
    jest.spyOn(reflcetor, 'getAllAndOverride').mockReturnValue(null);
    expect(guard.canActivate(getContextMock())).toEqual(true);
  });

  it('should return true for role [PUBLIC]', () => {
    jest.spyOn(reflcetor, 'getAllAndOverride').mockReturnValue(Role.PUBLIC);
    expect(guard.canActivate(getContextMock())).toEqual(true);
  });

  it('should return false for role [USER] when no user is given', () => {
    jest.spyOn(reflcetor, 'getAllAndOverride').mockReturnValue(Role.USER);
    GqlExecutionContext.create = jest.fn().mockReturnValue(getGqlContextMock());
    expect(guard.canActivate(getContextMock())).toEqual(false);
  });

  it('should return true for role [USER] when user is given with the corresponding role', () => {
    jest.spyOn(reflcetor, 'getAllAndOverride').mockReturnValue(Role.USER);
    GqlExecutionContext.create = jest
      .fn()
      .mockReturnValue(getGqlContextMock({ role: Role.USER }));
    expect(guard.canActivate(getContextMock())).toEqual(true);
  });

  it('should return false for role [USER] when user is given with lower role', () => {
    jest.spyOn(reflcetor, 'getAllAndOverride').mockReturnValue(Role.USER);
    GqlExecutionContext.create = jest
      .fn()
      .mockReturnValue(getGqlContextMock({ role: Role.PUBLIC }));
    expect(guard.canActivate(getContextMock())).toEqual(false);
  });

  it('should return true for role [USER] when user is given with higher role', () => {
    jest.spyOn(reflcetor, 'getAllAndOverride').mockReturnValue(Role.USER);
    GqlExecutionContext.create = jest
      .fn()
      .mockReturnValue(getGqlContextMock({ role: Role.ADMIN }));
    expect(guard.canActivate(getContextMock())).toEqual(true);
  });

  it('should return false for role [ADMIN] when no user is given', () => {
    jest.spyOn(reflcetor, 'getAllAndOverride').mockReturnValue(Role.ADMIN);
    GqlExecutionContext.create = jest.fn().mockReturnValue(getGqlContextMock());
    expect(guard.canActivate(getContextMock())).toEqual(false);
  });

  it('should return true for role [ADMIN] when user is given with the corresponding role', () => {
    jest.spyOn(reflcetor, 'getAllAndOverride').mockReturnValue(Role.ADMIN);
    GqlExecutionContext.create = jest
      .fn()
      .mockReturnValue(getGqlContextMock({ role: Role.ADMIN }));
    expect(guard.canActivate(getContextMock())).toEqual(true);
  });

  it('should return false for role [ADMIN] when user is given with lower role [USER]', () => {
    jest.spyOn(reflcetor, 'getAllAndOverride').mockReturnValue(Role.ADMIN);
    GqlExecutionContext.create = jest
      .fn()
      .mockReturnValue(getGqlContextMock({ role: Role.USER }));
    expect(guard.canActivate(getContextMock())).toEqual(false);
  });

  it('should return false for role [ADMIN] when user is given with lower role [PUBLIC]', () => {
    jest.spyOn(reflcetor, 'getAllAndOverride').mockReturnValue(Role.ADMIN);
    GqlExecutionContext.create = jest
      .fn()
      .mockReturnValue(getGqlContextMock({ role: Role.PUBLIC }));
    expect(guard.canActivate(getContextMock())).toEqual(false);
  });
});

function getContextMock(): ExecutionContext {
  return {
    getHandler: () => null,
    getClass: () => null,
    getArgs: () => null,
    getType: () => null,
    getArgByIndex: () => null,
    switchToHttp: () => null,
    switchToRpc: () => null,
    switchToWs: () => null,
  };
}

function getGqlContextMock(user: any = undefined) {
  return {
    getContext: () => ({ req: { user } }),
  };
}

function getReflectorMock(): Reflector {
  return {
    get: jest.fn(),
    getAll: jest.fn(),
    getAllAndMerge: jest.fn(),
    getAllAndOverride: jest.fn(),
  };
}

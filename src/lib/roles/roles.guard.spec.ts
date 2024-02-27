import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from './roles.enum';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = getReflectorMock();
    guard = new RolesGuard(reflector);
    GqlExecutionContext.create = jest.fn();
  });

  it('should return true for no role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    expect(guard.canActivate(getContextMock())).toEqual(true);
  });

  it('should return true for role [PUBLIC]', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(Role.PUBLIC);
    expect(guard.canActivate(getContextMock())).toEqual(true);
  });

  it('should return false for role [USER] when no user is given', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(Role.USER);
    GqlExecutionContext.create = jest.fn().mockReturnValue(getGqlContextMock());
    expect(guard.canActivate(getContextMock())).toEqual(false);
  });

  it('should return true for role [USER] when user is given with the corresponding role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(Role.USER);
    GqlExecutionContext.create = jest
      .fn()
      .mockReturnValue(getGqlContextMock({ role: Role.USER }));
    expect(guard.canActivate(getContextMock())).toEqual(true);
  });

  it('should return false for role [USER] when user is given with lower role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(Role.USER);
    GqlExecutionContext.create = jest
      .fn()
      .mockReturnValue(getGqlContextMock({ role: Role.PUBLIC }));
    expect(guard.canActivate(getContextMock())).toEqual(false);
  });

  it('should return true for role [USER] when user is given with higher role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(Role.USER);
    GqlExecutionContext.create = jest
      .fn()
      .mockReturnValue(getGqlContextMock({ role: Role.ADMIN }));
    expect(guard.canActivate(getContextMock())).toEqual(true);
  });

  it('should return false for role [ADMIN] when no user is given', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(Role.ADMIN);
    GqlExecutionContext.create = jest.fn().mockReturnValue(getGqlContextMock());
    expect(guard.canActivate(getContextMock())).toEqual(false);
  });

  it('should return true for role [ADMIN] when user is given with the corresponding role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(Role.ADMIN);
    GqlExecutionContext.create = jest
      .fn()
      .mockReturnValue(getGqlContextMock({ role: Role.ADMIN }));
    expect(guard.canActivate(getContextMock())).toEqual(true);
  });

  it('should return false for role [ADMIN] when user is given with lower role [USER]', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(Role.ADMIN);
    GqlExecutionContext.create = jest
      .fn()
      .mockReturnValue(getGqlContextMock({ role: Role.USER }));
    expect(guard.canActivate(getContextMock())).toEqual(false);
  });

  it('should return false for role [ADMIN] when user is given with lower role [PUBLIC]', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(Role.ADMIN);
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

import { getActivationCode } from './activation-code.function';

describe('getActivationCode', () => {
  it('should pad to 6 char when zero', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(getActivationCode()).toEqual('000000');
  });

  it('should pad to 6 char when not zero', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.0123);
    expect(getActivationCode()).toEqual('012300');
  });

  it('should return a activation code of 6 char', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.12987654321);
    expect(getActivationCode()).toEqual('129877');
  });
});

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomerService } from '../customer/customer.service';
import { jwtConstants } from './constants';

export interface ITokenPayload {
  subject: string;
  email: string;
  isAccessToken?: boolean;
  isRefreshToken?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly customerService: CustomerService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: ITokenPayload) {
    if (!payload || !payload.subject || payload.isRefreshToken) {
      throw new UnauthorizedException();
    }

    const user = await this.customerService.findOneById(payload.subject);
    if (!user) {
      throw new UnauthorizedException();
    }

    return { id: user.id, email: user.email, role: user.role };
  }
}

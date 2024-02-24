import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { Customer } from 'lib/entities/customer.entity';
import { Token } from 'lib/entities/token.entity';
import { CustomerService } from '../customer/customer.service';
import { ITokenPayload } from './jwt-strategy.service';

@Injectable()
export class AuthService {
  constructor(
    private customerService: CustomerService,
    private jwtService: JwtService,
  ) {}

  async authenticate(email: string, password: string) {
    const user = await this.customerService.findOneByEmail(email);
    if (!user) {
      return null;
    }

    const passwordHashMatch = await compare(password, user.password);
    if (!passwordHashMatch) {
      return null;
    }

    return this.createToken(user);
  }

  createToken(user: Customer): Token {
    const payload: ITokenPayload = {
      subject: user.id,
      email: user.email,
    };
    return {
      accessToken: this.jwtService.sign(
        { ...payload, isAccessToken: true },
        { expiresIn: '30m' },
      ),
      refreshToken: this.jwtService.sign(
        { ...payload, isRefreshToken: true },
        { expiresIn: '24h' },
      ),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async refresh(token: string) {
    const payload = this.jwtService.verify(token);
    if (!payload.isRefreshToken) {
      return null;
    }

    const user = await this.customerService.findOneById(payload.subject);
    if (!user) {
      return null;
    }

    return this.createToken(user);
  }
}

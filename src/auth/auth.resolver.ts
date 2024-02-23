import { Logger } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { BaseResolver } from 'lib/base.resolver';
import { Token } from 'lib/entities/token.entity';
import {
  RefreshTokenInput,
  SignInInput,
  SignUpInput,
} from 'src/auth/dto/auth.input';
import { CustomerService } from 'src/customer/customer.service';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver extends BaseResolver {
  protected logger = new Logger(AuthResolver.name);

  constructor(
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
  ) {
    super();
  }

  @Query(() => Token, { nullable: true })
  async signIn(@Args('data') data: SignInInput) {
    let response: Token;

    try {
      const { email, password } = data;
      response = await this.authService.authenticate(email, password);
    } catch (error) {
      this.logWarning(error, data);
    }

    return response;
  }

  @Query(() => Token, { nullable: true })
  async signUp(@Args('data') data: SignUpInput) {
    let response: Token;

    try {
      const { email, password } = data;
      const user = await this.customerService.createUser({ email, password });
      response = this.authService.createToken(user);
    } catch (error) {
      this.logWarning(error, data);
    }

    return response;
  }

  @Query(() => Token, { nullable: true })
  async refreshToken(@Args('data') data: RefreshTokenInput) {
    let response: Token;

    try {
      const { token } = data;
      response = await this.authService.refresh(token);
    } catch (error) {
      this.logWarning(error, data);
    }

    return response;
  }
}

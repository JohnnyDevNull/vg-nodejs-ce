import { Logger, UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { BaseResolver } from 'lib/base.resolver';
import { Token } from 'lib/entities/token.entity';
import { getActivationCode } from 'lib/functions/activation-code.function';
import { Roles } from 'lib/roles/roles.decorator';
import { Role } from 'lib/roles/roles.enum';
import { RolesGuard } from 'lib/roles/roles.guard';
import { CustomerService } from '../customer/customer.service';
import { AuthService } from './auth.service';
import { RefreshTokenInput, SignInInput, SignUpInput } from './dto/auth.input';

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
  @UseGuards(RolesGuard)
  @Roles(Role.PUBLIC)
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
  @UseGuards(RolesGuard)
  @Roles(Role.PUBLIC)
  async signUp(@Args('data') data: SignUpInput) {
    let response: Token;

    try {
      const { email, password } = data;
      const activationCode = getActivationCode();
      const user = await this.customerService.createUser({
        email,
        password,
        activationCode,
      });
      response = this.authService.createToken(user);
    } catch (error) {
      this.logWarning(error, data);
    }

    return response;
  }

  @Query(() => Token, { nullable: true })
  @UseGuards(RolesGuard)
  @Roles(Role.PUBLIC)
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

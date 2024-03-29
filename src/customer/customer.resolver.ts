import { BadRequestException, Logger, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BaseResolver } from 'lib/base.resolver';
import { Customer } from 'lib/entities/customer.entity';
import { getActivationCode } from 'lib/functions/activation-code.function';
import { Roles } from 'lib/roles/roles.decorator';
import { Role } from 'lib/roles/roles.enum';
import { RolesGuard } from 'lib/roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CustomerService } from './customer.service';
import {
  ActivateCustomer,
  CreateCustomer,
  DeleteCustomer,
  GetCustomerInput,
  GetOneCustomerInput,
  UpdateCustomer,
} from './dto/customer.input';

@Resolver(() => Customer)
export class CustomerResolver extends BaseResolver {
  protected logger = new Logger(CustomerResolver.name);

  constructor(private readonly customerService: CustomerService) {
    super();
  }

  @Query(() => [Customer])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  async customers(@Args('data') data: GetCustomerInput) {
    let response: Customer[] = [];
    const { skip, take, where } = data;

    try {
      response = await this.customerService.findAll({ skip, take, where });
    } catch (error) {
      this.logWarning(error, data);
    }

    return response;
  }

  @Query(() => Customer, { nullable: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  async customer(@Args('data') data: GetOneCustomerInput) {
    const { id, email } = data;

    if (!id && !email) {
      throw new BadRequestException();
    }

    let response: Customer = null;

    try {
      if (id) {
        response = await this.customerService.findOneById(id);
      } else if (email) {
        response = await this.customerService.findOneByEmail(email);
      }
    } catch (error) {
      this.logWarning(error, data);
    }

    return response;
  }

  @Mutation(() => Customer, { nullable: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateCustomer(@Args('data') data: UpdateCustomer) {
    const { id, email, role } = data;
    let response: Customer = null;

    try {
      const user = await this.customerService.findOneById(id);
      if (user) {
        const data = {
          email: email || user.email,
          role: role ?? user.role,
        };
        response = await this.customerService.updateCustomer(id, data);
      }
    } catch (error) {
      this.logWarning(error, data);
    }

    return response;
  }

  @Mutation(() => Customer, { nullable: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteCustomer(@Args('data') data: DeleteCustomer) {
    const { id, email } = data;

    if (!id && !email) {
      throw new BadRequestException();
    }

    let response;

    try {
      if (id) {
        response = await this.customerService.deleteCustomerById(id);
      } else if (email) {
        response = await this.customerService.deleteCustomerByEmail(email);
      }
    } catch (error) {
      this.logWarning(error, data);
    }

    return response;
  }

  @Mutation(() => Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createCustomer(@Args('data') data: CreateCustomer) {
    let response: Customer = null;

    try {
      const { email, password, role } = data;
      const activationCode = getActivationCode();

      const user = await this.customerService.findOneByEmail(email);
      if (user) {
        throw new BadRequestException();
      }

      response = await this.customerService.createCustomer({
        email,
        password,
        role,
        activationCode,
      });
    } catch (error) {
      // no sensitive data logging
      delete data.password;
      this.logWarning(error, data);
    }

    return response;
  }

  @Mutation(() => Customer, { nullable: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PUBLIC)
  async activateCustomer(
    @Args('data') data: ActivateCustomer,
    @Context('req') req: any,
  ) {
    let response: Customer = null;

    try {
      const { user: requestUser } = req;
      const { email, activationCode } = data;

      if (requestUser.email !== email) {
        throw new BadRequestException('Cannot activate other user');
      }

      const user = await this.customerService.findOneByEmail(email);
      if (!user || user.activationCode !== activationCode || user.activated) {
        throw new BadRequestException(
          'Activation codes does not match or already activated',
        );
      }

      response = await this.customerService.updateCustomer(user.id, {
        activated: true,
      });
    } catch (error) {
      this.logWarning(error, data);
    }

    return response;
  }
}

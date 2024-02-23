import { BadRequestException, Logger } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BaseResolver } from 'lib/base.resolver';
import { Customer } from 'lib/entities/customer.entity';
import { CustomerService } from './customer.service';
import {
  CreateUser,
  DeleteUser,
  GetCustomerInput,
  GetOneCustomerInput,
  UpdateUser,
} from './dto/customer.input';

@Resolver(() => Customer)
export class CustomerResolver extends BaseResolver {
  protected logger = new Logger(CustomerResolver.name);

  constructor(private readonly customerService: CustomerService) {
    super();
  }

  @Query(() => [Customer])
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
  async updateUser(@Args('data') data: UpdateUser) {
    const { id, email, role } = data;
    let response: Customer = null;

    try {
      const user = await this.customerService.findOneById(id);
      if (user) {
        const data = {
          email: email || user.email,
          role: role ?? user.role,
        };
        response = await this.customerService.updateUser(id, data);
      }
    } catch (error) {
      this.logWarning(error, data);
    }

    return response;
  }

  @Mutation(() => Customer, { nullable: true })
  async deleteUser(@Args('data') data: DeleteUser) {
    const { id, email } = data;

    if (!id && !email) {
      throw new BadRequestException();
    }

    let response;

    try {
      if (id) {
        response = await this.customerService.deleteUserById(id);
      } else if (email) {
        response = await this.customerService.deleteUserByEmail(email);
      }
    } catch (error) {
      this.logWarning(error, data);
    }

    return response;
  }

  @Mutation(() => Customer)
  async createUser(@Args('data') data: CreateUser) {
    let response: Customer = null;

    try {
      const { email, password, role } = data;

      const user = await this.customerService.findOneByEmail(email);
      if (user) {
        throw new BadRequestException();
      }

      response = await this.customerService.createUser({
        email,
        password,
        role,
      });
    } catch (error) {
      // no sensitive data logging
      delete data.password;
      this.logWarning(error, data);
    }

    return response;
  }
}

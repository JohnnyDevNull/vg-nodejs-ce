import { BadRequestException, Logger } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
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
export class CustomerResolver {
  private readonly logger = new Logger(CustomerResolver.name);

  constructor(private readonly customerService: CustomerService) {}

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
    const { id, email } = data;
    let response: Customer = null;

    try {
      response = await this.customerService.updateUser(id, { email });
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
  async createUser(@Args('data') { email, password }: CreateUser) {
    const user = await this.customerService.findOneByEmail(email);

    if (user) {
      throw new BadRequestException();
    }

    let response: Customer = null;

    try {
      response = await this.customerService.createUser({ email, password });
    } catch (error) {
      this.logWarning(error);
    }

    return response;
  }

  private logWarning(obj: any, ...params: any[]) {
    const errorObj = {
      meta: obj.meta || obj.message || obj,
      params,
    };
    this.logger.warn(errorObj);
  }
}

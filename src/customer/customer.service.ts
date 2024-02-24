import { Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from '../prisma.service';
import {
  CreateCustomer,
  GetCustomerInput,
  UpdateCustomer,
} from './dto/customer.input';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: GetCustomerInput) {
    const { skip, take, cursor, where } = params;

    return this.prisma.customer.findMany({
      skip,
      take,
      cursor,
      where,
    });
  }

  async findOneById(id: string) {
    return this.prisma.customer.findFirst({ where: { id } });
  }

  async findOneByEmail(email: string) {
    return this.prisma.customer.findFirst({ where: { email } });
  }

  async updateCustomer(
    id: string,
    data: Omit<Partial<UpdateCustomer>, 'id'> & { activated?: boolean },
  ) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  async deleteCustomerById(id: string) {
    return this.prisma.customer.delete({ where: { id } });
  }

  async deleteCustomerByEmail(email: string) {
    return this.prisma.customer.delete({ where: { email } });
  }

  async createCustomer(data: CreateCustomer & { activationCode: string }) {
    const password = await hash(data.password, 10);
    return this.prisma.customer.create({ data: { ...data, password } });
  }
}

import { Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from '../prisma.service';
import { CreateUser, GetCustomerInput, UpdateUser } from './dto/customer.input';

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

  async updateUser(
    id: string,
    data: Omit<Partial<UpdateUser>, 'id'> & { activated?: boolean },
  ) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  async deleteUserById(id: string) {
    return this.prisma.customer.delete({ where: { id } });
  }

  async deleteUserByEmail(email: string) {
    return this.prisma.customer.delete({ where: { email } });
  }

  async createUser(data: CreateUser & { activationCode: string }) {
    const password = await hash(data.password, 10);
    return this.prisma.customer.create({ data: { ...data, password } });
  }
}

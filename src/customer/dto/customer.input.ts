import { Field, InputType, Int } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';

@InputType()
export class WhereCustomerInput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

@InputType()
export class GetCustomerInput {
  @Field(() => String, { nullable: true })
  cursor?: Prisma.CustomerWhereUniqueInput;

  @Field(() => Int, { nullable: true })
  skip: number;

  @Field(() => Int, { nullable: true })
  take: number;

  @Field(() => WhereCustomerInput, { nullable: true })
  where: WhereCustomerInput;
}

@InputType()
export class GetOneCustomerInput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  email?: string;
}

@InputType()
export class UpdateUser {
  @Field(() => String, { nullable: false })
  id: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => Number, { nullable: true })
  role?: number;
}

@InputType()
export class DeleteUser {
  @Field(() => String, { nullable: true })
  id: string;

  @Field(() => String, { nullable: true })
  email: string;
}

@InputType()
export class CreateUser {
  @Field(() => String, { nullable: false })
  email: string;

  @Field(() => String, { nullable: false })
  password: string;

  @Field(() => Number, { nullable: true })
  role?: number;
}

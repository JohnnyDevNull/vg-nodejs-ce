import { Field, ObjectType } from '@nestjs/graphql';
import { Customer } from './customer.entity';

@ObjectType()
export class User {
  @Field(() => String)
  id: string;

  @Field(() => String)
  email: string;
}

@ObjectType()
export class Token {
  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  refreshToken: string;

  @Field(() => Customer)
  user: User;
}

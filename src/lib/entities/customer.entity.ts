import { Field, ObjectType } from '@nestjs/graphql';
import { Base } from 'lib/entities/base.entity';

@ObjectType()
export class Customer extends Base {
  @Field(() => String)
  email: string;

  @Field(() => Number)
  role: number;

  @Field(() => Boolean)
  activated: boolean;

  @Field(() => String)
  activationCode: string;
}

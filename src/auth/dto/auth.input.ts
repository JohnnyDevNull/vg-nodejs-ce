import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SignInInput {
  @Field(() => String, { nullable: false })
  email: string;

  @Field(() => String, { nullable: false })
  password: string;
}

@InputType()
export class SignUpInput {
  @Field(() => String, { nullable: false })
  email: string;

  @Field(() => String, { nullable: false })
  password: string;
}

@InputType()
export class RefreshTokenInput {
  @Field(() => String, { nullable: false })
  token: string;
}

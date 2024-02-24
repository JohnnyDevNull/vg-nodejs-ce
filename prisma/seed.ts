import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

import { customers } from './seeds/customers';

const prisma = new PrismaClient();

async function main() {
  for (const customer of customers) {
    customer.password = hashSync(customer.password, 10);
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: {},
      create: customer,
    });
  }
  console.log(`Created ${customers.length} customers`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

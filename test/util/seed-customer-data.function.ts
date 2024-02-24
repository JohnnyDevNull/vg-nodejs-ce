import { TestingModule } from '@nestjs/testing';
import { CustomerService } from 'src/customer/customer.service';
import { customerEntities } from '../fixtures/customer.data';

export async function seedCustomerData(fixture: TestingModule) {
  const customerService = fixture.get(CustomerService);

  for (const customer of customerEntities) {
    const { id } = customer;
    const entity = await customerService.findOneById(id);
    if (entity) {
      await customerService.deleteUserById(id);
    }
    await customerService.createUser(customer);
  }
}

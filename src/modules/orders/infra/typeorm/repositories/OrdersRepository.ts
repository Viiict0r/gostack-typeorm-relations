import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({
    customer_id,
    products,
  }: ICreateOrderDTO): Promise<Order> {
    const order = await this.ormRepository.save({
      customer_id,
      order_products: products,
    });

    const updatedOrder = await this.ormRepository.findOne(order.id, {
      relations: ['order_products', 'customer'],
    });

    return updatedOrder || order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    const order = await this.ormRepository.findOne(id, {
      relations: ['order_products', 'customer'],
    });

    return order;
  }
}

export default OrdersRepository;

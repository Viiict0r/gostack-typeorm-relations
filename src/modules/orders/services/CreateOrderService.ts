import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}
interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const checkCustomer = await this.customersRepository.findById(customer_id);

    if (!checkCustomer) {
      throw new AppError('Customer not found');
    }

    const checkProducts = await this.productsRepository.findAllById(products);

    if (checkProducts.length !== products.length || !checkProducts) {
      throw new AppError('Invalid products');
    }

    const insuficientQuantity = products.filter(
      prd =>
        checkProducts.filter(p => p.id === prd.id)[0].quantity < prd.quantity,
    );

    if (insuficientQuantity.length) {
      throw new AppError(
        'One of selected products dont have suficient quantity',
      );
    }

    const serializedProducts = checkProducts.map(prd => ({
      product_id: prd.id,
      quantity: prd.quantity,
      price: prd.price,
    }));

    const order = await this.ordersRepository.create({
      customer_id,
      products: serializedProducts,
    });

    return order;
  }
}

export default CreateOrderService;

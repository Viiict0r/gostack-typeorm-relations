interface IProduct {
  product_id: string;
  price: number;
  quantity: number;
}

export default interface ICreateOrderDTO {
  customer_id: string;
  products: IProduct[];
}

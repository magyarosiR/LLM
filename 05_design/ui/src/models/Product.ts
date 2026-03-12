export interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  stock: number;
}

export interface ProductDTO {
  name: string;
  price: number;
  description: string | null;
  stock: number;
}

export interface ProductUpdateDTO {
  name?: string;
  price?: number;
  description?: string | null;
  stock?: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
}

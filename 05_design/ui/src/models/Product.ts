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

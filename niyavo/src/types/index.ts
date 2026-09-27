export type ProductFinish = {
  id: string;
  name: string;
  hex: string;
  threeColor: number;
  roughness: number;
  metalness: number;
};

export type Product = {
  id: string;
  name: string;
  category: 'systems' | 'headphones' | 'ambient' | 'accessories';
  subtitle: string;
  price: number;
  rating: number;
  reviewCount: number;
  tag?: string;
  description: string;
  specs: { [key: string]: string };
  finishes: ProductFinish[];
  dimensions: string;
  weight: string;
  modelType: 'sphere' | 'headphones' | 'monolith' | 'orbit';
  imagePlaceholderColor: string;
  highlights: string[];
};

export type CartItem = {
  product: Product;
  selectedFinish: ProductFinish;
  quantity: number;
  customEngraving?: string;
};

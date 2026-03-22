export type Addon = {
  id: string;
  name: string;
  price: string;
  max_quantity: number;
  applicable_classes: string[];
  description?: string;
};

export type AddonsListApiResponse = {
  results: Addon[];
};

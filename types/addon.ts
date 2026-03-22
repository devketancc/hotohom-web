/** Minimal addon shape; extend when API schema is finalized */
export type Addon = {
  id: string;
  name?: string;
  price?: number;
  [key: string]: unknown;
};

export type AddonsListApiResponse = {
  success: boolean;
  data?: Addon[];
  message?: string;
};

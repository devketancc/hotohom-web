import { useQuery } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';

export function useCart(cartId: string | null) {
  return useQuery({
    queryKey: ['cart', cartId],
    queryFn: () => cartService.getCart(cartId!),
    enabled: Boolean(cartId),
    staleTime: 0,
    refetchOnMount: true,
  });
}

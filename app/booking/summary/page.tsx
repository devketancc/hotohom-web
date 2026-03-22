'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useCart } from '@/hooks/useCart';
import { useAddons } from '@/hooks/useAddons';

export default function BookingSummaryDebugPage() {
  const router = useRouter();
  const cartId = useCartStore((s) => s.cartId);

  useEffect(() => {
    if (!cartId) {
      router.replace('/journey');
    }
  }, [cartId, router]);

  const { data: cart, isLoading: cartLoading, isError: cartError, refetch } = useCart(cartId);
  const { data: addons, isError: addonsError, error: addonsErr } = useAddons();

  if (!cartId) {
    return <p>Loading summary...</p>;
  }

  if (cartLoading) {
    return <p>Loading summary...</p>;
  }

  if (cartError) {
    return (
      <div>
        <p>Failed to load cart</p>
        <button type="button" onClick={() => void refetch()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <pre>{JSON.stringify(cart, null, 2)}</pre>
      <pre>
        {addonsError
          ? JSON.stringify({ error: addonsErr instanceof Error ? addonsErr.message : 'Addons failed' }, null, 2)
          : JSON.stringify(addons ?? null, null, 2)}
      </pre>
    </div>
  );
}

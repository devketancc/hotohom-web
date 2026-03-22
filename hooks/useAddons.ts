import { useQuery } from '@tanstack/react-query';
import { addonService } from '@/services/addon.service';

const TEN_MIN_MS = 10 * 60 * 1000;

export function useAddons() {
  return useQuery({
    queryKey: ['addons'],
    queryFn: () => addonService.listAddons(),
    staleTime: TEN_MIN_MS,
  });
}

'use client';

import { useParams } from 'next/navigation';
import { PackageWizard } from '@/components/admin/packages/PackageWizard';

export default function AdminPackageEditPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  return <PackageWizard mode="edit" packageId={id} />;
}

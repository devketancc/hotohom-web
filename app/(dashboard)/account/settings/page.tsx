import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';

export default function AccountSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/account"
          className="mb-4 inline-flex items-center gap-2 font-body text-sm text-stitch-on-surface-variant transition-colors hover:text-stitch-primary-container"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to overview
        </Link>
        <h1 className="font-headline text-3xl font-black uppercase tracking-tight text-stitch-on-background">
          Settings
        </h1>
        <p className="mt-2 font-body text-sm text-stitch-on-surface-variant">
          Notifications, security, and preferences.
        </p>
      </div>

      <div className="glass-panel-login rounded-xl p-10 text-center shadow-2xl">
        <Settings className="mx-auto size-12 text-stitch-primary-container/80" aria-hidden />
        <p className="mt-6 font-headline text-lg font-bold text-stitch-on-background">Coming soon</p>
        <p className="mx-auto mt-2 max-w-md font-body text-sm text-stitch-on-surface-variant">
          We&apos;re building account settings so you can control notifications, password, and trip preferences in
          one place.
        </p>
      </div>
    </div>
  );
}

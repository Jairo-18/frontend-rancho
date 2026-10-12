import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Panel', template: '%s · Panel Rancho Porvenir' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return children;
}

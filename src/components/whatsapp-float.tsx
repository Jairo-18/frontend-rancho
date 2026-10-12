'use client';

import { ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { countItems, useRequest } from '@/lib/request-store';
import { whatsappUrl } from '@/lib/whatsapp';
import { WhatsAppIcon } from './brand-icons';

/**
 * CTA siempre visible en móvil (CONTEXT §3.5 y §7). Sin nada armado abre el
 * chat con el saludo de Ajustes; con una solicitud en curso lleva a revisarla
 * antes de enviarla.
 */
export function WhatsAppFloat({ number, greeting }: { number: string; greeting: string }) {
  const selection = useRequest();
  const pathname = usePathname();
  const count = countItems(selection);

  // En /solicitud ya está el botón grande de enviar.
  if (pathname === '/solicitud') return null;

  const base =
    'fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full py-3 pl-4 pr-5 font-bold text-white shadow-calida-lg transition duration-200 hover:-translate-y-0.5 lg:hidden';

  if (count > 0) {
    return (
      <Link href="/solicitud" className={`${base} bg-bosque`}>
        <ClipboardList className="size-6" aria-hidden />
        Ver mi solicitud ({count})
      </Link>
    );
  }

  if (!number) return null;
  return (
    <a
      href={whatsappUrl(number, greeting)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} bg-[#1f7a43]`}
    >
      <WhatsAppIcon className="size-6" />
      Consultar por WhatsApp
    </a>
  );
}

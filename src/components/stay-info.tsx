import { Ban, CalendarCheck, Clock, Dog, Flame, Info } from 'lucide-react';
import type { Settings } from '@/lib/types';

type StaySettings = Pick<
  Settings,
  'checkInTime' | 'checkOutTime' | 'sharedAreas' | 'petsPolicy' | 'recommendations' | 'houseRules' | 'bookingTerms'
>;

/** "Título: texto" → partes; sin dos puntos, todo es texto. */
function splitTerm(term: string): { title: string | null; text: string } {
  const index = term.indexOf(':');
  if (index <= 0 || index > 40) return { title: null, text: term };
  return { title: term.slice(0, index).trim(), text: term.slice(index + 1).trim() };
}

/** Llegada y salida, zonas comunes y mascotas (detalle de cabaña). Todo sale de Ajustes. */
export function StayFacts({ settings }: { settings: StaySettings }) {
  const { checkInTime, checkOutTime, sharedAreas, petsPolicy } = settings;
  if (!checkInTime && !checkOutTime && !sharedAreas && !petsPolicy) return null;
  return (
    <div className="card-papel space-y-4 p-5 sm:p-6">
      {(checkInTime || checkOutTime) && (
        <div className="grid grid-cols-2 gap-3">
          {checkInTime && (
            <div className="rounded-2xl bg-musgo/10 px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-musgo-700">
                <Clock className="size-3.5" aria-hidden /> Llegada
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-bosque">{checkInTime}</p>
            </div>
          )}
          {checkOutTime && (
            <div className="rounded-2xl bg-arcilla/10 px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-arcilla-700">
                <Clock className="size-3.5" aria-hidden /> Salida
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-madera-900">{checkOutTime}</p>
            </div>
          )}
        </div>
      )}
      {sharedAreas && (
        <p className="flex gap-2 text-tinta-suave">
          <Flame className="mt-0.5 size-5 shrink-0 text-musgo-700" aria-hidden />
          <span>
            <strong className="text-tinta">Acceso a:</strong> {sharedAreas}
          </span>
        </p>
      )}
      {petsPolicy && (
        <p className="flex gap-2 text-tinta-suave">
          <Dog className="mt-0.5 size-5 shrink-0 text-musgo-700" aria-hidden />
          <span>{petsPolicy}</span>
        </p>
      )}
    </div>
  );
}

/** "Antes de venir": horarios, recomendaciones, normas y condiciones de reserva. */
export function StayInfo({ settings }: { settings: StaySettings }) {
  const { recommendations, houseRules, bookingTerms } = settings;
  return (
    <section id="antes-de-venir" aria-labelledby="antes-de-venir-titulo" className="scroll-mt-24">
      <p className="font-hand text-2xl text-arcilla-700 sm:text-3xl">Para que todo salga bien</p>
      <h2 id="antes-de-venir-titulo" className="mt-1 text-3xl font-semibold sm:text-4xl">
        Antes de venir
      </h2>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <StayFacts settings={settings} />
          {(recommendations.length > 0 || houseRules.length > 0) && (
            <div className="card-papel p-5 sm:p-6">
              <h3 className="flex items-center gap-2 text-xl">
                <Info className="size-5 text-arcilla-700" aria-hidden /> Recomendaciones
              </h3>
              {recommendations.length > 0 && (
                <ul className="mt-4 space-y-2.5 text-tinta-suave">
                  {recommendations.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-musgo" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {houseRules.length > 0 && (
                <ul className="mt-5 space-y-2 rounded-2xl bg-arcilla/10 px-4 py-3 font-semibold text-arcilla-700">
                  {houseRules.map((rule) => (
                    <li key={rule} className="flex gap-2">
                      <Ban className="mt-0.5 size-5 shrink-0" aria-hidden />
                      {rule}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {bookingTerms.length > 0 && (
          <div className="card-papel h-fit p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-xl">
              <CalendarCheck className="size-5 text-arcilla-700" aria-hidden /> Reserva y cancelaciones
            </h3>
            <p className="mt-2 text-sm text-tinta-suave">
              Las reservas se confirman por WhatsApp. Estas son las condiciones del rancho:
            </p>
            <ul className="mt-4 divide-y divide-dashed divide-bosque/20">
              {bookingTerms.map((term) => {
                const { title, text } = splitTerm(term);
                return (
                  <li key={term} className="py-3">
                    {title && <p className="font-bold text-tinta">{title}</p>}
                    <p className="mt-0.5 text-tinta-suave">{text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

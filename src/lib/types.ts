/** Tipos de la API del backend (respuestas dentro de `{ data }`). */

export type RoomLabel = 'Cabañas' | 'Habitaciones';

export interface Settings {
  hotelName: string;
  /** URL absoluta del logo subido en Ajustes; "" = hoja de monstera. */
  logoUrl: string;
  roomLabel: RoomLabel;
  whatsappNumber: string;
  whatsappGreeting: string;
  fridayNightIsWeekend: boolean;
  address: string;
  city: string;
  mapsUrl: string;
  email: string;
  phone: string;
  socials: { instagram: string; facebook: string; tiktok: string };
  /** Información para el huésped, editable en Ajustes. */
  checkInTime: string;
  checkOutTime: string;
  sharedAreas: string;
  petsPolicy: string;
  recommendations: string[];
  houseRules: string[];
  /** Cada elemento "Título: texto". */
  bookingTerms: string[];
}

export interface RoomImage {
  id: string;
  url: string;
  isCover: boolean;
  position: number;
}

export interface Room {
  id: string;
  name: string;
  slug: string;
  description: string;
  hasJacuzzi: boolean;
  /** Lo que incluye, como etiquetas. */
  amenities: string[];
  capacity: number | null;
  weekdayPrice: number;
  weekendPrice: number;
  coverImageUrl: string | null;
  images: RoomImage[];
  /** Productos sugeridos con la habitación (solo los activos). */
  products: Product[];
}

export interface Horseback {
  id: string;
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  /** null = "Consultar precio". */
  pricePerPerson: number | null;
  schedule: string | null;
  coverImageUrl: string | null;
  images: { id: string; url: string; position: number }[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string | null;
}

export type NightType = 'WEEKDAY' | 'WEEKEND' | 'SPECIAL';

export interface QuoteNight {
  date: string;
  dayOfWeek: number;
  type: NightType;
  basePrice: number;
  price: number;
  rule: { id: string; name: string } | null;
}

export interface Quote {
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nightsCount: number;
  currency: 'COP';
  fridayNightIsWeekend: boolean;
  nights: QuoteNight[];
  total: number;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string;
  details?: string[];
}

// ---------- Panel admin ----------

export type StatusFilter = 'all' | 'active' | 'inactive';

export interface AdminRoom extends Room {
  isActive: boolean;
  /** Todos los productos asociados, activos o no. */
  productIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminHorseback extends Horseback {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProduct extends Product {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PriceRuleType = 'FIXED' | 'PERCENT';

export interface PriceRule {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  roomId: string | null;
  roomName: string | null;
  type: PriceRuleType;
  value: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

import type { StaticImageData } from 'next/image';
import banoGuadua from '@/assets/fotos/bano-guadua.jpg';
import cabalgataMontana from '@/assets/fotos/cabalgata-montana.jpg';
import cabalgataPotrero from '@/assets/fotos/cabalgata-potrero.jpg';
import caballoAmistad from '@/assets/fotos/caballo-amistad.jpg';
import cabanaAFrame from '@/assets/fotos/cabana-a-frame.jpg';
import cabanaInterior from '@/assets/fotos/cabana-interior.jpg';
import cabanaNocheRomantica from '@/assets/fotos/cabana-noche-romantica.jpg';
import camaCabana from '@/assets/fotos/cama-cabana.jpg';
import carpasNoche from '@/assets/fotos/carpas-noche.jpg';
import detalleRomantico from '@/assets/fotos/detalle-romantico.jpg';
import jacuzziCabana from '@/assets/fotos/jacuzzi-cabana.jpg';
import jacuzziSelvaNoche from '@/assets/fotos/jacuzzi-selva-noche.jpg';
import picadaTerraza from '@/assets/fotos/picada-terraza.jpg';
import planRomanticoPoster from '@/assets/fotos/plan-romantico-poster.jpg';
import potrilloPoster from '@/assets/fotos/potrillo-poster.jpg';
import teAmo from '@/assets/fotos/te-amo.jpg';
import terrazaCabana from '@/assets/fotos/terraza-cabana.jpg';

/**
 * Fotos del rancho para la ambientación del sitio (hero, mosaicos, banners).
 * No son las fotos de cada cabaña: esas las sube el administrador desde el panel.
 * Importadas de forma estática para que `next/image` genere tamaños y el
 * desenfoque de carga.
 */
export interface SitePhoto {
  src: StaticImageData;
  alt: string;
}

export const PHOTOS = {
  cabanaAFrame: {
    src: cabanaAFrame,
    alt: 'Cabaña de madera en forma de A entre palmas, flores y cielo azul',
  },
  terrazaCabana: {
    src: terrazaCabana,
    alt: 'Terraza de la cabaña con mesa para dos y la habitación al fondo',
  },
  cabanaInterior: {
    src: cabanaInterior,
    alt: 'Interior de la cabaña: cama doble, techo de madera y tejidos en macramé',
  },
  camaCabana: { src: camaCabana, alt: 'Cama de la cabaña con luz cálida y paredes de madera' },
  jacuzziCabana: { src: jacuzziCabana, alt: 'Jacuzzi dentro de la cabaña de madera, con barra y sala' },
  jacuzziSelvaNoche: {
    src: jacuzziSelvaNoche,
    alt: 'Jacuzzi iluminado de noche con un ventanal abierto a la selva',
  },
  banoGuadua: {
    src: banoGuadua,
    alt: 'Baño al aire libre en guadua, rodeado de helechos y árboles',
  },
  carpasNoche: {
    src: carpasNoche,
    alt: 'Carpas de palma iluminadas con bombillos en el jardín, de noche y bajo la montaña',
  },
  picadaTerraza: {
    src: picadaTerraza,
    alt: 'Picada con vino, quesos y frutas en la terraza, con árboles de naranja al fondo',
  },
  cabanaNocheRomantica: {
    src: cabanaNocheRomantica,
    alt: 'Cabaña decorada de noche con globos de corazón y velas en el camino',
  },
  detalleRomantico: {
    src: detalleRomantico,
    alt: 'Vela flotante y una rosa junto al jacuzzi',
  },
  teAmo: { src: teAmo, alt: 'Letras iluminadas «Te amo», vino y copas junto al jacuzzi de noche' },
  cabalgataMontana: {
    src: cabalgataMontana,
    alt: 'Huésped a caballo con las montañas verdes del Putumayo al fondo',
  },
  cabalgataPotrero: { src: cabalgataPotrero, alt: 'Jinete con sombrero a caballo en el potrero, bajo un cielo azul' },
  caballoAmistad: { src: caballoAmistad, alt: 'Huésped acariciando un caballo en el jardín del rancho' },
  planRomanticoPoster: { src: planRomanticoPoster, alt: '' },
  potrilloPoster: { src: potrilloPoster, alt: '' },
} satisfies Record<string, SitePhoto>;

export const VIDEOS = {
  planRomantico: {
    src: '/videos/plan-romantico.mp4',
    poster: planRomanticoPoster,
    label: 'Recorrido por una cabaña decorada para una noche romántica',
  },
  potrillo: {
    src: '/videos/potrillo.mp4',
    poster: potrilloPoster,
    label: 'Yeguas y un potrillo pastando en el potrero del rancho',
  },
} as const;

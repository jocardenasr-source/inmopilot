// Tipos y etiquetas del módulo de Propiedades.

export const OPERACIONES = ["arriendo", "venta"] as const;
export type Operacion = (typeof OPERACIONES)[number];

export const TIPOS = [
  "apartamento",
  "casa",
  "local",
  "oficina",
  "lote",
  "bodega",
] as const;
export type TipoInmueble = (typeof TIPOS)[number];

export const ESTADOS = ["disponible", "arrendada", "vendida"] as const;
export type Estado = (typeof ESTADOS)[number];

export const ESTRATOS = [1, 2, 3, 4, 5, 6] as const;

// Cómo se representa una propiedad en la base de datos.
export type Propiedad = {
  id: string;
  titulo: string;
  operacion: Operacion;
  tipo: TipoInmueble;
  precio: number;
  ciudad: string | null;
  barrio: string | null;
  direccion: string | null;
  habitaciones: number;
  banos: number;
  parqueaderos: number;
  area: number | null;
  estrato: number | null;
  descripcion: string | null;
  estado: Estado;
  fotos: string[];
  created_at: string;
  updated_at: string;
};

// Etiquetas legibles en español para mostrar en la interfaz.
export const ETIQUETA_OPERACION: Record<Operacion, string> = {
  arriendo: "Arriendo",
  venta: "Venta",
};

export const ETIQUETA_TIPO: Record<TipoInmueble, string> = {
  apartamento: "Apartamento",
  casa: "Casa",
  local: "Local",
  oficina: "Oficina",
  lote: "Lote",
  bodega: "Bodega",
};

export const ETIQUETA_ESTADO: Record<Estado, string> = {
  disponible: "Disponible",
  arrendada: "Arrendada",
  vendida: "Vendida",
};

// Color del "badge" según el estado (clases de Tailwind).
export const COLOR_ESTADO: Record<Estado, string> = {
  disponible:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  arrendada:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  vendida: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

// Formatea un precio en pesos colombianos, ej: 1500000 -> "$1.500.000".
export function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(precio);
}

// Muestra el precio con sufijo /mes cuando es arriendo.
export function precioConSufijo(precio: number, operacion: Operacion): string {
  const base = formatearPrecio(precio);
  return operacion === "arriendo" ? `${base}/mes` : base;
}

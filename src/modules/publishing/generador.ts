// Generador de publicaciones a partir de los datos de una propiedad.
//
// Etapa 1 (gratis, sin IA): arma el texto con plantillas + variación aleatoria.
// Está diseñado para que más adelante se pueda reemplazar por IA real (Gemini,
// Claude) sin cambiar la interfaz: la pantalla solo necesita `generarVariantes`.

import {
  ETIQUETA_TIPO,
  formatearPrecio,
  type Propiedad,
} from "@/modules/properties/types";

export type Tono = "formal" | "cercano" | "directo";

export type Variante = {
  tono: Tono;
  etiqueta: string; // nombre legible del tono
  texto: string;
};

export type OpcionesGenerador = {
  contacto?: string;
  destacados?: string; // puntos clave de la zona escritos por el usuario
  seed?: number;
};

// --- Utilidades ---

// Quita tildes/acentos (para armar hashtags limpios).
function sinAcentos(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Convierte un texto en un hashtag: "Portal 20 de Julio" -> "#Portal20DeJulio".
function aHashtag(texto: string): string {
  const partes = sinAcentos(texto)
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (partes.length === 0) return "";
  return "#" + partes.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

// Arma la línea de hashtags a partir de los datos de la propiedad + la zona.
function construirHashtags(p: Propiedad, destacados: string): string {
  const crudos = [
    "FincaRaiz",
    "Inmobiliaria",
    p.operacion === "venta" ? "Venta" : "Arriendo",
    ETIQUETA_TIPO[p.tipo],
    p.ciudad ?? "",
    p.barrio ?? "",
    // Cada punto de la zona (separado por comas) también se vuelve hashtag.
    ...destacados.split(",").map((s) => s.trim()),
  ];
  const tags: string[] = [];
  for (const c of crudos) {
    const tag = aHashtag(c);
    if (tag && !tags.includes(tag)) tags.push(tag);
  }
  return tags.join(" ");
}

// Generador de números pseudo-aleatorios con semilla (para "regenerar").
function crearRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function elegir<T>(rng: () => number, opciones: T[]): T {
  return opciones[Math.floor(rng() * opciones.length)];
}

function plural(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

function ubicacion(p: Propiedad): string {
  return [p.barrio, p.ciudad].filter(Boolean).join(", ");
}

function precioTexto(p: Propiedad): string {
  const base = formatearPrecio(p.precio);
  return p.operacion === "arriendo" ? `${base}/mes` : base;
}

// Lista de características en texto plano ("3 habitaciones", "2 baños", ...).
function caracteristicas(p: Propiedad): string[] {
  const lista: string[] = [];
  if (p.habitaciones > 0)
    lista.push(plural(p.habitaciones, "habitación", "habitaciones"));
  if (p.banos > 0) lista.push(plural(p.banos, "baño", "baños"));
  if (p.parqueaderos > 0)
    lista.push(plural(p.parqueaderos, "parqueadero", "parqueaderos"));
  if (p.area) lista.push(`${p.area} m²`);
  if (p.estrato) lista.push(`estrato ${p.estrato}`);
  return lista;
}

// Características con emoji (para el tono cercano/directo).
function caracteristicasEmoji(p: Propiedad): string[] {
  const lista: string[] = [];
  if (p.habitaciones > 0)
    lista.push(`🛏️ ${plural(p.habitaciones, "habitación", "habitaciones")}`);
  if (p.banos > 0) lista.push(`🛁 ${plural(p.banos, "baño", "baños")}`);
  if (p.parqueaderos > 0)
    lista.push(`🚗 ${plural(p.parqueaderos, "parqueadero", "parqueaderos")}`);
  if (p.area) lista.push(`📐 ${p.area} m²`);
  if (p.estrato) lista.push(`🏢 Estrato ${p.estrato}`);
  return lista;
}

function contactoLinea(contacto: string): string {
  const c = contacto.trim();
  return c ? `WhatsApp: ${c}` : "Escríbeme por WhatsApp";
}

// --- Plantillas por tono ---

function tonoFormal(
  p: Propiedad,
  contacto: string,
  destacados: string,
  hashtags: string,
  rng: () => number
): string {
  const tipo = ETIQUETA_TIPO[p.tipo];
  const op = p.operacion === "venta" ? "en venta" : "en arriendo";
  const lugar = ubicacion(p);
  const carac = caracteristicas(p);

  const apertura = elegir(rng, [
    `${tipo} ${op}${lugar ? ` en ${lugar}` : ""}.`,
    `Se ${p.operacion === "venta" ? "vende" : "arrienda"} ${tipo.toLowerCase()}${lugar ? ` en ${lugar}` : ""}.`,
    `Excelente oportunidad: ${tipo.toLowerCase()} ${op}${lugar ? ` en ${lugar}` : ""}.`,
  ]);

  const introZona = elegir(rng, [
    "Ubicación privilegiada:",
    "Sector estratégico:",
    "Puntos destacados de la zona:",
  ]);

  const cierre = elegir(rng, [
    "Interesados, comuníquese para ampliar la información y agendar una visita.",
    "Para más información o coordinar una visita, no dude en contactarnos.",
    "Con gusto atendemos su solicitud de información y visitas.",
  ]);

  const partes = [apertura];
  if (p.descripcion) partes.push(p.descripcion.trim());
  if (destacados) partes.push(`${introZona} ${destacados}.`);
  if (carac.length)
    partes.push(
      `Características: ${carac.join(", ")}.`.replace(/, ([^,]*)\.$/, " y $1.")
    );
  partes.push(`Precio: ${precioTexto(p)}.`);
  partes.push(cierre);
  partes.push(contactoLinea(contacto) + ".");
  if (hashtags) partes.push(hashtags);
  return partes.join("\n\n");
}

function tonoCercano(
  p: Propiedad,
  contacto: string,
  destacados: string,
  hashtags: string,
  rng: () => number
): string {
  const tipo = ETIQUETA_TIPO[p.tipo];
  const op = p.operacion === "venta" ? "en venta" : "en arriendo";
  const lugar = ubicacion(p);
  const carac = caracteristicasEmoji(p);

  const apertura = elegir(rng, [
    `✨ ¡${tipo} ${op}${lugar ? ` en ${lugar}` : ""}! ✨`,
    `🏡 ¡Mira este ${tipo.toLowerCase()} ${op}${lugar ? ` en ${lugar}` : ""}!`,
    `😍 ¡Te va a encantar! ${tipo} ${op}${lugar ? ` en ${lugar}` : ""}.`,
  ]);

  const gancho = elegir(rng, [
    "Un espacio pensado para vivir cómodo y feliz.",
    "Ideal para ti y tu familia.",
    "La oportunidad que estabas esperando.",
    "Ven a conocerlo, ¡seguro es para ti!",
  ]);

  const cta = elegir(rng, [
    `¿Te interesa? ${contactoLinea(contacto)} y con gusto te muestro. 😊`,
    `¿Quieres verlo? ${contactoLinea(contacto)} y agendamos una visita. 🙌`,
    `Escríbeme y resolvemos todas tus dudas. ${contactoLinea(contacto)} 💬`,
  ]);

  const partes = [apertura, gancho];
  if (p.descripcion) partes.push(p.descripcion.trim());
  if (destacados) partes.push(`📌 ${destacados}`);
  if (carac.length) partes.push(carac.join("\n"));
  partes.push(`💰 ${precioTexto(p)}`);
  if (lugar) partes.push(`📍 ${lugar}`);
  partes.push(cta);
  if (hashtags) partes.push(hashtags);
  return partes.join("\n\n");
}

function tonoDirecto(
  p: Propiedad,
  contacto: string,
  destacados: string,
  hashtags: string,
  rng: () => number
): string {
  const op = (p.operacion === "venta" ? "venta" : "arriendo").toUpperCase();
  const lugar = ubicacion(p);
  const carac = caracteristicasEmoji(p);

  const cta = elegir(rng, [
    `👉 Info y visitas: ${contactoLinea(contacto)}`,
    `👉 ¡Agenda tu visita! ${contactoLinea(contacto)}`,
    `👉 Contáctame ya: ${contactoLinea(contacto)}`,
  ]);

  const lineas = [`🔥 ${op}: ${p.titulo}`];
  if (lugar) lineas.push(`📍 ${lugar}`);
  lineas.push(`💰 ${precioTexto(p)}`);
  if (carac.length) lineas.push(carac.join("  ·  "));
  if (destacados) lineas.push(`📌 ${destacados}`);
  lineas.push("");
  lineas.push(cta);
  if (hashtags) {
    lineas.push("");
    lineas.push(hashtags);
  }
  return lineas.join("\n");
}

// Función principal: devuelve las 3 variantes de tono.
// `seed` permite "regenerar" para obtener nuevas variaciones.
export function generarVariantes(
  p: Propiedad,
  opciones: OpcionesGenerador = {}
): Variante[] {
  const { contacto = "", destacados = "", seed = 1 } = opciones;
  const zona = destacados.trim();
  const hashtags = construirHashtags(p, zona);
  const rng = crearRng(seed);
  return [
    {
      tono: "formal",
      etiqueta: "Formal",
      texto: tonoFormal(p, contacto, zona, hashtags, rng),
    },
    {
      tono: "cercano",
      etiqueta: "Cercano",
      texto: tonoCercano(p, contacto, zona, hashtags, rng),
    },
    {
      tono: "directo",
      etiqueta: "Directo",
      texto: tonoDirecto(p, contacto, zona, hashtags, rng),
    },
  ];
}

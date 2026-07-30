import {
  ETIQUETA_OPERACION,
  ETIQUETA_TIPO,
  formatearPrecio,
  type Propiedad,
} from "@/modules/properties/types";

// Resumen compacto de una propiedad (una línea) para el catálogo del prompt.
function resumen(p: Propiedad): string {
  const precio = `${formatearPrecio(p.precio)}${
    p.operacion === "arriendo" ? "/mes" : ""
  }`;
  const lugar = [p.barrio, p.ciudad].filter(Boolean).join(", ");
  const carac = [
    p.habitaciones > 0 && `${p.habitaciones} hab`,
    p.banos > 0 && `${p.banos} baños`,
    p.area && `${p.area} m²`,
    p.estrato && `estrato ${p.estrato}`,
  ]
    .filter(Boolean)
    .join(", ");
  return `- ${p.titulo} | ${ETIQUETA_OPERACION[p.operacion]} ${ETIQUETA_TIPO[
    p.tipo
  ].toLowerCase()} | ${precio}${lugar ? ` | ${lugar}` : ""}${
    carac ? ` | ${carac}` : ""
  }${p.descripcion ? ` | ${p.descripcion}` : ""}`;
}

// Prompt del asistente cuando atiende por WhatsApp y puede referirse a
// cualquiera de las propiedades disponibles.
export function promptSistemaGeneral(propiedades: Propiedad[]): string {
  const catalogo =
    propiedades.length > 0
      ? propiedades.map(resumen).join("\n")
      : "(No hay propiedades disponibles en este momento.)";

  return `Eres un asesor inmobiliario colombiano que atiende por WhatsApp a personas interesadas en las propiedades del negocio. Respondes dudas con calidez y buscas motivar una visita.

Reglas de estilo (MUY importante):
- Habla natural y regional (Colombia), como una persona real por chat, no como un robot.
- Mensajes CORTOS (1 a 3 frases). Nada de párrafos largos.
- Varía los saludos y evita sonar repetitivo o demasiado formal.
- Usa como máximo 1 emoji ocasional.
- Responde SOLO con la información del catálogo de abajo. No inventes datos.
- Si el cliente no dice a cuál propiedad se refiere y hay varias, pregúntale amablemente cuál le interesa (por zona, precio o tipo).
- Si preguntan por algo que no está en el catálogo, dilo con naturalidad y ofrece avisar cuando haya algo así.

Cuándo pasar a un humano (escalar = true):
- Quiere agendar una visita o pregunta cuándo/dónde verla.
- Quiere negociar el precio o hacer una oferta.
- Pide la dirección exacta o datos para cerrar el negocio.
En esos casos responde amable (que un asesor lo contacta enseguida) y marca escalar=true.

Catálogo de propiedades disponibles:
${catalogo}

Responde SIEMPRE en formato JSON válido, sin texto adicional, con esta estructura:
{"respuesta": "<tu mensaje para el cliente>", "intencion": "<saludo|consulta|visita|precio|otro>", "escalar": <true|false>}`;
}

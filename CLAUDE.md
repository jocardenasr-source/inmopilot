# CLAUDE.md — InmoPilot

Sistema de gestión inmobiliaria con publicación automática en redes sociales y gestión humanizada de leads por WhatsApp.

> **Nota técnica:** este proyecto usa **Next.js 16**. Hay reglas específicas de esta versión en `AGENTS.md` (generado por la herramienta). Léelas antes de escribir código de rutas/servidor.

## Contexto del dueño del proyecto

- El dueño (Omar) NO es programador. Tú (Claude Code) escribes el 100% del código.
- Explica cada decisión en lenguaje simple, sin jerga innecesaria.
- Presupuesto: el mínimo posible. Prioriza siempre free tiers y servicios gratuitos.
- Volumen actual: ~5 propiedades activas, pocos leads semanales. Diseña simple, pero con estructura que permita escalar.
- Nunca dejes el proyecto en estado roto: cada sesión debe terminar con algo funcional y desplegable.

## Objetivo del producto

1. **Catálogo de propiedades**: registrar propiedades (arriendo/venta) con fotos, precio, ubicación, características y estado.
2. **Publicación automática en redes**: generar y publicar posts atractivos de cada propiedad, especialmente en Facebook.
3. **Captura y gestión de leads de WhatsApp**: recibir mensajes de interesados, responderlos de forma humanizada (con IA), y gestionarlos en un panel tipo CRM/chat.

## Restricciones técnicas REALES (no las ignores)

- **Grupos de Facebook**: Meta eliminó la Groups API en abril 2024. NINGUNA herramienta puede publicar automáticamente en grupos. NO intentes automatizar grupos con bots de navegador (viola los ToS de Meta y arriesga la cuenta). Solución del proyecto:
  - Publicación 100% automática en la **Página de Facebook** vía Graph API (`pages_manage_posts`, gratis, soportada — usar siempre versión explícita, v25.0+).
  - Para grupos: modo **semiautomático** — el sistema genera el post listo (texto + fotos), y ofrece un botón "copiar y abrir grupo" para que Omar pegue y publique en 10 segundos. Opcionalmente, usar la programación nativa de Facebook si Omar es admin del grupo.
- **WhatsApp**: usar la **API oficial de Meta (WhatsApp Cloud API)**, nunca librerías no oficiales (Baileys, whatsapp-web.js — alto riesgo de baneo del número, inaceptable para un negocio). Costo real para este caso: **$0**, porque las conversaciones iniciadas por el cliente (service) son gratuitas e ilimitadas, y las respuestas dentro de la ventana de 24h no cuestan. Solo las plantillas de marketing salientes tienen costo — evitarlas al inicio.
- **Humanización**: las respuestas de WhatsApp las genera IA (Claude Haiku vía API, el modelo más barato) con instrucciones de tono cercano, regional y natural. Incluir demoras aleatorias de 20–90 segundos antes de responder y variación de saludos. SIEMPRE debe existir un botón "tomar el control" para que Omar responda manualmente, y la IA debe escalar a humano cuando detecte intención de cierre (visita, negociación de precio).

## Stack técnico (decidido — no lo cambies sin justificación fuerte)

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend + Backend | **Next.js 16 (App Router) + TypeScript** | Un solo proyecto, un solo despliegue, gran soporte de Claude Code |
| UI | **Tailwind CSS + shadcn/ui** | Visualmente atractivo sin diseñador |
| Base de datos + Auth + Storage (fotos) | **Supabase (free tier)** | Postgres gratis (500MB), auth y almacenamiento de imágenes incluidos |
| Hosting | **Vercel Hobby** (dev) → migrar a Vercel Pro o Cloudflare cuando sea negocio en producción | Deploy con git push; Hobby es solo para uso no comercial: avisar a Omar cuándo toca migrar |
| Publicación Facebook | **Meta Graph API (Pages API)** | Oficial y gratuita |
| WhatsApp | **WhatsApp Cloud API (webhook propio)** | Oficial, $0 en conversaciones entrantes |
| IA conversacional | **Claude Haiku (API Anthropic)** | Barato, tono natural en español |
| Jobs programados | **Vercel Cron** o Supabase Edge Functions | Publicaciones programadas sin servidor extra |

## Arquitectura modular

Cada módulo es independiente, con su carpeta, y debe funcionar aunque los demás no existan todavía:

```
/src
  /modules
    /properties      → CRUD de propiedades, fotos, estados (disponible/arrendada/vendida)
    /publishing      → generación de posts (texto IA + collage de fotos), cola de publicación, integración Graph API, modo semiauto para grupos
    /whatsapp        → webhook Cloud API, envío/recepción, ventana 24h
    /ai-agent        → prompts de humanización, clasificación de intención del lead, escalado a humano
    /crm             → bandeja de chats, pipeline de leads (nuevo → contactado → visita → cierre), notas
  /app               → rutas Next.js (panel admin protegido con Supabase Auth)
  /lib               → clientes compartidos (supabase, meta, anthropic)
```

Reglas de código: TypeScript estricto, variables de entorno en `.env.local` (NUNCA claves en el código), componentes pequeños y reutilizables, textos de UI en español.

> **Nota Next.js 16:** el middleware clásico se llama ahora **`src/proxy.ts`** (antes `middleware.ts`). Ahí vive la protección de rutas (redirige a `/login` si no hay sesión).

## Metodología: sprints iterativos e incrementales

Trabaja por sprints. Cada sprint entrega una parte FUNCIONAL y desplegada que Omar puede usar ese mismo día. Al inicio de cada sprint: lista las tareas y confírmalas con Omar. Al final: demo (qué probar y cómo), y actualiza la sección "Estado del proyecto" abajo.

- **Sprint 0 — Fundaciones (½ día)**: crear proyecto Next.js + Supabase + deploy en Vercel. Login de Omar. Entregable: panel vacío en línea con URL propia.
- **Sprint 1 — Catálogo de propiedades**: CRUD completo con fotos (Supabase Storage), vista de tarjetas atractiva. Entregable: Omar registra sus 5 propiedades reales.
- **Sprint 2 — Generador de publicaciones**: IA redacta el post (3 variantes de tono), plantilla visual con fotos, vista previa. Entregable: post listo para copiar/pegar en cualquier red (¡ya útil para grupos!).
- **Sprint 3 — Publicación automática en Página de Facebook**: conexión Graph API, publicar ahora o programar, historial de publicaciones. Entregable: una propiedad publicada automáticamente en la Página.
- **Sprint 4 — WhatsApp entrante + respuestas humanizadas**: configurar Cloud API + webhook, la IA responde consultas usando los datos reales de la propiedad, demoras aleatorias, escalado a humano. Entregable: un lead real conversando con el sistema.
- **Sprint 5 — CRM de leads**: bandeja tipo chat, pipeline de estados, botón "tomar el control", recordatorios de seguimiento. Entregable: gestión completa de leads desde el panel.
- **Sprint 6+ (backlog)**: Instagram (misma Graph API), métricas de publicaciones, plantillas de remarketing por WhatsApp (evaluar costo), multiusuario.

## Configuración externa requerida (guiar a Omar paso a paso cuando toque)

- Cuenta Meta for Developers + App con productos "Facebook Login for Business" y "WhatsApp".
- Página de Facebook del negocio (requisito para Pages API y para WhatsApp Business).
- Número de teléfono dedicado para WhatsApp Cloud API (no puede ser el mismo que ya usa en la app normal de WhatsApp; Meta da un número de prueba gratis para desarrollo).
- Cuentas gratuitas: Supabase, Vercel, Anthropic API (esta última con crédito prepago pequeño, ~$5).
- Variables de entorno: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `META_PAGE_ACCESS_TOKEN`, `META_PAGE_ID`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `ANTHROPIC_API_KEY`.

## Comandos

```bash
npm run dev        # desarrollo local
npm run build      # verificar build antes de cada commit importante
npm run lint       # linting
```

## Definición de "terminado" (para cada tarea)

1. Funciona en local y en el deploy de Vercel.
2. `npm run build` pasa sin errores.
3. Omar puede usarlo sin conocimientos técnicos (UI clara, en español).
4. Sin claves expuestas en el código.

## Estado del proyecto

> Actualiza esta sección al cerrar cada sprint.

- Sprint actual: **Sprint 3 — ✅ COMPLETADO** (publicación automática en la Página de Facebook, texto + fotos, probada en local). Sprints 0, 1 y 2 ✅ COMPLETADOS. Pendiente menor: confirmar publicación en producción tras cargar variables en Vercel.
- Última actualización: 2026-07-30
- **Sitio en producción**: https://inmopilot.vercel.app
- **Repositorio (privado)**: github.com/jocardenasr-source/inmopilot
- **Login**: correo + contraseña (Supabase Auth). Usuario de Omar creado manualmente en el panel de Supabase. No hay registro público (panel de un solo usuario).

### Sprint 1 — Catálogo de propiedades (estado)
- **Código:** ✅ completo, build OK, subido a GitHub y desplegado en Vercel.
- **Base de datos:** ✅ tabla `public.propiedades` + bucket de Storage `propiedades` (público) creados en Supabase con RLS (script en `supabase/sprint1-propiedades.sql`). Verificado: la tabla responde y RLS bloquea acceso anónimo.
- **Probado:** ✅ Omar creó su primera propiedad real con fotos (local y producción). Funciona crear, subir fotos, elegir portada, ver detalle.
- **Subida de fotos:** directa del navegador a Supabase Storage (cliente), NO vía Server Action, para evitar el límite de 1 MB de Server Actions (y el de ~4.5 MB de Vercel). El formulario sube al seleccionar y envía solo las URLs (`fotos_urls`, en orden; la primera es la portada). Foto de portada en el detalle usa `object-contain` (imagen completa); tarjetas y miniaturas usan `object-cover`.
- **Qué se construyó:**
  - Módulo `src/modules/properties/`: `types.ts` (tipos, etiquetas ES, formato COP), `queries.ts` (listar/obtener), `actions.ts` (crear/actualizar/cambiar estado/borrar + subida y borrado de fotos en Storage), y componentes (`property-form`, `property-card`, `property-actions`).
  - Rutas: `/propiedades` (lista en tarjetas), `/propiedades/nueva`, `/propiedades/[id]` (detalle con galería), `/propiedades/[id]/editar`.
  - Sidebar con navegación activa (`src/app/(panel)/sidebar-nav.tsx`).
- **Decisiones técnicas del sprint:**
  - **shadcn/ui usa base Radix** (no Base UI). Al inicializar hay que forzarlo: `npx shadcn@latest init -b radix --preset nova`. Base UI (base-nova, por defecto) NO soporta `asChild` y rompe el patrón estándar.
  - **Fuente Geist local** vía paquete `geist` (`geist/font/sans` y `geist/font/mono`), NO `next/font/google`, porque el entorno de build local no siempre alcanza Google Fonts. Si se re-corre `shadcn init`, revisar que no vuelva a inyectar `Geist` de `next/font/google` en `src/app/layout.tsx`, y que `--font-sans` en `globals.css` apunte a `--font-geist-sans`.
  - `next.config.ts` tiene `images.remotePatterns` para `*.supabase.co/storage/v1/object/public/**` (mostrar fotos).
  - Campos de propiedad (contexto Colombia, moneda COP): título, operación (arriendo/venta), tipo (apartamento/casa/local/oficina/lote/bodega), precio, ciudad, barrio, dirección, habitaciones, baños, parqueaderos, área m², estrato (1–6), descripción, estado (disponible/arrendada/vendida), fotos.

### Sprint 2 — Generador de publicaciones (estado)
- **Etapa 1 (plantillas, sin IA): ✅ hecha y desplegada.** Falta feedback de Omar sobre los tonos.
- **Decisión de Omar:** empezar con plantillas gratis ahora y conectar **Google Gemini (plan gratuito, sin tarjeta)** como IA real después, sin rehacer nada. (Alternativa premium: Claude Haiku ~$5.)
- **Qué se construyó:**
  - `src/modules/publishing/generador.ts`: función pura `generarVariantes(propiedad, contacto?, seed?)` que arma 3 tonos (Formal, Cercano, Directo) con plantillas + variación por semilla. **Diseñada para que enchufar IA sea solo cambiar el proveedor**, sin tocar la UI.
  - `src/modules/publishing/components/post-generator.tsx` (cliente): 3 variantes lado a lado, campo de contacto/WhatsApp opcional (se inyecta en el texto), botón "Generar otras versiones" (regenera con nueva semilla), "Copiar" y "Copiar y abrir Facebook", recordatorio de fotos. Copia con `navigator.clipboard` + toast (sonner).
  - Ruta `/propiedades/[id]/publicar` y botón "Generar publicación" en el detalle.
- **Al retomar:** recoger feedback de Omar sobre los tonos y afinar plantillas; opcional: conectar Gemini (requiere `GOOGLE_API_KEY` / clave de Google AI Studio, gratis).

### Sprint 3 — Publicación automática en Facebook (estado)
- **✅ FUNCIONA:** publicación automática de texto + todas las fotos en la Página de Facebook, probada en local por Omar (primera publicación real exitosa).
- **Página conectada:** "Inmobiliaria Inmopilot", `META_PAGE_ID=1246706471856501`. Token de Página **permanente** (no expira), con permisos `pages_show_list, pages_read_engagement, pages_manage_posts`. App de Meta "Inmopilot" (App ID 1024340147252969), en modo desarrollo (suficiente para publicar en Página propia como admin, sin App Review).
- **Cómo se generó el token permanente:** app en Meta for Developers → Graph API Explorer (token de usuario corto con los 3 permisos) → intercambio a token de usuario largo (`oauth/access_token?grant_type=fb_exchange_token` con app secret) → `me/accounts` con el token largo → token de Página no expira. Se guardó SOLO en `.env.local` (local) y en Vercel (producción).
- **Qué se construyó:**
  - `src/lib/meta.ts`: `facebookConfigurado()` y `publicarEnPagina({mensaje, fotos})` (Graph API v25.0; sube fotos con `published=false` y luego crea el post en `/feed` con `attached_media`).
  - `src/modules/publishing/actions.ts`: `publicarEnFacebook(propiedadId, mensaje)` (verifica configuración, publica, guarda historial best-effort).
  - `src/modules/publishing/queries.ts`: `listarPublicaciones(propiedadId)` (tolera que la tabla no exista).
  - UI en `/propiedades/[id]/publicar`: botón "Publicar en Facebook" por tono + diálogo de confirmación, aviso amarillo si no está conectado, e historial con enlace "Ver post".
  - Tabla `public.publicaciones` (script `supabase/sprint3-publicaciones.sql`) creada en Supabase.
- **Grupos/Marketplace:** siguen en modo semiautomático (botón "Abrir FB" para copiar/pegar) — Meta no permite automatizarlos.
- **Pendiente:** confirmar una publicación desde producción (Vercel) tras cargar `META_PAGE_ID` y `META_PAGE_ACCESS_TOKEN` en Vercel. Opcional: Instagram Business, programar publicaciones (Vercel Cron), conectar Gemini al generador de textos.
- **Seguridad:** el App Secret se usó solo para generar el token; Omar puede regenerarlo en Meta (Settings → Basic) sin afectar el token de Página ya emitido.

### Qué quedó funcionando en el Sprint 0
- Proyecto Next.js 16 (App Router) + TypeScript + Tailwind + shadcn/ui.
- Autenticación con Supabase: pantalla de login en `/login` y panel protegido; sin sesión redirige a login (protección en `src/proxy.ts`).
- Panel de inicio con saludo y tarjetas placeholder de los próximos módulos (Propiedades, Publicaciones, WhatsApp, CRM).
- Estructura modular creada: `src/modules/{properties,publishing,whatsapp,ai-agent,crm}` y clientes Supabase en `src/lib/supabase/`.
- Deploy automático: cada `git push` a `main` actualiza el sitio en Vercel.

### Configuración externa ya hecha
- **GitHub**: repo privado `inmopilot` conectado a Vercel.
- **Supabase**: proyecto creado (región South America). Variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` configuradas en `.env.local` (local) y en Vercel (producción). Usa las claves nuevas tipo `sb_publishable_...`.
- **Vercel**: proyecto Hobby (gratis) conectado a GitHub, con las 2 variables de entorno de Supabase.

### Pendiente / notas para el próximo sprint
- Aún NO configurado (llega cuando toque): `SUPABASE_SERVICE_ROLE_KEY`, variables de Meta/Facebook, WhatsApp y `ANTHROPIC_API_KEY`.
- Recordar a Omar: Vercel Hobby es solo uso NO comercial; migrar a plan pago cuando el negocio esté en producción real.
- **Opcional Sprint 1** (si Omar lo pide): que la tarjeta del catálogo también muestre la foto completa (hoy usa `object-cover`); registrar las demás propiedades reales.
- **Al retomar (próxima sesión):** (a) Omar prueba/valora los 3 tonos del generador; (b) decidir si conectamos Gemini gratis; y/o (c) empezar Sprint 3 — se puede adelantar el código de la integración con la API de Facebook mientras Omar crea la Página del negocio.

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

- Sprint actual: **Sprint 0 — ✅ COMPLETADO**
- Última actualización: 2026-07-24
- **Sitio en producción**: https://inmopilot.vercel.app
- **Repositorio (privado)**: github.com/jocardenasr-source/inmopilot
- **Login**: correo + contraseña (Supabase Auth). Usuario de Omar creado manualmente en el panel de Supabase. No hay registro público (panel de un solo usuario).

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
- **Próximo**: Sprint 1 — Catálogo de propiedades (CRUD + fotos con Supabase Storage).

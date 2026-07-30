import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase con permisos de administrador (service role).
// Se usa SOLO en el servidor y en procesos SIN sesión de usuario, como el
// webhook de WhatsApp (Meta nos llama sin que haya un usuario logueado).
// NUNCA debe usarse en componentes cliente.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

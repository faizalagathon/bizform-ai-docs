import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
	| string
	| undefined;

if (!supabaseUrl || !supabaseAnonKey) {
	// Fail fast agar developer segera menyetel env
	// Gunakan console.error (bukan throw) agar build dev tidak crash total
	// namun jelas terlihat di konsol.
	// Di production, sebaiknya variabel lingkungan ini wajib tersedia.
	// eslint-disable-next-line no-console
	console.error(
		"[Supabase] VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum diset di .env"
	);
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");


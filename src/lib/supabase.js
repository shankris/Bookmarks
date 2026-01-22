import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://riusdpnedplgylkzsodn.supabase.co";
const supabaseAnonKey = "sb_publishable_vljWbYe8Edd8885IImQTnQ_bpw1p9JH";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

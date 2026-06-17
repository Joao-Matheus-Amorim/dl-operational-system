import { getSupabase } from "@/lib/supabase";

export async function getCurrentWorkspaceId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.workspace_id ?? null;
}

"use server";
import { query } from "@/lib/db";

export interface Stat {
  id: number;
  emoji: string;
  value: number;
  label: string;
}

export interface StatsContent {
  stats: Stat[];
}

async function getStatsSection() {
  const [data] = await query(`
    SELECT * FROM sections
    WHERE name = 'Statistics'
  `);
  return data;
}

export async function getStats(): Promise<Stat[]> {
  const section = await getStatsSection();
  return (section as any)?.content?.stats || [];
}

export async function createStat(newStat: Omit<Stat, "id">): Promise<Stat> {
  const section = await getStatsSection();
  const stats = (section as any)?.content?.stats || [];
  const id = stats.length > 0 ? Math.max(...stats.map((s:any) => s.id)) + 1 : 1;
  const statWithId = { ...newStat, id };

  const updatedStats = [...stats, statWithId];

  await query(
    `
    UPDATE sections
    SET content = jsonb_set(content, '{stats}', $1::jsonb)
    WHERE name = 'Statistics'
  `,
    [JSON.stringify(updatedStats)]
  );

  return statWithId;
}

export async function updateStat(updatedStat: Stat): Promise<Stat> {
  const section = await getStatsSection();
  const stats = (section as any)?.content?.stats || [];

  const updatedStats = stats.map((stat:any) =>
    stat.id === updatedStat.id ? updatedStat : stat
  );

  await query(
    `
    UPDATE sections
    SET content = jsonb_set(content, '{stats}', $1::jsonb)
    WHERE name = 'Statistics'
  `,
    [JSON.stringify(updatedStats)]
  );

  return updatedStat;
}

export async function deleteStat(id: number): Promise<void> {
  const section = await getStatsSection();
  const stats = (section as any)?.content?.stats || [];

  const updatedStats = stats.filter((stat:any) => stat.id !== id);

  await query(
    `
    UPDATE sections
    SET content = jsonb_set(content, '{stats}', $1::jsonb)
    WHERE name = 'Statistics'
  `,
    [JSON.stringify(updatedStats)]
  );
}

// import { supabase } from "@/lib/supabase";

// export interface Stat {
//   id: number;
//   emoji: string;
//   value: number;
//   label: string;
// }

// export interface StatsContent {
//   stats: Stat[];
// }

// async function getStatsSection() {
//   const { data, error } = await supabase
//     .from("sections")
//     .select("*")
//     .eq("name", "Statistics")
//     .single();

//   if (error) throw error;
//   return data;
// }

// export async function getStats(): Promise<Stat[]> {
//   const section = await getStatsSection();
//   return (section?.content as any)?.stats || [];
// }

// export async function createStat(newStat: Omit<Stat, "id">): Promise<Stat> {
//   const section = await getStatsSection();
//   const stats = (section?.content as any)?.stats || [];
//   const id = stats.length > 0 ? Math.max(...stats.map((s:any) => s.id)) + 1 : 1;
//   const statWithId = { ...newStat, id };

//   const updatedStats = [...stats, statWithId];

//   const { data, error } = await supabase
//     .from("sections")
//     .update({ content: { stats: updatedStats } })
//     .eq("name", "Statistics")
//     .select();

//   if (error) throw error;
//   return statWithId;
// }

// export async function updateStat(updatedStat: Stat): Promise<Stat> {
//   const section = await getStatsSection();
//   const stats = (section?.content as any)?.stats || [];

//   const updatedStats = stats?.map((stat:any) =>
//     stat.id === updatedStat.id ? updatedStat : stat
//   );

//   const { data, error } = await supabase
//     .from("sections")
//     .update({ content: { stats: updatedStats } })
//     .eq("name", "Statistics")
//     .select();

//   if (error) throw error;
//   return updatedStat;
// }

// export async function deleteStat(id: number): Promise<void> {
//   const section = await getStatsSection();
//   const stats = (section?.content as any)?.stats || [];

//   const updatedStats = stats.filter((stat:any) => stat.id !== id);

//   const { error } = await supabase
//     .from("sections")
//     .update({ content: { stats: updatedStats } })
//     .eq("name", "Statistics");

//   if (error) throw error;
// }

// import { supabase } from "@/lib/supabase";

// export interface Stat {
//   id?: number;
//   emoji: string;
//   value: number;
//   label: string;
// }

// export async function getStats() {
//   const { data, error } = await supabase
//     .from("sections")
//     .select("*")
//     .eq("name", "Stats")
//     .single();

//   if (error) throw error;
//   return data?.content?.stats || [];
// }

// export async function createStat(stat: Omit<Stat, "id">) {
//   const { data: existingData, error: fetchError } = await supabase
//     .from("sections")
//     .select("*")
//     .eq("name", "Stats")
//     .single();

//   if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

//   const newStats = existingData
//     ? [...existingData?.content?.stats, stat]
//     : [stat];

//   const { data, error } = await supabase
//     .from("sections")
//     .upsert({
//       name: "Stats",
//       content: { stats: newStats },
//       type: "static",
//       is_visible: false,
//       display_order: 0,
//     })
//     .select();

//   if (error) throw error;
//   return data[0]?.content?.stats?.[data[0]?.content?.stats.length - 1];
// }

// export async function updateStat(stat: Stat) {
//   const { data: existingData, error: fetchError } = await supabase
//     .from("sections")
//     .select("*")
//     .eq("name", "Stats")
//     .single();

//   if (fetchError) throw fetchError;

//   const updatedStats = existingData?.content?.stats?.map((s: Stat) =>
//     s.id === stat.id ? stat : s
//   );

//   const { data, error } = await supabase
//     .from("sections")
//     .update({ content: { stats: updatedStats } })
//     .eq("name", "Stats")
//     .select();

//   if (error) throw error;
//   return stat;
// }

// export async function deleteStat(id: number) {
//   const { data: existingData, error: fetchError } = await supabase
//     .from("sections")
//     .select("*")
//     .eq("name", "Stats")
//     .single();

//   if (fetchError) throw fetchError;

//   const updatedStats = existingData.content.stats.filter(
//     (s: Stat) => s.id !== id
//   );

//   const { error } = await supabase
//     .from("sections")
//     .update({ content: { stats: updatedStats } })
//     .eq("name", "Stats");

//   if (error) throw error;
// }

// import { supabase } from "@/lib/supabase";

// export interface Stat {
//   id: number;
//   emoji: string;
//   value: number;
//   label: string;
// }

// export async function getStats() {
//   const { data, error } = await supabase.from("stats").select("*").order("id");

//   if (error) throw error;
//   return data;
// }

// export async function createStat(stat: Omit<Stat, "id">) {
//   const dataToSend = { ...stat };

//   const { data, error } = await supabase
//     .from("stats")
//     .insert(dataToSend)
//     .select();

//   if (error) throw error;
//   return data[0];
// }

// export async function updateStat(stat: Stat) {
//   //   const dataToSend = { ...(stat as Omit<Stat, "id">) };
//   console.log("data to send", stat);
//   const { id, ...rest } = stat;
//   const { data, error } = await supabase
//     .from("stats")
//     .update(rest)
//     .eq("id", id as number)
//     .select();

//   if (error) throw error;
//   return data[0];
// }

// export async function deleteStat(id: number) {
//   const { error } = await supabase.from("stats").delete().eq("id", id);

//   if (error) throw error;
// }

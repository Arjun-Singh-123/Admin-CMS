import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { StatsFormData } from "@/types/stats";

export const useStatsQuery = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .eq("name", "Stats")
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateStatsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StatsFormData) => {
      const { error } = await supabase.from("sections").insert({
        name: "Statistics",
        content: data,
        type: "static",
        display_order: 1,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Stats section created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error creating stats section: ${error.message}`);
    },
  });
};

export const useUpdateStatsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StatsFormData) => {
      const { error } = await supabase
        .from("sections")
        .update({ content: data })
        .eq("name", "Stats");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Stats section updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error updating stats section: ${error.message}`);
    },
  });
};

export const useDeleteStatsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("sections")
        .delete()
        .eq("name", "Stats");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Stats section deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error deleting stats section: ${error.message}`);
    },
  });
};

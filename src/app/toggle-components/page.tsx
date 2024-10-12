"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Section = {
  id: number;
  section_name: string;
  is_visible: boolean;
  page: string;
};

const fetchSections = async (): Promise<Section[]> => {
  const { data, error } = await supabase
    .from("homepage_sections")
    .select("*")
    .order("id");
  if (error) throw error;
  return data as Section[];
};

const updateSectionVisibility = async ({
  id,
  is_visible,
}: {
  id: number;
  is_visible: boolean;
}) => {
  const { data, error } = await supabase
    .from("homepage_sections")
    .update({ is_visible })
    .eq("id", id);
  if (error) throw error;
  else {
    toast.success("status updated successfully");
    return data;
  }
};

export default function CMSComponent() {
  const queryClient = useQueryClient();

  const {
    data: sections,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["sections"],
    queryFn: fetchSections,
  });

  const mutation = useMutation({
    mutationFn: updateSectionVisibility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching sections</div>;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Homepage Section Management</CardTitle>
        <CardDescription>
          Toggle visibility of homepage sections
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sections?.map((section) => (
          <div
            key={section.id}
            className="flex items-center justify-between py-2"
          >
            <span className="text-lg font-medium capitalize">
              {section.section_name}
            </span>
            <Switch
              checked={section.is_visible}
              onCheckedChange={(checked) =>
                mutation.mutate({ id: section.id, is_visible: checked })
              }
            />
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["sections"] })
          }
        >
          Refresh Sections
        </Button>
      </CardFooter>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bath,
  Music,
  ChefHat,
  Wifi,
  CookingPot,
  ShieldCheck,
  Bed,
} from "lucide-react";
import { Benefit } from "@/types/benefit-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const iconOptions = [
  { value: "Bath", label: "Bath" },
  { value: "Music", label: "Music" },
  { value: "ChefHat", label: "Chef Hat" },
  { value: "Wifi", label: "Wifi" },
  { value: "CookingPot", label: "Cooking Pot" },
  { value: "ShieldCheck", label: "Shield Check" },
  { value: "Bed", label: "Bed" },
];

async function fetchBenefits(): Promise<Benefit[]> {
  const response = await fetch("/api/benefits");
  if (!response.ok) {
    throw new Error("Failed to fetch benefits");
  }
  return response.json();
}

export default function BenefitsManagement() {
  const queryClient = useQueryClient();
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);

  const {
    data: benefits,
    isLoading,
    error,
  } = useQuery<Benefit[]>({
    queryKey: ["benefits"],
    queryFn: fetchBenefits,
  });

  const createMutation = useMutation({
    mutationFn: async (newBenefit: Omit<Benefit, "id">) => {
      const response = await fetch("/api/benefits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBenefit),
      });
      if (!response.ok) {
        throw new Error("Failed to create benefit");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["benefits"] });
      toast.success("Benefit added successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedBenefit: Benefit) => {
      const response = await fetch(`/api/benefits/${updatedBenefit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBenefit),
      });
      if (!response.ok) {
        throw new Error("Failed to update benefit");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["benefits"] });
      toast.success("Benefit updated successfully");
      setEditingBenefit(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/benefits/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete benefit");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["benefits"] });
      toast.success("Benefit deleted successfully");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const benefitData = {
      icon: formData.get("icon") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      display_order: parseInt(formData.get("display_order") as string, 10),
    };

    if (editingBenefit) {
      updateMutation.mutate({ ...benefitData, id: editingBenefit.id });
    } else {
      createMutation.mutate(benefitData);
    }
    event.currentTarget.reset();
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select name="icon" defaultValue={editingBenefit?.icon || ""}>
          <SelectTrigger>
            <SelectValue placeholder="Select an icon" />
          </SelectTrigger>
          <SelectContent>
            {iconOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          name="title"
          placeholder="Title"
          defaultValue={editingBenefit?.title || ""}
          required
        />
        <Textarea
          name="description"
          placeholder="Description"
          defaultValue={editingBenefit?.description || ""}
          required
        />
        <Input
          name="display_order"
          type="number"
          placeholder="Display Order"
          defaultValue={editingBenefit?.display_order || ""}
          required
        />
        <Button type="submit">
          {editingBenefit ? "Update Benefit" : "Add Benefit"}
        </Button>
      </form>

      <ScrollArea className="h-[300px] w-full rounded-md border p-4"> 
        <h2 className="text-xl font-bold mb-4">Current Benefits</h2>
        <ul className="space-y-4">
          {benefits?.map((benefit) => (
            <li key={benefit.id} className="p-4 border rounded">
              <h3 className="font-bold">{benefit.title}</h3>
              <p>{benefit.description}</p>
              <p>Icon: {benefit.icon}</p>
              <p>Display Order: {benefit.display_order}</p>
              <div className="mt-2 space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingBenefit(benefit)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(benefit.id)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUp, ArrowDown, Trash } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Fetch sections
const fetchSections = async () => {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

// Add new section
const addSection = async (newSection: any) => {
  const { data, error } = await supabase
    .from("sections")
    .insert(newSection)
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};

// Update section
const updateSection = async (updatedSection: any) => {
  const { data, error } = await supabase
    .from("sections")
    .update(updatedSection)
    .eq("id", updatedSection.id)
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};

// Delete section
const deleteSection = async (id: any) => {
  const { error } = await supabase.from("sections").delete().eq("id", id);

  if (error) throw new Error(error.message);
};

export default function SectionsCMS() {
  const queryClient = useQueryClient();
  const [newSectionName, setNewSectionName] = useState("");

  const {
    data: sections = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sections"],
    queryFn: fetchSections,
  });

  const addMutation = useMutation({
    mutationFn: addSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      setNewSectionName("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sections"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sections"] }),
  });

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      addMutation.mutate({
        name: newSectionName.trim(),
        display_order: sections.length,
        is_visible: true,
      });
    }
  };

  const handleUpdateOrder = (id: any, newOrder: any) => {
    const section = sections.find((s) => s.id === id);
    if (section && newOrder >= 0 && newOrder < sections.length) {
      updateMutation.mutate({ ...section, display_order: newOrder });
    }
  };

  const handleToggleVisibility = (id: any, newVisibility: any) => {
    const section = sections.find((s) => s.id === id);
    if (section) {
      updateMutation.mutate({ ...section, is_visible: newVisibility });
    }
  };

  const handleDeleteSection = (id: any) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Sections</h1>

      <div className="mb-4 flex gap-2">
        <Input
          type="text"
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
          placeholder="New section name"
          className="flex-grow"
        />
        <Button onClick={handleAddSection}>Add Section</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Visible</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections?.map((section, index) => (
            <TableRow key={section.id}>
              <TableCell>{section.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {section.display_order + 1}
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      handleUpdateOrder(section.id, section.display_order - 1)
                    }
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      handleUpdateOrder(section.id, section.display_order + 1)
                    }
                    disabled={index === sections.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <Switch
                  checked={section.is_visible as boolean}
                  onCheckedChange={(checked) =>
                    handleToggleVisibility(section.id, checked)
                  }
                />
              </TableCell>
              <TableCell>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDeleteSection(section.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

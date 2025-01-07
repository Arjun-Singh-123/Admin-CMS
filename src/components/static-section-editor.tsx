"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().min(1, "Icon is required"),
  image_url: z.string().min(1, "Image is required"),
});

type FormData = z.infer<typeof schema>;

interface StaticSectionEditorProps {
  section: {
    id: string;
    title: string;
    description: string;
    icon: string;
    image_url: string;
  };
}

const updateStaticSection = async (sectionId: string, data: FormData) => {
  const { error } = await supabase
    .from("sections")
    .update({
      title: data.title,
      description: data.description,
      icon: data.icon,
      image_url: data.image_url,
    })
    .eq("id", sectionId);

  if (error) throw new Error(error.message);
};

export function StaticSectionEditor({ section }: StaticSectionEditorProps) {
  const queryClient = useQueryClient();
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: section.title,
      description: section.description,
      icon: section.icon,
      image_url: section.image_url,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => updateStaticSection(section.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      toast.success("Section updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating section: ${error.message}`);
    },
  });

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `section-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("images").getPublicUrl(filePath);

      if (data?.publicUrl) {
        setValue("image_url", data.publicUrl);
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      toast.error("Error uploading image");
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Static Section: {section.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Controller
              name="title"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Title" />}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea {...field} placeholder="Description" />
              )}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Icon (e.g., lucide icon name)" />
              )}
            />
            {errors.icon && (
              <p className="text-red-500 text-sm mt-1">{errors.icon.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="image_url"
              control={control}
              render={({ field }) => (
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleImageUpload(e);
                      field.onChange(e);
                    }}
                    disabled={uploadingImage}
                  />
                  {field.value && (
                    <img
                      src={field.value}
                      alt="Section"
                      className="mt-2 w-full max-w-xs h-auto"
                    />
                  )}
                </>
              )}
            />
            {errors.image_url && (
              <p className="text-red-500 text-sm mt-1">
                {errors.image_url.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={mutation.isPending || uploadingImage}>
            {mutation.isPending ? "Updating..." : "Update Section"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

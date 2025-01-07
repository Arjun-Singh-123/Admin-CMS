"use client";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast, Toaster } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

// Zod schema for form validation
const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  profession: z.string().nullable(),
  about: z.string().nullable(),
  email: z.string().email("Invalid email address"),
  phone: z.string().nullable(),
  image: z.string().url("Invalid image URL").nullable(),
});

type Member = z.infer<typeof memberSchema>;

// Fetch members
const getMembers = async () => {
  const { data, error } = await supabase.from("members").select("*");
  if (error) throw error;
  return data;
};

// Create a new member
const createMember = async (member: Member) => {
  const { data, error } = await supabase
    .from("members")
    .insert(member)
    .single();
  if (error) throw error;
  return data;
};

// Update a member
const updateMember = async ({ id, ...member }: Member & { id: number }) => {
  const { data, error } = await supabase
    .from("members")
    .update(member)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

// Delete a member
const deleteMember = async (id: number) => {
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) throw error;
};

export default function MembersCMS() {
  const queryClient = useQueryClient();
  const [editingMember, setEditingMember] = React.useState<
    (Member & { id: number }) | null
  >(null);

  // Queries
  const membersQuery = useQuery({ queryKey: ["members"], queryFn: getMembers });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member created successfully!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member updated successfully!");
      setEditingMember(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member deleted successfully!");
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Member>({
    resolver: zodResolver(memberSchema),
    defaultValues: editingMember || {
      name: "",
      profession: "",
      about: "",
      email: "",
      phone: "",
      image: "",
    },
  });

  React.useEffect(() => {
    if (editingMember) {
      reset(editingMember);
    }
  }, [editingMember, reset]);

  const onSubmit = (data: Member) => {
    if (editingMember) {
      updateMutation.mutate({ ...data, id: editingMember.id });
    } else {
      createMutation.mutate(data);
    }
    reset();
  };

  //   const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //     const file = event.target.files?.[0]
  //     if (!file) return

  //     try {
  //       const fileExt = file.name.split('.').pop()
  //       const fileName = `${Math.random()}.${fileExt}`
  //       const filePath = `uploads/${fileName}`

  //       let { error: uploadError } = await supabase.storage
  //         .from('images')
  //         .upload(filePath, file)

  //       if (uploadError) throw uploadError

  //       const { data, error } = supabase.storage
  //         .from('images')
  //         .getPublicUrl(filePath)

  //       if (error) throw error

  //       setImageUrl(data.publicUrl)
  //     } catch (error) {
  //       console.error('Error uploading image:', error)
  //     }
  //   }

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">Members CMS</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="profession">Profession</Label>
          <Input id="profession" {...register("profession")} />
        </div>
        <div>
          <Label htmlFor="about">About</Label>
          <Textarea id="about" {...register("about")} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>
        <div>
          <Label htmlFor="image">Image URL</Label>
          <Input id="image" {...register("image")} />
          {errors.image && (
            <p className="text-red-500">{errors.image.message}</p>
          )}
        </div>
        <Button type="submit">
          {editingMember ? "Update" : "Create"} Member
        </Button>
        {editingMember && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditingMember(null)}
          >
            Cancel Edit
          </Button>
        )}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {membersQuery.data?.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <CardTitle>{member.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Profession:</strong> {member.profession}
              </p>
              <p>
                <strong>Email:</strong> {member.email}
              </p>
              <p>
                <strong>Phone:</strong> {member.phone}
              </p>
              <p>
                <strong>About:</strong> {member.about}
              </p>
              {member.image && (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-40 object-cover mt-2"
                />
              )}
              <div className="flex justify-end space-x-2 mt-4">
                <Button onClick={() => setEditingMember(member)}>Edit</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the member from the database.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(member.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

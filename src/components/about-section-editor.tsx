"use client";

import * as React from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getAbout,
  createAbout,
  updateAbout,
  deleteAboutContent,
  uploadImage,
  AboutContent,
} from "@/services/about-services";

const additionalContentSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),
});

const aboutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  button_text: z.string().min(1, "Button text is required"),
  image_url: z.string().url("Must be a valid URL").optional(),
  additional_content: z.array(additionalContentSchema),
});

type AboutFormData = z.infer<typeof aboutSchema>;

export default function AboutEditor() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);

  const { data: aboutData, isLoading } = useQuery({
    queryKey: ["about"],
    queryFn: () => getAbout(),
    select: (data) => (data as any)?.content,
  });

  console.log(aboutData);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
    control,
  } = useForm<AboutFormData>({
    resolver: zodResolver(aboutSchema),
    defaultValues: aboutData || {
      title: "",
      description: "",
      button_text: "",
      image_url: "",
      additional_content: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "additional_content",
  });
  React.useEffect(() => {
    if (aboutData) {
      reset(aboutData);
    }
  }, [aboutData, reset]);

  const createMutation = useMutation({
    mutationFn: createAbout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about"] });
      toast.success("About section created successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(`Error creating about section: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAbout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about"] });
      toast.success("About section updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(`Error updating about section: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAboutContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about"] });
      toast.success("About section content deleted successfully");
      setIsDeleteDialogOpen(false);
      reset({});
    },
    onError: (error) => {
      toast.error(`Error deleting about section content: ${error.message}`);
    },
  });

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const publicUrl = await uploadImage(file, "about-images");
      setValue("image_url", publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Error uploading image");
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit: SubmitHandler<AboutFormData> = (data) => {
    const contentWithImage: AboutContent = {
      ...data,
      // image_url: aboutData?.image_url || "",
    };

    if (aboutData) {
      updateMutation.mutate(contentWithImage);
    } else {
      createMutation.mutate(contentWithImage);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>About Section</CardTitle>
      </CardHeader>
      <CardContent>
        {!isEditing && aboutData ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{aboutData?.title}</h2>
            <p>{aboutData?.description}</p>
            {aboutData.image_url && (
              <img
                src={aboutData.image_url}
                alt="About"
                className="mt-4 h-64 w-64 object-cover"
              />
            )}
            <p>Button text: {aboutData.button_text}</p>
            <h3 className="text-xl font-semibold mt-6">Additional Content</h3>
            {aboutData?.additional_content?.map((content: any, index: any) => (
              <div key={index} className="mt-4">
                <h4 className="text-lg font-semibold">{content.title}</h4>
                <p>{content.description}</p>
              </div>
            ))}
            <div className="flex space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Content
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Are you sure you want to delete the content?
                    </DialogTitle>
                    <DialogDescription>
                      This action will remove all content from the About
                      section. The section itself will remain, but empty.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteMutation.mutate()}
                    >
                      Delete Content
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input {...register("title")} placeholder="Title" />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}

            <Textarea {...register("description")} placeholder="Description" />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}

            <Input {...register("button_text")} placeholder="Button text" />
            {errors.button_text && (
              <p className="text-red-500">{errors.button_text.message}</p>
            )}

            <div>
              <Input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
              />
              {uploadingImage && <p>Uploading image...</p>}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Additional Content</h3>
              {fields?.map((field, index) => (
                <div key={field.id} className="space-y-2 mb-4">
                  <Input
                    {...register(`additional_content.${index}.title`)}
                    placeholder="Title"
                  />
                  {errors.additional_content?.[index]?.title && (
                    <p className="text-red-500">
                      {errors.additional_content[index]?.title?.message}
                    </p>
                  )}
                  <Textarea
                    {...register(`additional_content.${index}.description`)}
                    placeholder="Description"
                  />
                  {errors.additional_content?.[index]?.description && (
                    <p className="text-red-500">
                      {errors.additional_content[index]?.description?.message}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => remove(index)}
                  >
                    <Minus className="mr-2 h-4 w-4" /> Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ title: "", description: "" })}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Additional Content
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  uploadingImage
                }
              >
                {aboutData ? "Update" : "Create"}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    reset(aboutData || undefined);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// "use client";

// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Pencil, Trash2, X, Check } from "lucide-react";
// import { toast } from "sonner";
// import { supabase } from "@/lib/supabase";

// const aboutSchema = z.object({
//   title: z.string().min(1, "Title is required"),
//   // subtitle: z.string().min(1, "Subtitle is required"),
//   // title1: z.string().min(1, "Title 1 is required"),
//   // title2: z.string().min(1, "Title 2 is required"),
//   description: z.string().min(1, "Description is required"),
//   image_url: z.string().url("Must be a valid URL"),
//   button_text: z.string().min(1, "Subtitle is required"),
// });

// type AboutFormData = z.infer<typeof aboutSchema>;

// export default function AboutEditor() {
//   const queryClient = useQueryClient();
//   const [uploadingImage, setUploadingImage] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);

//   const { data: aboutData, isLoading } = useQuery({
//     queryKey: ["about"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("sections")
//         .select("*")
//         .eq("name", "About")
//         .single();

//       if (error) {
//         if (error.code === "PGRST116") {
//           // No data found
//           return null;
//         }
//         throw error;
//       }
//       return data;
//     },
//   });

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     reset,
//   } = useForm<AboutFormData>({
//     resolver: zodResolver(aboutSchema),
//     defaultValues: (aboutData?.content as AboutFormData) || {},
//   });

//   const createMutation = useMutation({
//     mutationFn: async (data: AboutFormData) => {
//       const { error } = await supabase.from("sections").insert({
//         name: "About",
//         content: data,
//         type: "static",
//         is_visible: false,
//         display_order: 0,
//       });

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["about"] });
//       toast.success("About section created successfully");
//       reset();
//     },
//     onError: (error) => {
//       toast.error(`Error creating about section: ${error.message}`);
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: async (data: AboutFormData) => {
//       const { error } = await supabase
//         .from("sections")
//         .update({ content: data, is_visible: false })
//         .eq("name", "About");

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["about"] });
//       toast.success("About section updated successfully");
//       setIsEditing(false);
//     },
//     onError: (error) => {
//       toast.error(`Error updating about section: ${error.message}`);
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async () => {
//       const { error } = await supabase
//         .from("sections")
//         .delete()
//         .eq("name", "About");

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["about"] });
//       toast.success("About section deleted successfully");
//       reset();
//     },
//     onError: (error) => {
//       toast.error(`Error deleting about section: ${error.message}`);
//     },
//   });

//   const handleImageUpload = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setUploadingImage(true);
//     try {
//       const fileExt = file.name.split(".").pop();
//       const fileName = `${Math.random()}.${fileExt}`;
//       const filePath = `about-images/${fileName}`;

//       const { error: uploadError } = await supabase.storage
//         .from("images")
//         .upload(filePath, file);

//       if (uploadError) {
//         throw uploadError;
//       }

//       const { data } = supabase.storage.from("images").getPublicUrl(filePath);

//       if (data?.publicUrl) {
//         setValue("image_url", data.publicUrl);
//         toast.success("Image uploaded successfully");
//       }
//     } catch (error) {
//       toast.error("Error uploading image");
//       console.error("Error uploading image:", error);
//     } finally {
//       setUploadingImage(false);
//     }
//   };

//   const onSubmit = (data: AboutFormData) => {
//     if (aboutData) {
//       updateMutation.mutate(data);
//     } else {
//       createMutation.mutate(data);
//     }
//   };

//   const handleDelete = () => {
//     if (window.confirm("Are you sure you want to delete this about section?")) {
//       deleteMutation.mutate();
//     }
//   };

//   const handleEdit = () => {
//     setIsEditing(true);
//     reset(aboutData?.content as AboutFormData);
//   };

//   if (isLoading) return <div>Loading...</div>;

//   return (
//     <div className="space-y-8">
//       {aboutData && !isEditing ? (
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between">
//             <CardTitle>Current About Section</CardTitle>
//             <div className="flex space-x-2">
//               <Button variant="outline" size="icon" onClick={handleEdit}>
//                 <Pencil className="h-4 w-4" />
//               </Button>
//               <Button variant="destructive" size="icon" onClick={handleDelete}>
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div>
//               <h2 className="text-2xl font-bold">
//                 {(aboutData?.content as AboutFormData)?.title}
//               </h2>
//               {/* <h3 className="text-xl">
//                 {(aboutData?.content as AboutFormData)?.subtitle}
//               </h3>
//               <h4 className="text-lg font-semibold">
//                 {(aboutData?.content as AboutFormData)?.title1}
//               </h4>
//               <h4 className="text-lg font-semibold">
//                 {(aboutData?.content as AboutFormData)?.title2}
//               </h4> */}
//               <p>{(aboutData?.content as AboutFormData)?.description}</p>
//               <img
//                 src={(aboutData?.content as AboutFormData)?.image_url}
//                 alt="About"
//                 className="mt-4 h-64 w-64"
//               />
//             </div>
//           </CardContent>
//         </Card>
//       ) : (
//         <Card>
//           <CardHeader>
//             <CardTitle>
//               {aboutData ? "Edit About Section" : "Create About Section"}
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               <Input {...register("title")} placeholder="Title" />
//               {errors.title && (
//                 <p className="text-red-500">{errors.title.message}</p>
//               )}

//               {/* <Input {...register("subtitle")} placeholder="Subtitle" />
//               {errors.subtitle && (
//                 <p className="text-red-500">{errors.subtitle.message}</p>
//               )} */}

//               {/* <Input {...register("title1")} placeholder="Title 1" />
//               {errors.title1 && (
//                 <p className="text-red-500">{errors.title1.message}</p>
//               )} */}

//               {/* <Input {...register("title2")} placeholder="Title 2" />
//               {errors.title2 && (
//                 <p className="text-red-500">{errors.title2.message}</p>
//               )} */}
//               <Input {...register("button_text")} placeholder="Button text" />
//               {errors.button_text && (
//                 <p className="text-red-500">{errors.button_text.message}</p>
//               )}

//               <Textarea
//                 {...register("description")}
//                 placeholder="Description"
//               />
//               {errors.description && (
//                 <p className="text-red-500">{errors.description.message}</p>
//               )}

//               <div>
//                 <Input
//                   type="file"
//                   onChange={handleImageUpload}
//                   accept="image/*"
//                 />
//                 {uploadingImage && <p>Uploading image...</p>}
//               </div>

//               {/* <Input
//                 {...register("image_url")}
//                 placeholder="Image URL"
//                 readOnly
//               />
//               {errors.image_url && (
//                 <p className="text-red-500">{errors.image_url.message}</p>
//               )} */}

//               <div className="flex space-x-2">
//                 <Button
//                   type="submit"
//                   disabled={
//                     createMutation.isPending ||
//                     updateMutation.isPending ||
//                     uploadingImage
//                   }
//                 >
//                   {aboutData ? "Update" : "Create"}
//                 </Button>
//                 {isEditing && (
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setIsEditing(false)}
//                   >
//                     Cancel
//                   </Button>
//                 )}
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

// "use client";

// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Pencil, Trash2, X, Check } from "lucide-react";
// import { toast } from "sonner";
// import { supabase } from "@/lib/supabase";

// const aboutSchema = z.object({
//   title: z.string().min(1, "Title is required"),
//   subtitle: z.string().min(1, "Subtitle is required"),
//   title1: z.string().min(1, "Title 1 is required"),
//   title2: z.string().min(1, "Title 2 is required"),
//   description: z.string().min(1, "Description is required"),
//   image_url: z.string().url("Must be a valid URL"),
// });

// type AboutFormData = z.infer<typeof aboutSchema>;

// export default function AboutEditor() {
//   const queryClient = useQueryClient();
//   const [uploadingImage, setUploadingImage] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);

//   const { data: aboutData, isLoading } = useQuery({
//     queryKey: ["about"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("sections")
//         .select("*")
//         .eq("name", "About")
//         .single();

//       if (error) throw error;
//       return data;
//     },
//   });

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     reset,
//   } = useForm<AboutFormData>({
//     resolver: zodResolver(aboutSchema),
//     defaultValues: (aboutData?.content as AboutFormData) || {},
//   });

//   //   const {
//   //     register: registerInline,
//   //     handleSubmit: handleSubmitInline,
//   //     formState: { errors: inlineErrors },
//   //     reset: resetInline,
//   //   } = useForm<AboutFormData>({
//   //     resolver: zodResolver(aboutSchema),
//   //     defaultValues: (aboutData?.content as AboutFormData) || {},
//   //   });

//   const createMutation = useMutation({
//     mutationFn: async (data: AboutFormData) => {
//       const { error } = await supabase.from("sections").insert({
//         name: "About Yachts",
//         content: data,
//         type: "static",
//         display_order: 0,
//       });

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["about"] });
//       toast.success("About section created successfully");
//       reset();
//     },
//     onError: (error) => {
//       toast.error(`Error creating about section: ${error.message}`);
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: async (data: AboutFormData) => {
//       const { error } = await supabase
//         .from("sections")
//         .update({ content: data })
//         .eq("name", "About");

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["about"] });
//       toast.success("About section updated successfully");
//       setIsEditing(false);
//       reset();
//     },
//     onError: (error) => {
//       toast.error(`Error updating about section: ${error.message}`);
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async () => {
//       const { error } = await supabase
//         .from("sections")
//         .delete()
//         .eq("name", "About");

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["about"] });

//       toast.success("About section deleted successfully");
//       reset();
//     },
//     onError: (error) => {
//       toast.error(`Error deleting about section: ${error.message}`);
//     },
//   });

//   const handleImageUpload = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setUploadingImage(true);
//     try {
//       const fileExt = file.name.split(".").pop();
//       const fileName = `${Math.random()}.${fileExt}`;
//       const filePath = `about-images/${fileName}`;

//       const { error: uploadError } = await supabase.storage
//         .from("images")
//         .upload(filePath, file);

//       if (uploadError) {
//         throw uploadError;
//       }

//       const { data } = supabase.storage.from("images").getPublicUrl(filePath);

//       if (data?.publicUrl) {
//         setValue("image_url", data.publicUrl);
//         toast.success("Image uploaded successfully");
//       }
//     } catch (error) {
//       toast.error("Error uploading image");
//       console.error("Error uploading image:", error);
//     } finally {
//       setUploadingImage(false);
//     }
//   };

//   const onSubmit = (data: AboutFormData) => {
//     if (isEditing) {
//       updateMutation.mutate(data);
//     } else {
//       createMutation.mutate(data);
//     }
//   };

//   const onInlineSubmit = (data: AboutFormData) => {
//     updateMutation.mutate(data);
//   };

//   const handleDelete = () => {
//     if (window.confirm("Are you sure you want to delete this about section?")) {
//       deleteMutation.mutate();
//     }
//   };

//   const handleEdit = () => {
//     setIsEditing(true);
//     reset(aboutData?.content as AboutFormData);
//   };

//   return (
//     <div className="space-y-8">
//       <Card>
//         <CardHeader>
//           <CardTitle>About Section Editor</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <Input {...register("title")} placeholder="Title" />
//             {errors.title && (
//               <p className="text-red-500">{errors.title.message}</p>
//             )}

//             <Input {...register("subtitle")} placeholder="Subtitle" />
//             {errors.subtitle && (
//               <p className="text-red-500">{errors.subtitle.message}</p>
//             )}

//             <Input {...register("title1")} placeholder="Title 1" />
//             {errors.title1 && (
//               <p className="text-red-500">{errors.title1.message}</p>
//             )}

//             <Input {...register("title2")} placeholder="Title 2" />
//             {errors.title2 && (
//               <p className="text-red-500">{errors.title2.message}</p>
//             )}

//             <Textarea {...register("description")} placeholder="Description" />
//             {errors.description && (
//               <p className="text-red-500">{errors.description.message}</p>
//             )}

//             <div>
//               <Input
//                 type="file"
//                 onChange={handleImageUpload}
//                 accept="image/*"
//               />
//               {uploadingImage && <p>Uploading image...</p>}
//             </div>

//             <Input
//               {...register("image_url")}
//               placeholder="Image URL"
//               readOnly
//             />
//             {errors.image_url && (
//               <p className="text-red-500">{errors.image_url.message}</p>
//             )}

//             <div className="flex space-x-2">
//               <Button
//                 type="submit"
//                 disabled={
//                   createMutation.isPending ||
//                   updateMutation.isPending ||
//                   uploadingImage
//                 }
//               >
//                 {isEditing ? "Update" : "Create"}
//               </Button>
//               {aboutData && (
//                 <Button
//                   type="button"
//                   variant="destructive"
//                   onClick={() => deleteMutation.mutate()}
//                   disabled={deleteMutation.isPending}
//                 >
//                   Delete
//                 </Button>
//               )}
//             </div>
//           </form>
//         </CardContent>
//       </Card>

//       {!isLoading && aboutData && (
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between">
//             <CardTitle>Current About Section</CardTitle>
//             <div className="flex space-x-2">
//               <Button variant="outline" size="icon" onClick={handleEdit}>
//                 {isEditing ? (
//                   <X className="h-4 w-4" />
//                 ) : (
//                   <Pencil className="h-4 w-4" />
//                 )}
//               </Button>
//               <Button variant="destructive" size="icon" onClick={handleDelete}>
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div>
//               <h2 className="text-2xl font-bold">{aboutData.content.title}</h2>
//               <h3 className="text-xl">{aboutData.content.subtitle}</h3>
//               <h4 className="text-lg font-semibold">
//                 {aboutData.content.title1}
//               </h4>
//               <h4 className="text-lg font-semibold">
//                 {aboutData.content.title2}
//               </h4>
//               <p>{aboutData.content.description}</p>
//               <img
//                 src={aboutData.content.image_url}
//                 alt="About"
//                 className="mt-4 h-64 w-64  "
//               />
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

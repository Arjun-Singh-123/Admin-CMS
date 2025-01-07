"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { title } from "process";
import { BASE_API_URL } from "@/types/benefit-types";

// Zod schemas
const RentalItemSchema = z.object({
  id: z.string().optional(),
  vessel_name: z.string().min(1, "Vessel name is required"),
  length: z.string().min(1, "Length is required"),
  weekday: z.string().min(1, "Weekday rate is required"),
  weekend: z.string().min(1, "Weekend rate is required"),
  half_day: z.string().min(1, "Half day rate is required"),
});

const CategoryInfoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Invalid image URL"),
  features: z.array(z.string()),
});

const RentalDataSchema = z.object({
  id: z.string(),
  members: z.array(RentalItemSchema),
  non_members: z.array(RentalItemSchema),
  category_info: CategoryInfoSchema,
  title: z.string(),
  description: z.string(),
});

type RentalItem = z.infer<typeof RentalItemSchema>;
type CategoryInfo = z.infer<typeof CategoryInfoSchema>;
type RentalData = z.infer<typeof RentalDataSchema>;

// API functions
async function fetchRentals(): Promise<RentalData[]> {
  const response = await fetch(`${BASE_API_URL}/rentals`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

async function updateRental(data: Partial<RentalData>): Promise<RentalData> {
  const response = await fetch(`/api/rentals/${data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

// RentalForm component
function RentalForm({ onSubmit, onCancel, editingItem, form }: any) {
  console.log(editingItem);
  // useEffect(() => {
  //   if (editingItem) {
  //     console.log(editingItem);
  //     form.reset({
  //       vessel_name: editingItem?.vessel_name || "",
  //       length: editingItem?.length || "",
  //       weekday: editingItem?.weekday || "",
  //       weekend: editingItem?.weekend || "",
  //       half_day: editingItem?.half_day || "",
  //     });
  //     console.log(form.getValues());
  //   }
  // }, [editingItem, form]);

  useEffect(() => {
    if (editingItem) {
      const values = {
        vessel_name: editingItem?.vessel_name || "",
        length: editingItem?.length || "",
        weekday: editingItem?.weekday || "",
        weekend: editingItem?.weekend || "",
        half_day: editingItem?.half_day || "",
      };

      form.reset(values);
    }
  }, [editingItem, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="vessel_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vessel Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="length"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Length</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="weekday"
          render={({ field }) => {
            console.log(field);
            return (
              <FormItem>
                <FormLabel>Weekday Rate</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} type="text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="weekend"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weekend Rate</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="half_day"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Half Day Rate</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}

// RentalList component
function RentalList({
  data,
  type,
  onUpdate,
  editingItem,
  setEditingItem,
  form,
  title1,
  description1,
}: any) {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const handleEdit = (item: RentalItem) => {
    console.log(item);
    setEditingItem(item);
    // form.reset({
    //   vessel_name: item?.vessel_name ? item?.vessel_name : "",
    //   length: item?.length ? item?.length : "",
    //   weekday: item?.weekday || "",
    //   weekend: item?.weekend || "",
    //   half_day: item?.half_day || "",
    // });
  };

  const handleDelete = (item: RentalItem) => {
    const updatedData = data.filter(
      (rentalItem: any) => rentalItem.id !== item.id
    );
    onUpdate({ [type]: updatedData });
  };

  const handleFormSubmit = (formData: RentalItem) => {
    let updatedData;
    if (editingItem) {
      updatedData = data?.map((item: any) =>
        item.id === editingItem.id ? { ...formData, id: item.id } : item
      );
    } else {
      updatedData = [...data, { ...formData, id: Date.now().toString() }];
    }
    onUpdate({ [type]: updatedData });
    setEditingItem(null);
  };

  const handleCancel = () => {
    setEditingItem(null);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  const handleSave = () => {
    // Save the updated title and description
    const updatedItem = { ...editingItem, title, description };
    onUpdate(updatedItem);
    setEditingItem(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {type === "members" ? "Members" : "Non-Members"} Rental Data
        </CardTitle>
        <Button
          onClick={() =>
            setEditingItem({
              vessel_name: "",
              length: "",
              weekday: "",
              weekend: "",
              half_day: "",
            })
          }
          className="mt-2"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New {type === "members" ? "Member" : "Non-Member"}
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-4">
            {!editingItem && title1 && (
              <h2 className="text-xl font-bold">{title1}</h2>
            )}{" "}
            {!editingItem && description1 && <p>{description1}</p>}
            {editingItem && (
              <div>
                <h2 className="text-xl font-bold">
                  Edit Title and Description
                </h2>
                <form onSubmit={handleSave}>
                  <div>
                    <label htmlFor="title">Title</label>
                    <Input
                      id="title"
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="Title"
                    />
                  </div>
                  <div>
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={handleDescriptionChange}
                      placeholder="Description"
                    />
                  </div>
                  <Button type="submit">Save</Button>
                </form>
              </div>
            )}
            {editingItem && (
              <Card className="p-4 bg-muted">
                <RentalForm
                  onSubmit={handleFormSubmit}
                  // initialData={editingItem}
                  onCancel={handleCancel}
                  form={form}
                  editingItem={editingItem}
                />
              </Card>
            )}
            {data?.map((item: any) => (
              <Card key={item.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{item.vessel_name}</h3>
                    <p className="text-sm text-gray-500">
                      Length: {item.length}ft
                    </p>
                    <p className="text-sm">Weekday: ${item.weekday}</p>
                    <p className="text-sm">Weekend: ${item.weekend}</p>
                    <p className="text-sm">Half Day: ${item.half_day}</p>
                  </div>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// CategoryInfoForm component
function CategoryInfoForm({ data, onUpdate }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<CategoryInfo>({
    resolver: zodResolver(CategoryInfoSchema),
    defaultValues: data,
  });

  const onSubmit = (formData: CategoryInfo) => {
    onUpdate({ category_info: formData });
    setIsEditing(false);
  };

  const resetForm = () => {
    console.log(data);
    form.reset(data);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Information</CardTitle>
        <CardDescription>
          Manage general information about the rental category
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Title</h3>
              <p>{data.title}</p>
            </div>
            <div>
              <h3 className="font-semibold">Description</h3>
              <p>{data.description}</p>
            </div>
            <div>
              <h3 className="font-semibold">Image</h3>
              <img
                src={data.image}
                alt="Category"
                className="mt-2 max-w-full h-auto"
              />
            </div>
            <div>
              <h3 className="font-semibold">Features</h3>
              <ul className="list-disc list-inside">
                {data.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Category Info
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main RentalManagement component
export default function RentalManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "members" | "non_members" | "category"
  >("members");
  const [editingItem, setEditingItem] = useState<RentalItem | null>(null);

  const {
    data: rentals,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rentals"],
    queryFn: fetchRentals,
  });

  const form = useForm<RentalItem>({
    resolver: zodResolver(RentalItemSchema),
    defaultValues: editingItem || {
      vessel_name: "",
      length: "",
      weekday: "",
      weekend: "",
      half_day: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateRental,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      toast.success("Rental updated successfully");
    },
    onError: () => {
      toast.error("Failed to update rental");
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  const handleUpdate = (updatedData: Partial<RentalData>) => {
    updateMutation.mutate({ id: rentals?.[0].id, ...updatedData });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Rental Management</h1>
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "members" | "non_members" | "category")
        }
      >
        <TabsList className="mb-4">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="non_members">Non-Members</TabsTrigger>
          <TabsTrigger value="category">Category Info</TabsTrigger>
        </TabsList>
        <TabsContent value="members">
          <RentalList
            data={rentals?.[0].members}
            title1={rentals?.[0].title}
            description1={rentals?.[0].description}
            type="members"
            onUpdate={handleUpdate}
            form={form}
            editingItem={editingItem}
            setEditingItem={setEditingItem}
          />
        </TabsContent>
        <TabsContent value="non_members">
          <RentalList
            data={rentals?.[0].non_members}
            type="non_members"
            onUpdate={handleUpdate}
            editingItem={editingItem}
            setEditingItem={setEditingItem}
            form={form}
          />
        </TabsContent>
        <TabsContent value="category">
          <CategoryInfoForm
            data={rentals?.[0].category_info}
            onUpdate={handleUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useForm, useFieldArray } from "react-hook-form";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
// } from "@/components/ui/form";
// import { toast } from "sonner";
// import { uploadImage } from "@/services/about-services";
// import { PlusCircle, Pencil, Trash2 } from "lucide-react";

// // API functions
// async function fetchRentals() {
//   const response = await fetch("/api/rentals");
//   if (!response.ok) {
//     throw new Error("Network response was not ok");
//   }
//   return response.json();
// }

// async function updateRental(data: Partial<RentalData>) {
//   const response = await fetch(`/api/rentals/${data.id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });
//   if (!response.ok) {
//     throw new Error("Network response was not ok");
//   }
//   return response.json();
// }

// // Types
// interface RentalItem {
//   id?: string;
//   vessel_name: string;
//   length: string;
//   weekday: string;
//   weekend: string;
//   half_day: string;
// }

// interface CategoryInfo {
//   title: string;
//   description: string;
//   image: string;
//   features: string[];
// }

// interface RentalData {
//   id: string;
//   members: RentalItem[];
//   non_members: RentalItem[];
//   category_info: CategoryInfo;
// }

// // RentalForm component
// function

// RentalForm({ onSubmit, initialData, onCancel }) {
//   const form = useForm<RentalItem>({
//     defaultValues: initialData || {
//       vessel_name: "",
//       length: "",
//       weekday: "",
//       weekend: "",
//       half_day: "",
//     },
//   });

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//         <FormField
//           control={form.control}
//           name="vessel_name"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Vessel Name</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="length"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Length</FormLabel>
//               <FormControl>
//                 <Input {...field} type="number" />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="weekday"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Weekday Rate</FormLabel>
//               <FormControl>
//                 <Input {...field} type="number" />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="weekend"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Weekend Rate</FormLabel>
//               <FormControl>
//                 <Input {...field} type="number" />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="half_day"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Half Day Rate</FormLabel>
//               <FormControl>
//                 <Input {...field} type="number" />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <div className="flex justify-end space-x-2">
//           <Button type="button" variant="outline" onClick={onCancel}>
//             Cancel
//           </Button>
//           <Button type="submit">Save</Button>
//         </div>
//       </form>
//     </Form>
//   );
// }

// // RentalList component
// function RentalList({ data, type, onUpdate }) {
//   const [showForm, setShowForm] = useState(false);
//   const [editingItem, setEditingItem] = useState<RentalItem | null>(null);

//   const handleEdit = (item: RentalItem) => {
//     setEditingItem(item);
//     setShowForm(true);
//   };

//   const handleDelete = (item: RentalItem) => {
//     const updatedData = data.filter((rentalItem) => rentalItem.id !== item.id);
//     onUpdate({ [type]: updatedData });
//   };

//   const handleFormSubmit = (formData: RentalItem) => {
//     let updatedData;
//     if (editingItem) {
//       updatedData = data.map((item) =>
//         item.id === editingItem.id ? { ...formData, id: item.id } : item
//       );
//     } else {
//       updatedData = [...data, { ...formData, id: Date.now().toString() }];
//     }
//     onUpdate({ [type]: updatedData });
//     setShowForm(false);
//     setEditingItem(null);
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>
//           {type === "members" ? "Members" : "Non-Members"} Rental Data
//         </CardTitle>
//         <Button
//           onClick={() => {
//             setShowForm(true);
//             setEditingItem(null);
//           }}
//           className="mt-2"
//         >
//           <PlusCircle className="mr-2 h-4 w-4" />
//           Add New {type === "members" ? "Member" : "Non-Member"}
//         </Button>
//       </CardHeader>
//       <CardContent>
//         {showForm ? (
//           <RentalForm
//             onSubmit={handleFormSubmit}
//             initialData={editingItem}
//             onCancel={() => {
//               setShowForm(false);
//               setEditingItem(null);
//             }}
//           />
//         ) : (
//           <ScrollArea className="h-[400px] w-full">
//             <div className="space-y-2">
//               {data.map((item) => (
//                 <Card key={item.id} className="p-4">
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <h3 className="font-semibold">{item.vessel_name}</h3>
//                       <p className="text-sm text-gray-500">{item.length}ft</p>
//                     </div>
//                     <div className="space-x-2">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleEdit(item)}
//                       >
//                         <Pencil className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="destructive"
//                         onClick={() => handleDelete(item)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                   <div className="mt-2 text-sm">
//                     <p>Weekday: ${item.weekday}</p>
//                     <p>Weekend: ${item.weekend}</p>
//                     <p>Half Day: ${item.half_day}</p>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           </ScrollArea>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// // CategoryInfoForm component
// function CategoryInfoForm({ data, onUpdate }) {
//   const [isEditing, setIsEditing] = useState(false);
//   const form = useForm<CategoryInfo>({
//     defaultValues: data,
//   });

//   const { fields, append, remove } = useFieldArray({
//     control: form.control,
//     name: "features",
//   });

//   const handleImageUpload = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     try {
//       const uploadedUrl = await uploadImage(file, "about-images");
//       form.setValue("image", uploadedUrl);
//       toast.success("Image uploaded successfully");
//     } catch (error) {
//       toast.error("Error uploading image. Please try again.");
//     }
//   };

//   const onSubmit = (formData: CategoryInfo) => {
//     onUpdate({ category_info: formData });
//     setIsEditing(false);
//   };

//   const resetForm = () => {
//     form.reset(data);
//     setIsEditing(false);
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Category Information</CardTitle>
//         <CardDescription>
//           Manage general information about the rental category
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         {isEditing ? (
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               <FormField
//                 control={form.control}
//                 name="title"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Title</FormLabel>
//                     <FormControl>
//                       <Input {...field} />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Description</FormLabel>
//                     <FormControl>
//                       <Textarea {...field} />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="image"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Image</FormLabel>
//                     <FormControl>
//                       <div className="flex items-center space-x-2">
//                         <Input {...field} readOnly />
//                         <Input
//                           type="file"
//                           onChange={handleImageUpload}
//                           accept="image/*"
//                         />
//                       </div>
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />
//               <div>
//                 <Label>Features</Label>
//                 {fields.map((feature, index) => (
//                   <FormField
//                     key={feature.id}
//                     control={form.control}
//                     name={`features.${index}`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormControl>
//                           <div className="flex items-center space-x-2 mb-2">
//                             <Input {...field} />
//                             <Button
//                               type="button"
//                               variant="outline"
//                               size="sm"
//                               onClick={() => remove(index)}
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 ))}
//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="sm"
//                   onClick={() => append("")}
//                 >
//                   <PlusCircle className="mr-2 h-4 w-4" />
//                   Add Feature
//                 </Button>
//               </div>
//               <div className="flex justify-end space-x-2">
//                 <Button type="button" variant="outline" onClick={resetForm}>
//                   Cancel
//                 </Button>
//                 <Button type="submit">Save Changes</Button>
//               </div>
//             </form>
//           </Form>
//         ) : (
//           <div className="space-y-4">
//             <div>
//               <h3 className="font-semibold">Title</h3>
//               <p>{data.title}</p>
//             </div>
//             <div>
//               <h3 className="font-semibold">Description</h3>
//               <p>{data.description}</p>
//             </div>
//             <div>
//               <h3 className="font-semibold">Image</h3>
//               <img
//                 src={data.image}
//                 alt="Category"
//                 className="mt-2 max-w-full h-auto"
//               />
//             </div>
//             <div>
//               <h3 className="font-semibold">Features</h3>
//               <ul className="list-disc list-inside">
//                 {data.features.map((feature, index) => (
//                   <li key={index}>{feature}</li>
//                 ))}
//               </ul>
//             </div>
//             <Button onClick={() => setIsEditing(true)}>
//               <Pencil className="mr-2 h-4 w-4" />
//               Edit Category Info
//             </Button>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// // Main RentalManagement component
// export default function RentalManagement() {
//   const queryClient = useQueryClient();
//   const [activeTab, setActiveTab] = useState<
//     "members" | "non_members" | "category"
//   >("members");

//   const {
//     data: rentals,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["rentals"],
//     queryFn: fetchRentals,
//   });

//   const updateMutation = useMutation({
//     mutationFn: updateRental,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["rentals"] });
//       toast.success("Rental updated successfully");
//     },
//     onError: () => {
//       toast.error("Failed to update rental");
//     },
//   });

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>An error occurred: {error.message}</div>;

//   const handleUpdate = (updatedData: Partial<RentalData>) => {
//     updateMutation.mutate({ id: rentals[0].id, ...updatedData });
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6">Rental Management</h1>
//       <Tabs
//         value={activeTab}
//         onValueChange={(value) =>
//           setActiveTab(value as "members" | "non_members" | "category")
//         }
//       >
//         <TabsList className="mb-4">
//           <TabsTrigger value="members">Members</TabsTrigger>
//           <TabsTrigger value="non_members">Non-Members</TabsTrigger>
//           <TabsTrigger value="category">Category Info</TabsTrigger>
//         </TabsList>
//         <TabsContent value="members">
//           <RentalList
//             data={rentals[0].members}
//             type="members"
//             onUpdate={handleUpdate}
//           />
//         </TabsContent>
//         <TabsContent value="non_members">
//           <RentalList
//             data={rentals[0].non_members}
//             type="non_members"
//             onUpdate={handleUpdate}
//           />
//         </TabsContent>
//         <TabsContent value="category">
//           <CategoryInfoForm
//             data={rentals[0].category_info}
//             onUpdate={handleUpdate}
//           />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useForm, useFieldArray } from "react-hook-form";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
// } from "@/components/ui/form";
// import { toast } from "sonner";
// import { uploadImage } from "@/services/about-services";

// // API functions
// async function fetchRentals() {
//   const response = await fetch("/api/rentals");
//   if (!response.ok) {
//     throw new Error("Network response was not ok");
//   }
//   return response.json();
// }

// async function updateRental(data: Partial<RentalData>) {
//   const response = await fetch(`/api/rentals/${data.id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });
//   if (!response.ok) {
//     throw new Error("Network response was not ok");
//   }
//   return response.json();
// }

// // Types
// interface RentalItem {
//   vessel_name: string;
//   length: string;
//   weekday: string;
//   weekend: string;
//   half_day: string;
// }

// interface CategoryInfo {
//   title: string;
//   description: string;
//   image: string;
//   features: string[];
// }

// interface RentalData {
//   id: string;
//   members: RentalItem[];
//   non_members: RentalItem[];
//   category_info: CategoryInfo;
// }

// // RentalForm component
// function RentalForm({ onSubmit, initialData, onCancel }) {
//   const form = useForm<RentalItem>({
//     defaultValues: initialData || {
//       vessel_name: "",
//       length: "",
//       weekday: "",
//       weekend: "",
//       half_day: "",
//     },
//   });

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//         <FormField
//           control={form.control}
//           name="vessel_name"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Vessel Name</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="length"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Length</FormLabel>
//               <FormControl>
//                 <Input {...field} type="number" />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="weekday"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Weekday Rate</FormLabel>
//               <FormControl>
//                 <Input {...field} type="number" />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="weekend"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Weekend Rate</FormLabel>
//               <FormControl>
//                 <Input {...field} type="number" />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="half_day"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Half Day Rate</FormLabel>
//               <FormControl>
//                 <Input {...field} type="number" />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <div className="flex justify-end space-x-2">
//           <Button type="button" variant="outline" onClick={onCancel}>
//             Cancel
//           </Button>
//           <Button type="submit">Save</Button>
//         </div>
//       </form>
//     </Form>
//   );
// }

// // RentalList component
// function RentalList({ data, type, onUpdate }) {
//   const [showForm, setShowForm] = useState(false);
//   const [editingItem, setEditingItem] = useState<RentalItem | null>(null);

//   const handleEdit = (item: RentalItem) => {
//     setEditingItem(item);
//     setShowForm(true);
//   };

//   const handleDelete = (item: RentalItem) => {
//     const updatedData = data.filter((rentalItem) => rentalItem !== item);
//     onUpdate({ [type]: updatedData });
//   };

//   const handleFormSubmit = (formData: RentalItem) => {
//     let updatedData;
//     if (editingItem) {
//       updatedData = data.map((item) =>
//         item === editingItem ? formData : item
//       );
//     } else {
//       updatedData = [...data, formData];
//     }
//     onUpdate({ [type]: updatedData });
//     setShowForm(false);
//     setEditingItem(null);
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>
//           {type === "members" ? "Members" : "Non-Members"} Rental Data
//         </CardTitle>
//         <Button
//           onClick={() => {
//             setShowForm(true);
//             setEditingItem(null);
//           }}
//         >
//           Add New {type === "members" ? "Member" : "Non-Member"}
//         </Button>
//       </CardHeader>
//       <CardContent>
//         {showForm ? (
//           <RentalForm
//             onSubmit={handleFormSubmit}
//             initialData={editingItem}
//             onCancel={() => setShowForm(false)}
//           />
//         ) : (
//           <ScrollArea className="h-[400px]">
//             <ul className="space-y-2">
//               {data.map((item, index) => (
//                 <li
//                   key={index}
//                   className="flex justify-between items-center p-2 border rounded"
//                 >
//                   <span>
//                     {item.vessel_name} - {item.length}ft
//                   </span>
//                   <div className="space-x-2">
//                     <Button onClick={() => handleEdit(item)}>Edit</Button>
//                     <Button
//                       variant="destructive"
//                       onClick={() => handleDelete(item)}
//                     >
//                       Delete
//                     </Button>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </ScrollArea>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// // CategoryInfoForm component
// function CategoryInfoForm({ data, onUpdate }) {
//   const form = useForm<CategoryInfo>({
//     defaultValues: data,
//   });

//   const { fields, append, remove } = useFieldArray({
//     control: form.control,
//     name: "features",
//   });

//   const handleImageUpload = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     try {
//       const uploadedUrl = await uploadImage(file, "about-images");
//       form.setValue("image", uploadedUrl);
//       toast.success("Image uploaded successfully");
//     } catch (error) {
//       toast.error("Error uploading image. Please try again.");
//     }
//   };

//   const onSubmit = (formData: CategoryInfo) => {
//     onUpdate({ category_info: formData });
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Category Information</CardTitle>
//         <CardDescription>
//           Manage general information about the rental category
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="title"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Title</FormLabel>
//                   <FormControl>
//                     <Input {...field} />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl>
//                     <Textarea {...field} />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="image"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Image</FormLabel>
//                   <FormControl>
//                     <div className="flex items-center space-x-2">
//                       <Input {...field} readOnly />
//                       <Input
//                         type="file"
//                         onChange={handleImageUpload}
//                         accept="image/*"
//                       />
//                     </div>
//                   </FormControl>
//                 </FormItem>
//               )}
//             />
//             <div>
//               <Label>Features</Label>
//               {fields.map((feature, index) => (
//                 <FormField
//                   key={feature.id}
//                   control={form.control}
//                   name={`features.${index}`}
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormControl>
//                         <div className="flex items-center space-x-2 mb-2">
//                           <Input {...field} />
//                           <Button type="button" onClick={() => remove(index)}>
//                             Remove
//                           </Button>
//                         </div>
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />
//               ))}
//               <Button type="button" onClick={() => append("")}>
//                 Add Feature
//               </Button>
//             </div>
//             <Button type="submit">Save Changes</Button>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   );
// }

// // Main RentalManagement component
// export default function RentalManagement() {
//   const queryClient = useQueryClient();
//   const [activeTab, setActiveTab] = useState<
//     "members" | "non_members" | "category"
//   >("members");

//   const {
//     data: rentals,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["rentals"],
//     queryFn: fetchRentals,
//   });

//   const updateMutation = useMutation({
//     mutationFn: updateRental,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["rentals"] });
//       toast.success("Rental updated successfully");
//     },
//     onError: () => {
//       toast.error("Failed to update rental");
//     },
//   });

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>An error occurred: {error.message}</div>;

//   const handleUpdate = (updatedData: Partial<RentalData>) => {
//     updateMutation.mutate({ id: rentals[0].id, ...updatedData });
//   };

//   return (
//     <Tabs
//       value={activeTab}
//       onValueChange={(value) =>
//         setActiveTab(value as "members" | "non_members" | "category")
//       }
//     >
//       <TabsList>
//         <TabsTrigger value="members">Members</TabsTrigger>
//         <TabsTrigger value="non_members">Non-Members</TabsTrigger>
//         <TabsTrigger value="category">Category Info</TabsTrigger>
//       </TabsList>
//       <TabsContent value="members">
//         <RentalList
//           data={rentals[0].members}
//           type="members"
//           onUpdate={handleUpdate}
//         />
//       </TabsContent>
//       <TabsContent value="non_members">
//         <RentalList
//           data={rentals[0].non_members}
//           type="non_members"
//           onUpdate={handleUpdate}
//         />
//       </TabsContent>
//       <TabsContent value="category">
//         <CategoryInfoForm
//           data={rentals[0].category_info}
//           onUpdate={handleUpdate}
//         />
//       </TabsContent>
//     </Tabs>
//   );
// }

// "use client";

// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useForm, useFieldArray } from "react-hook-form";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
//   Form,
// } from "@/components/ui/form";
// import { CategoryInfo, RentalData } from "@/schemas/rental-schema";
// import { toast } from "sonner";
// import { uploadImage } from "@/services/about-services";
// import { BASE_API_URL } from "@/types/benefit-types";

// const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;

// async function fetchRentals() {
//   const response = await fetch("/api/rentals");
//   if (!response.ok) {
//     throw new Error("Network response was not ok");
//   }
//   return response.json();
// }

// async function updateRental(data: Partial<RentalData>) {
//   console.log("request is here", data);
//   const response = await fetch(`${BASE_API_URL}/rentals/${data.id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });
//   if (!response.ok) {
//     throw new Error("Network response was not ok");
//   }
//   return response.json();
// }

// function RentalTable({
//   data,
//   type,
//   onUpdate,
// }: {
//   data: Record<string, any>[];
//   type: "members" | "non_members";
//   onUpdate: (updatedData: Record<string, any>[]) => void;
// }) {
//   const form = useForm({
//     defaultValues: { items: data },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control: form.control,
//     name: "items",
//   });

//   const onSubmit = (formData: { items: Record<string, any>[] }) => {
//     onUpdate(formData.items);
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>
//           {type === "members" ? "Members" : "Non-Members"} Rental Data
//         </CardTitle>
//         <CardDescription>Manage rental information for {type}</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)}>
//             <ScrollArea className="h-[400px]">
//               <div className="space-y-4">
//                 {fields.map((item, index) => (
//                   <div key={item.id} className="p-4 border rounded">
//                     <FormField
//                       control={form.control}
//                       name={`items.${index}.vessel_name`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Vessel Name</FormLabel>
//                           <FormControl>
//                             <Input {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name={`items.${index}.length`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Length</FormLabel>
//                           <FormControl>
//                             <Input {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name={`items.${index}.weekday`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Weekday Rate</FormLabel>
//                           <FormControl>
//                             <Input {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name={`items.${index}.weekend`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Weekend Rate</FormLabel>
//                           <FormControl>
//                             <Input {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name={`items.${index}.half_day`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Half Day Rate</FormLabel>
//                           <FormControl>
//                             <Input {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <Button
//                       type="button"
//                       variant="destructive"
//                       onClick={() => remove(index)}
//                       className="mt-2"
//                     >
//                       Delete
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             </ScrollArea>
//             <Button
//               type="button"
//               onClick={() =>
//                 append({
//                   vessel_name: "",
//                   length: "",
//                   weekday: "",
//                   weekend: "",
//                   half_day: "",
//                 })
//               }
//               className="mt-4"
//             >
//               Add New Item
//             </Button>
//             <Button type="submit" className="mt-4 ml-2">
//               Save Changes
//             </Button>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   );
// }

// function CategoryInfoForm({
//   data,
//   onUpdate,
//   onImageUpload,
//   uploadingImage,
// }: {
//   data: CategoryInfo;
//   onUpdate: (updatedData: CategoryInfo) => void;
//   onImageUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
//   uploadingImage: boolean;
// }) {
//   const form = useForm<CategoryInfo>({
//     defaultValues: data,
//   });

//   const { fields, append, remove } = useFieldArray({
//     control: form.control,
//     name: "features",
//   });

//   const handleImageUpload = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file) {
//       console.log("⚠️ No file selected. Exiting upload process.");
//       return;
//     }

//     console.log("📂 File selected for upload:", file.name);

//     // setUploadingImage(true);
//     try {
//       const uploadedUrl = await uploadImage(file, "about-images");
//       console.log(
//         "🚀 ~ file: page.tsx ~ line 292 ~ handleImageUpload ~ uploadedUrl",
//         uploadedUrl
//       );
//       toast.success("Image uploaded successfully");

//       // updateMutation.mutate({
//       //   id: rentals[0].id,
//       //   category_info: { ...rentals[0].category_info, image: uploadedUrl },
//       // });
//       form.setValue("image", uploadedUrl);
//       toast.success("🎉 Image uploaded successfully!");
//     } catch (error) {
//       console.error("❌ Error uploading image:", error);
//       toast.error("Error uploading image. Please try again.");
//     } finally {
//       // setUploadingImage(false);
//       console.log("🏁 Upload process completed.");
//     }
//   };

//   form.watch();
//   const onSubmit = (formData: CategoryInfo) => {
//     console.log(
//       "🚀 ~ file: page.tsx ~ line 202 ~ onSubmit ~ formData",
//       formData
//     );
//     onUpdate(formData);
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Category Information</CardTitle>
//         <CardDescription>
//           Manage general information about the rental category
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)}>
//             <div className="space-y-4">
//               <FormField
//                 control={form.control}
//                 name="title"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Title</FormLabel>
//                     <FormControl>
//                       <Input {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Description</FormLabel>
//                     <FormControl>
//                       <Textarea {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <div>
//                 <FormLabel>Image</FormLabel>
//                 <div className="flex items-center space-x-2">
//                   <FormField
//                     control={form.control}
//                     name="image"
//                     render={({ field }) => (
//                       <FormItem className="flex-grow">
//                         <FormControl>
//                           <Input {...field} readOnly />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <Input
//                     type="file"
//                     onChange={handleImageUpload}
//                     disabled={uploadingImage}
//                     accept="image/*"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <Label>Features</Label>
//                 {fields.map((feature, index) => (
//                   <FormField
//                     key={feature.id}
//                     control={form.control}
//                     name={`features.${index}`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormControl>
//                           <div className="flex items-center space-x-2 mb-2">
//                             <Input {...field} />
//                             <Button type="button" onClick={() => remove(index)}>
//                               Remove
//                             </Button>
//                           </div>
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 ))}
//                 <Button type="button" onClick={() => append("")}>
//                   Add Feature
//                 </Button>
//               </div>
//             </div>
//             <Button type="submit" className="mt-4">
//               Save Changes
//             </Button>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   );
// }

// export default function RentalManagement() {
//   const queryClient = useQueryClient();
//   const [activeTab, setActiveTab] = useState<
//     "members" | "non_members" | "category"
//   >("members");
//   const [uploadingImage, setUploadingImage] = useState(false);

//   const {
//     data: rentals,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["rentals"],
//     queryFn: fetchRentals,
//   });

//   const updateMutation = useMutation({
//     mutationFn: updateRental,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["rentals"] });
//       toast.success("Rental updated successfully");
//     },
//     onError: () => {
//       toast.error("Failed to update rental");
//     },
//   });

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>An error occurred: {error.message}</div>;

//   return (
//     <Tabs
//       value={activeTab}
//       onValueChange={(value) =>
//         setActiveTab(value as "members" | "non_members" | "category")
//       }
//     >
//       <TabsList>
//         <TabsTrigger value="members">Members</TabsTrigger>
//         <TabsTrigger value="non_members">Non-Members</TabsTrigger>
//         <TabsTrigger value="category">Category Info</TabsTrigger>
//       </TabsList>
//       <TabsContent value="members">
//         <RentalTable
//           data={rentals[0].members}
//           type="members"
//           onUpdate={(updatedMembers) =>
//             updateMutation.mutate({
//               id: rentals[0].id,
//               members: updatedMembers,
//             })
//           }
//         />
//       </TabsContent>
//       <TabsContent value="non_members">
//         <RentalTable
//           data={rentals[0].non_members}
//           type="non_members"
//           onUpdate={(updatedNonMembers) =>
//             updateMutation.mutate({
//               id: rentals[0].id,
//               non_members: updatedNonMembers,
//             })
//           }
//         />
//       </TabsContent>
//       <TabsContent value="category">
//         <CategoryInfoForm
//           data={rentals[0].category_info}
//           onUpdate={(updatedCategoryInfo) =>
//             updateMutation.mutate({
//               id: rentals[0].id,
//               category_info: updatedCategoryInfo,
//             })
//           }
//           // onImageUpload={handleImageUpload}
//           uploadingImage={uploadingImage}
//         />
//       </TabsContent>
//     </Tabs>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Rental } from "@/services/rental-services";

// export default function RentalManagement() {
//   const [rental, setRental] = useState<Rental | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     fetchRentals();
//   }, []);

//   const fetchRentals = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch("http://localhost:3000/api/rentals");
//       const data = await response.json();

//       setRental(data);
//     } catch (error) {
//       console.error("Error fetching rentals:", error);
//     }
//     setIsLoading(false);
//   };

//   const handleUpdate = async (type: "members" | "non_members") => {
//     if (!rental) return;

//     try {
//       const response = await fetch("/api/rentals", {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           ...rental,
//           [type]: rental[type],
//         }),
//       });

//       if (response.ok) {
//         console.log(`${type} updated successfully`);
//         fetchRentals(); // Refresh data after update
//       } else {
//         console.error(`Failed to update ${type}`);
//       }
//     } catch (error) {
//       console.error(`Error updating ${type}:`, error);
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       const response = await fetch("/api/rentals", {
//         method: "DELETE",
//       });

//       if (response.ok) {
//         console.log("Rentals deleted successfully");
//         setRental(null);
//       } else {
//         console.error("Failed to delete rentals");
//       }
//     } catch (error) {
//       console.error("Error deleting rentals:", error);
//     }
//   };

//   const handleInputChange = (
//     type: "members" | "non_members",
//     index: number,
//     field: string,
//     value: string
//   ) => {
//     if (!rental) return;

//     setRental((prev) => {
//       if (!prev) return prev;
//       const updatedData = [...prev[type]];
//       updatedData[index] = {
//         ...updatedData[index],
//         json: {
//           ...updatedData[index].json,
//           [field]: value,
//         },
//       };
//       return { ...prev, [type]: updatedData };
//     });
//   };

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (!rental) {
//     return <div>No rental data available</div>;
//   }

//   return (
//     <Tabs defaultValue="members" className="w-full">
//       <TabsList>
//         <TabsTrigger value="members">Members</TabsTrigger>
//         <TabsTrigger value="non_members">Non-Members</TabsTrigger>
//       </TabsList>
//       <TabsContent value="members">
//         <RentalTable
//           data={rental.members}
//           type="members"
//           onUpdate={() => handleUpdate("members")}
//           onChange={handleInputChange}
//         />
//       </TabsContent>
//       <TabsContent value="non_members">
//         <RentalTable
//           data={rental.non_members}
//           type="non_members"
//           onUpdate={() => handleUpdate("non_members")}
//           onChange={handleInputChange}
//         />
//       </TabsContent>
//       <Button onClick={handleDelete} variant="destructive" className="mt-4">
//         Delete All Rentals
//       </Button>
//     </Tabs>
//   );
// }

// function RentalTable({
//   data,
//   type,
//   onUpdate,
//   onChange,
// }: {
//   data: any[];
//   type: "members" | "non_members";
//   onUpdate: () => void;
//   onChange: (
//     type: "members" | "non_members",
//     index: number,
//     field: string,
//     value: string
//   ) => void;
// }) {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>
//           {type === "members" ? "Members" : "Non-Members"} Rental Data
//         </CardTitle>
//         <CardDescription>Update rental information for {type}</CardDescription>
//       </CardHeader>
//       <CardContent>
//         {data &&
//           data?.map((item, index) => (
//             <div key={index} className="mb-4 p-4 border rounded">
//               <Label>Vessel Name</Label>
//               <Input
//                 value={item?.json?.vessel_name}
//                 onChange={(e) =>
//                   onChange(type, index, "vessel_name", e.target.value)
//                 }
//               />
//               <Label>Length</Label>
//               <Input
//                 value={item?.json?.length}
//                 onChange={(e) =>
//                   onChange(type, index, "length", e.target.value)
//                 }
//               />
//               <Label>Weekday</Label>
//               <Input
//                 value={item?.json?.weekday}
//                 onChange={(e) =>
//                   onChange(type, index, "weekday", e.target.value)
//                 }
//               />
//               <Label>Weekend</Label>
//               <Input
//                 value={item?.json?.weekend}
//                 onChange={(e) =>
//                   onChange(type, index, "weekend", e.target.value)
//                 }
//               />
//               <Label>Half Day</Label>
//               <Input
//                 value={item?.json?.half_day}
//                 onChange={(e) =>
//                   onChange(type, index, "half_day", e.target.value)
//                 }
//               />
//             </div>
//           ))}
//       </CardContent>
//       <CardFooter>
//         <Button onClick={onUpdate}>Update {type}</Button>
//       </CardFooter>
//     </Card>
//   );
// }

// "use client";

// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { RentalPage } from "@/services/rental-services";
// import { Feature } from "@/services/feature-services";
// import { BASE_API_URL } from "@/types/benefit-types";

// async function fetchRentalPages(): Promise<RentalPage[]> {
//   const response = await fetch(`${BASE_API_URL}/rentals`);
//   if (!response.ok) {
//     throw new Error("Failed to fetch rental pages");
//   }
//   return response.json();
// }

// async function fetchFeatures(): Promise<Feature[]> {
//   try {
//     const response = await fetch(`${BASE_API_URL}/features`);
//     if (!response.ok) {
//       throw new Error("Failed to fetch features");
//     }

//     const data = await response.json();
//     console.log(data);
//     return data;
//   } catch (error) {
//     console.error("Error fetching features:", error);
//     throw new Error("Failed to fetch features");
//   }
// }

// async function createRentalPage(
//   page: Omit<RentalPage, "id" | "features">,
//   featureIds: number[]
// ): Promise<RentalPage> {
//   const response = await fetch("/api/rental-pages", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ page, featureIds }),
//   });
//   if (!response.ok) {
//     throw new Error("Failed to create rental page");
//   }
//   return response.json();
// }

// async function updateRentalPage(
//   id: number,
//   page: Omit<RentalPage, "id" | "features">,
//   featureIds: number[]
// ): Promise<RentalPage> {
//   const response = await fetch("/api/rentals", {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ id, page, featureIds }),
//   });
//   if (!response.ok) {
//     throw new Error("Failed to update rental page");
//   }
//   return response.json();
// }

// async function deleteRentalPage(id: number): Promise<void> {
//   const response = await fetch("/api/rentals", {
//     method: "DELETE",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ id }),
//   });
//   if (!response.ok) {
//     throw new Error("Failed to delete rental page");
//   }
// }

// export default function RentalPagesPage() {
//   const queryClient = useQueryClient();
//   const [editingPage, setEditingPage] = useState<RentalPage | null>(null);
//   const [newPage, setNewPage] = useState<Omit<RentalPage, "id" | "features">>({
//     title: "",
//     description: "",
//     imageUrl: "",
//   });
//   const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);

//   // const {
//   //   data: rentalPages,
//   //   isLoading: isLoadingPages,
//   //   error: pagesError,
//   // } = useQuery<RentalPage[]>({
//   //   queryKey: ["rentalPages"],
//   //   queryFn: () => fetchRentalPages(),
//   // });

//   const {
//     data: features,
//     isLoading: isLoadingFeatures,
//     error: featuresError,
//   } = useQuery<Feature[]>({
//     queryKey: ["features"],
//     queryFn: () => fetchFeatures(),
//   });

//   const createMutation = useMutation({
//     mutationFn: ({
//       page,
//       featureIds,
//     }: {
//       page: Omit<RentalPage, "id" | "features">;
//       featureIds: number[];
//     }) => createRentalPage(page, featureIds),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["rentalPages"] });
//       setNewPage({ title: "", description: "", imageUrl: "" });
//       setSelectedFeatures([]);
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({
//       id,
//       page,
//       featureIds,
//     }: {
//       id: number;
//       page: Omit<RentalPage, "id" | "features">;
//       featureIds: number[];
//     }) => updateRentalPage(id, page, featureIds),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["rentalPages"] });
//       setEditingPage(null);
//       setSelectedFeatures([]);
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: deleteRentalPage,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["rentalPages"] });
//     },
//   });

//   // if (isLoadingPages || isLoadingFeatures) return <div>Loading...</div>;
//   // if (pagesError || featuresError)
//   //   return <div>Error: {((pagesError || featuresError) as Error).message}</div>;

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (editingPage) {
//       updateMutation.mutate({
//         id: editingPage.id,
//         page: newPage,
//         featureIds: selectedFeatures,
//       });
//     } else {
//       createMutation.mutate({ page: newPage, featureIds: selectedFeatures });
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Rental Pages</h1>
//       <form onSubmit={handleSubmit} className="mb-8">
//         <div className="mb-4">
//           <label htmlFor="title" className="block mb-2">
//             Title
//           </label>
//           <input
//             type="text"
//             id="title"
//             value={editingPage ? editingPage.title : newPage.title}
//             onChange={(e) =>
//               editingPage
//                 ? setEditingPage({ ...editingPage, title: e.target.value })
//                 : setNewPage({ ...newPage, title: e.target.value })
//             }
//             className="w-full px-3 py-2 border rounded"
//             required
//           />
//         </div>
//         <div className="mb-4">
//           <label htmlFor="description" className="block mb-2">
//             Description
//           </label>
//           <textarea
//             id="description"
//             value={editingPage ? editingPage.description : newPage.description}
//             onChange={(e) =>
//               editingPage
//                 ? setEditingPage({
//                     ...editingPage,
//                     description: e.target.value,
//                   })
//                 : setNewPage({ ...newPage, description: e.target.value })
//             }
//             className="w-full px-3 py-2 border rounded"
//             required
//           />
//         </div>
//         <div className="mb-4">
//           <label htmlFor="imageUrl" className="block mb-2">
//             Image URL
//           </label>
//           <input
//             type="text"
//             id="imageUrl"
//             value={editingPage ? editingPage.imageUrl || "" : newPage.imageUrl}
//             onChange={(e) =>
//               editingPage
//                 ? setEditingPage({ ...editingPage, imageUrl: e.target.value })
//                 : setNewPage({ ...newPage, imageUrl: e.target.value })
//             }
//             className="w-full px-3 py-2 border rounded"
//           />
//         </div>
//         <div className="mb-4">
//           <label className="block mb-2">Features</label>
//           {features?.map((feature) => (
//             <label key={feature.id} className="flex items-center mb-2">
//               <input
//                 type="checkbox"
//                 checked={selectedFeatures.includes(feature.id)}
//                 onChange={(e) => {
//                   if (e.target.checked) {
//                     setSelectedFeatures([...selectedFeatures, feature.id]);
//                   } else {
//                     setSelectedFeatures(
//                       selectedFeatures.filter((id) => id !== feature.id)
//                     );
//                   }
//                 }}
//                 className="mr-2"
//               />
//               {feature.name}
//             </label>
//           ))}
//         </div>
//         <button
//           type="submit"
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           {editingPage ? "Update Rental Page" : "Create Rental Page"}
//         </button>
//       </form>
//       {/* <h2 className="text-xl font-bold mb-4">Existing Rental Pages</h2>
//       <ul className="space-y-4">
//         {rentalPages?.map((page) => (
//           <li key={page.id} className="border p-4 rounded">
//             <h3 className="text-lg font-semibold">{page.title}</h3>
//             <p>{page.description}</p>
//             {page.imageUrl && (
//               <img
//                 src={page.imageUrl}
//                 alt={page.title}
//                 className="mt-2 max-w-xs"
//               />
//             )}
//             <div className="mt-2">
//               <strong>Features:</strong>{" "}
//               {page.features.map((f) => f.name).join(", ")}
//             </div>
//             <div className="mt-2">
//               <button
//                 onClick={() => {
//                   setEditingPage(page);
//                   setSelectedFeatures(page.features.map((f) => f.id));
//                 }}
//                 className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
//               >
//                 Edit
//               </button>
//               <button
//                 onClick={() => deleteMutation.mutate(page.id)}
//                 className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//               >
//                 Delete
//               </button>
//             </div>
//           </li>
//         ))}
//       </ul> */}
//     </div>
//   );
// }

// "use client";

// import React, { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase";
// import { PlusCircle, Ship, Anchor } from "lucide-react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";

// interface Vessel {
//   vesselName: string;
//   length: string;
//   halfDay: string;
//   weekday: string;
//   weekend: string;
// }

// interface Rental {
//   id: string;
//   members: Vessel[];
//   non_members: Vessel[];
// }

// export default function ManageRentals() {
//   const [rentals, setRentals] = useState<Rental[]>([]);
//   const [newMember, setNewMember] = useState<Vessel>({
//     vesselName: "",
//     length: "",
//     halfDay: "",
//     weekday: "",
//     weekend: "",
//   });
//   const [newNonMember, setNewNonMember] = useState<Vessel>({
//     vesselName: "",
//     length: "",
//     halfDay: "",
//     weekday: "",
//     weekend: "",
//   });

//   useEffect(() => {
//     const fetchRentals = async () => {
//       const { data, error } = await supabase.from("rentals").select("*");
//       if (error) console.error("Error fetching rentals:", error);
//       else setRentals(data as any);
//     };
//     fetchRentals();
//   }, []);

//   const handleAddMember = async () => {
//     // Check if any field is empty
//     if (Object.values(newMember).some((value) => !value)) {
//       toast.warning("Please fill all fields");
//       return;
//     }

//     const { data, error } = await supabase
//       .from("rentals")
//       .update({
//         members: [...rentals[0]?.members, newMember] as any,
//       })
//       .eq("id", rentals[0]?.id)
//       .select("*");

//     if (error) console.error("Error updating members:", error);
//     else setRentals((data as any) || []);

//     // Reset form
//     setNewMember({
//       vesselName: "",
//       length: "",
//       halfDay: "",
//       weekday: "",
//       weekend: "",
//     });
//   };

//   const handleAddNonMember = async () => {
//     if (Object.values(newNonMember).some((value) => !value)) {
//       toast.warning("Please fill all fields");
//       return;
//     }

//     const { data, error } = await supabase
//       .from("rentals")
//       .update({
//         non_members: [...rentals[0]?.non_members, newNonMember] as any,
//       })
//       .eq("id", rentals[0]?.id)
//       .select("*");

//     if (error) console.error("Error updating non-members:", error);
//     else setRentals((data as any) || []);

//     // Reset form
//     setNewNonMember({
//       vesselName: "",
//       length: "",
//       halfDay: "",
//       weekday: "",
//       weekend: "",
//     });
//   };

//   const RentalForm = ({
//     type,
//     state,
//     setState,
//     handleAdd,
//   }: {
//     type: string;
//     state: Vessel;
//     setState: React.Dispatch<React.SetStateAction<Vessel>>;
//     handleAdd: () => Promise<void>;
//   }) => (
//     <div className="grid gap-4">
//       <div className="grid gap-2">
//         <Label htmlFor={`${type}VesselName`}>Vessel Name</Label>
//         <Input
//           id={`${type}VesselName`}
//           value={state.vesselName}
//           onChange={(e) => setState({ ...state, vesselName: e.target.value })}
//           placeholder="Enter vessel name"
//         />
//       </div>
//       <div className="grid grid-cols-2 gap-4">
//         <div className="grid gap-2">
//           <Label htmlFor={`${type}Length`}>Length</Label>
//           <Input
//             id={`${type}Length`}
//             value={state.length}
//             onChange={(e) => setState({ ...state, length: e.target.value })}
//             placeholder="Length in feet"
//           />
//         </div>
//         <div className="grid gap-2">
//           <Label htmlFor={`${type}HalfDay`}>Half Day Rate</Label>
//           <Input
//             id={`${type}HalfDay`}
//             value={state.halfDay}
//             onChange={(e) => setState({ ...state, halfDay: e.target.value })}
//             placeholder="$"
//           />
//         </div>
//       </div>
//       <div className="grid grid-cols-2 gap-4">
//         <div className="grid gap-2">
//           <Label htmlFor={`${type}Weekday`}>Weekday Rate</Label>
//           <Input
//             id={`${type}Weekday`}
//             value={state.weekday}
//             onChange={(e) => setState({ ...state, weekday: e.target.value })}
//             placeholder="$"
//           />
//         </div>
//         <div className="grid gap-2">
//           <Label htmlFor={`${type}Weekend`}>Weekend Rate</Label>
//           <Input
//             id={`${type}Weekend`}
//             value={state.weekend}
//             onChange={(e) => setState({ ...state, weekend: e.target.value })}
//             placeholder="$"
//           />
//         </div>
//       </div>
//       <Button onClick={handleAdd} className="w-full">
//         <PlusCircle className="mr-2 h-4 w-4" />
//         Add {type}
//       </Button>
//     </div>
//   );

//   return (
//     <div className="container mx-auto p-6 max-w-4xl">
//       <div className="flex items-center space-x-2 mb-6">
//         <Anchor className="h-8 w-8" />
//         <h1 className="text-3xl font-bold">Rental Management</h1>
//       </div>

//       <Tabs defaultValue="members" className="space-y-4">
//         <TabsList className="grid w-full grid-cols-2">
//           <TabsTrigger value="members">Members</TabsTrigger>
//           <TabsTrigger value="nonMembers">Non-Members</TabsTrigger>
//         </TabsList>

//         <TabsContent value="members" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Add Member Rental</CardTitle>
//               <CardDescription>Add a new rental for members</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <RentalForm
//                 type="Member"
//                 state={newMember}
//                 setState={setNewMember}
//                 handleAdd={handleAddMember}
//               />
//             </CardContent>
//           </Card>

//           <div className="grid gap-6">
//             {rentals.map((rental) => (
//               <Card key={rental.id}>
//                 <CardHeader>
//                   <CardTitle className="flex items-center">
//                     <Ship className="mr-2 h-5 w-5" />
//                     Rental ID: {rental.id}
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <h4 className="font-semibold mb-2">Members:</h4>
//                   <div className="grid gap-4">
//                     {rental.members &&
//                       rental.members.map((member, index) => (
//                         <div key={index} className="p-4 border rounded-lg">
//                           <div className="grid grid-cols-2 gap-4">
//                             <div>
//                               <p className="text-sm font-medium">Vessel Name</p>
//                               <p className="text-sm text-gray-500">
//                                 {member.vesselName}
//                               </p>
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium">Length</p>
//                               <p className="text-sm text-gray-500">
//                                 {member.length} feet
//                               </p>
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium">Half Day</p>
//                               <p className="text-sm text-gray-500">
//                                 ${member.halfDay}
//                               </p>
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium">Weekday</p>
//                               <p className="text-sm text-gray-500">
//                                 ${member.weekday}
//                               </p>
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium">Weekend</p>
//                               <p className="text-sm text-gray-500">
//                                 ${member.weekend}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </TabsContent>

//         <TabsContent value="nonMembers" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Add Non-Member Rental</CardTitle>
//               <CardDescription>
//                 Add a new rental for non-members
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <RentalForm
//                 type="Non-Member"
//                 state={newNonMember}
//                 setState={setNewNonMember}
//                 handleAdd={handleAddNonMember}
//               />
//             </CardContent>
//           </Card>

//           <div className="grid gap-6">
//             {rentals.map((rental) => (
//               <Card key={rental.id}>
//                 <CardHeader>
//                   <CardTitle className="flex items-center">
//                     <Ship className="mr-2 h-5 w-5" />
//                     Rental ID: {rental.id}
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <h4 className="font-semibold mb-2">Non-Members:</h4>
//                   <div className="grid gap-4">
//                     {rental.non_members &&
//                       rental.non_members.map((nonMember, index) => (
//                         <div key={index} className="p-4 border rounded-lg">
//                           <div className="grid grid-cols-2 gap-4">
//                             <div>
//                               <p className="text-sm font-medium">Vessel Name</p>
//                               <p className="text-sm text-gray-500">
//                                 {nonMember.vesselName}
//                               </p>
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium">Length</p>
//                               <p className="text-sm text-gray-500">
//                                 {nonMember.length} feet
//                               </p>
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium">Half Day</p>
//                               <p className="text-sm text-gray-500">
//                                 ${nonMember.halfDay}
//                               </p>
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium">Weekday</p>
//                               <p className="text-sm text-gray-500">
//                                 ${nonMember.weekday}
//                               </p>
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium">Weekend</p>
//                               <p className="text-sm text-gray-500">
//                                 ${nonMember.weekend}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

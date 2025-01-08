"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
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
import { PlusCircle, Pencil, Trash2, Plus, X } from "lucide-react";
import { title } from "process";
import { BASE_API_URL } from "@/types/benefit-types";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

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
  features: z.array(z.any()),
});

type CategoryInfo = z.infer<typeof CategoryInfoSchema>;
interface CategoryInfoFormProps {
  data: CategoryInfo;
  onUpdate: (data: Partial<CategoryInfo>) => void;
}

const RentalDataSchema = z.object({
  id: z.string(),
  members: z.array(RentalItemSchema),
  non_members: z.array(RentalItemSchema),
  category_info: CategoryInfoSchema,
  title: z.string(),
  description: z.string(),
});

type RentalItem = z.infer<typeof RentalItemSchema>;
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
  const response = await fetch(`${BASE_API_URL}/rentals/${data.id}`, {
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
  const [isEditingTitleDesc, setIsEditingTitleDesc] = useState(false);

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
  const [title, setTitle] = useState<string>(title1);
  const [description, setDescription] = useState<string>(description1);
  const [isEditingTitleDesc, setIsEditingTitleDesc] = useState(false);

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

  const handleTitleDescSave = (newTitle: string, newDescription: string) => {
    setTitle(newTitle);
    setDescription(newDescription);
    onUpdate({ title: newTitle, description: newDescription });
    setIsEditingTitleDesc(false);
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

        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-4">
            {!isEditingTitleDesc ? (
              <>
                <h2 className="text-xl font-bold">{title}</h2>
                <p>{description}</p>
                <Button onClick={() => setIsEditingTitleDesc(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Title and Description
                </Button>
              </>
            ) : (
              <TitleDescriptionEditor
                initialTitle={title}
                initialDescription={description}
                onSave={handleTitleDescSave}
                onCancel={() => setIsEditingTitleDesc(false)}
              />
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

// // CategoryInfoForm component
// function CategoryInfoForm({ data, onUpdate }: any) {
//   const [isEditing, setIsEditing] = useState(false);
//   const form = useForm<CategoryInfo>({
//     resolver: zodResolver(CategoryInfoSchema),
//     defaultValues: data,
//   });

//   const onSubmit = (formData: CategoryInfo) => {
//     onUpdate({ category_info: formData });
//     setIsEditing(false);
//   };

//   const resetForm = () => {
//     console.log(data);
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
//                       <Input {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="image"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Image URL</FormLabel>
//                     <FormControl>
//                       <Input {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
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
//                 {data?.features?.map((feature: any, index: any) => (
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
            data={
              rentals?.[0]?.category_info || {
                title: "",
                description: "",
                image: "",
                features: [],
              }
            }
            onUpdate={(categoryInfo) =>
              handleUpdate({
                category_info: {
                  ...categoryInfo,
                  title: categoryInfo.title || "",
                  description: categoryInfo.description || "",
                  image: categoryInfo.image || "",
                  features: categoryInfo.features || [],
                },
              })
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface TitleDescriptionEditorProps {
  initialTitle: string;
  initialDescription: string;
  onSave: (title: string, description: string) => void;
  onCancel: () => void;
}

function TitleDescriptionEditor({
  initialTitle,
  initialDescription,
  onSave,
  onCancel,
}: TitleDescriptionEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  const handleSave = () => {
    onSave(title, description);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Edit Title and Description</h2>
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={4}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}

function CategoryInfoForm({ data, onUpdate }: CategoryInfoFormProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<CategoryInfo>({
    resolver: zodResolver(CategoryInfoSchema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      image: data?.image || "",
      features: data?.features || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features" as const,
  });

  const onSubmit = (formData: CategoryInfo) => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const resetForm = () => {
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
                      <Textarea {...field} rows={4} />
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
              <div>
                <FormLabel>Features</FormLabel>
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`features.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center space-x-2 mt-2">
                            <Input {...field} />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => remove(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => append("")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
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
              <Image
                src={data?.image || ""}
                alt="Category"
                width={100}
                height={100}
                className="mt-2 rounded-lg"
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
              Edit Category Info
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

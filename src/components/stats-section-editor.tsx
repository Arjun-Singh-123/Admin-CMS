"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getStats,
  createStat,
  updateStat,
  deleteStat,
  Stat,
} from "@/services/stats-services";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
const statSchema = z.object({
  id: z.number().optional(),
  emoji: z.string().emoji().min(1, "Emoji is required"),
  value: z.number().int().positive("Value must be a positive integer"),
  label: z.string().min(1, "Label is required"),
});

type StatFormData = z.infer<typeof statSchema>;

export default function StatsManager() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: () => getStats(),
  });

  const createMutation = useMutation({
    mutationFn: createStat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Stat created successfully");
      reset();
    },
    onError: (error) => {
      toast.error(`Failed to create stat: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateStat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Stat updated successfully");
      setEditingId(null);
      reset();
    },
    onError: (error) => {
      toast.error(`Failed to update stat: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Stat deleted successfully");
      setIsDeleteDialogOpen(false);
      reset();
    },

    onError: (error) => {
      toast.error(`Failed to delete stat: ${error.message}`);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<StatFormData>({
    resolver: zodResolver(statSchema),
    defaultValues: {
      emoji: "",
      value: 0,
      label: "",
    },
  });

  const onSubmit: SubmitHandler<StatFormData> = (data) => {
    if (editingId) {
      updateMutation.mutate({ ...data, id: editingId });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (stat: Stat) => {
    setEditingId(stat.id);
    setValue("emoji", stat.emoji);
    setValue("value", stat.value);
    setValue("label", stat.label);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this stat?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stats Manager</CardTitle>
        <CardDescription>Manage your stats here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-4">
          <div className="flex space-x-2">
            <Input
              {...register("emoji")}
              placeholder="Emoji"
              className="w-1/4"
            />
            <Input
              {...register("value", { valueAsNumber: true })}
              type="number"
              placeholder="Value"
              className="w-1/4"
            />
            <Input
              {...register("label")}
              placeholder="Label"
              className="w-1/2"
            />
          </div>
          {(errors.emoji || errors.value || errors.label) && (
            <p className="text-red-500 text-sm">
              {errors.emoji?.message ||
                errors.value?.message ||
                errors.label?.message}
            </p>
          )}
          <Button type="submit">
            {editingId ? "Update Stat" : "Add Stat"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
          )}
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Emoji</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats?.map((stat) => (
              <TableRow key={stat.id}>
                <TableCell>{stat?.emoji}</TableCell>
                <TableCell>{stat?.value}</TableCell>
                <TableCell>{stat?.label}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(stat)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {/* <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(stat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button> */}

                    <Dialog
                      open={isDeleteDialogOpen}
                      onOpenChange={setIsDeleteDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className=" h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Are you sure you want to delete?
                          </DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete the About section.
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
                            onClick={() => deleteMutation.mutate(stat.id)}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// "use client";

// import * as React from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useForm, SubmitHandler } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Trash2, Plus, Pencil, Save, X } from "lucide-react";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   getStats,
//   createStat,
//   updateStat,
//   deleteStat,
//   Stat,
// } from "@/services/stats-services";

// const statSchema = z.object({
//   id: z.number().optional(),
//   emoji: z.string().emoji().min(1, "Emoji is required"),
//   value: z.number().int().positive("Value must be a positive integer"),
//   label: z.string().min(1, "Label is required"),
// });

// export default function StatsManager() {
//   const queryClient = useQueryClient();
//   const [editingId, setEditingId] = React.useState<number | null>(null);

//   const { data: stats, isLoading } = useQuery({
//     queryKey: ["stats"],
//     queryFn: getStats,
//   });

//   const createMutation = useMutation({
//     mutationFn: createStat,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["stats"] });
//       toast.success("Stat created successfully");
//       reset({
//         emoji: "",
//         value: 0,
//         label: "",
//       });
//     },
//     onError: (error) => {
//       toast.error(`Failed to create stat: ${error.message}`);
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: updateStat,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["stats"] });
//       toast.success("Stat updated successfully");
//       setEditingId(null);
//     },
//     onError: (error) => {
//       toast.error(`Failed to update stat: ${error.message}`);
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: deleteStat,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["stats"] });
//       toast.success("Stat deleted successfully");
//     },
//     onError: (error) => {
//       toast.error(`Failed to delete stat: ${error.message}`);
//     },
//   });

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm<Stat>({
//     resolver: zodResolver(statSchema),
//     defaultValues: {
//       emoji: "",
//       value: 0,
//       label: "",
//     },
//   });

//   const onSubmit: SubmitHandler<Stat> = (data) => {
//     if (editingId) {
//       updateMutation.mutate({ ...data, id: editingId });
//     } else {
//       createMutation.mutate(data);
//     }
//   };

//   const handleEdit = (stat: Stat) => {
//     setEditingId(stat.id!);
//     reset(stat);
//   };

//   const handleCancelEdit = () => {
//     setEditingId(null);
//     reset();
//   };

//   const handleDelete = (id: number) => {
//     if (window.confirm("Are you sure you want to delete this stat?")) {
//       deleteMutation.mutate(id);
//     }
//   };

//   if (isLoading) return <div>Loading...</div>;

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Stats Manager</CardTitle>
//         <CardDescription>Manage your stats here.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-4">
//           <div className="flex space-x-2">
//             <Input
//               {...register("emoji")}
//               placeholder="Emoji"
//               className="w-1/4"
//             />
//             <Input
//               {...register("value", { valueAsNumber: true })}
//               type="number"
//               placeholder="Value"
//               className="w-1/4"
//             />
//             <Input
//               {...register("label")}
//               placeholder="Label"
//               className="w-1/2"
//             />
//           </div>
//           {(errors.emoji || errors.value || errors.label) && (
//             <p className="text-red-500 text-sm">
//               {errors.emoji?.message ||
//                 errors.value?.message ||
//                 errors.label?.message}
//             </p>
//           )}
//           <Button type="submit">
//             {editingId ? "Update Stat" : "Add Stat"}
//           </Button>
//           {editingId && (
//             <Button type="button" variant="outline" onClick={handleCancelEdit}>
//               Cancel
//             </Button>
//           )}
//         </form>

//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Emoji</TableHead>
//               <TableHead>Value</TableHead>
//               <TableHead>Label</TableHead>
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {stats?.map((stat) => (
//               <TableRow key={stat.id}>
//                 <TableCell>{stat.emoji}</TableCell>
//                 <TableCell>{stat.value}</TableCell>
//                 <TableCell>{stat.label}</TableCell>
//                 <TableCell>
//                   <div className="flex space-x-2">
//                     <Button
//                       variant="outline"
//                       size="icon"
//                       onClick={() => handleEdit(stat)}
//                     >
//                       <Pencil className="h-4 w-4" />
//                     </Button>
//                     <Button
//                       variant="destructive"
//                       size="icon"
//                       onClick={() => handleDelete(stat.id!)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   );
// }

// "use client";

// import * as React from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Trash2, Plus, Divide, Pencil, Pen, Save } from "lucide-react";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   getStats,
//   createStat,
//   updateStat,
//   deleteStat,
//   Stat,
// } from "@/services/stats-services";

// const statSchema = z.object({
//   id: z.number().optional(),
//   emoji: z.string().emoji().min(1),
//   value: z.number().int().positive(),
//   label: z.string().min(1),
// });

// const statsSchema = z.array(statSchema);

// export default function StatsManager() {
//   const queryClient = useQueryClient();
//   const [isEditing, setIsEditing] = React.useState(false);
//   const [editingId, setEditingId] = React.useState(null);
//   const [editedData, setEditedData] = React.useState(null);
//   const [statData, setStatData] = React.useState({
//     label: "",
//     value: "",
//     emoji: "",
//   });

//   const { data: stats, isLoading } = useQuery({
//     queryKey: ["stats"],
//     queryFn: getStats,
//   });

//   const createMutation = useMutation({
//     mutationFn: createStat,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["stats"] });
//       toast.success("Stat created successfully");
//     },
//     onError: (error) => {
//       toast.error(`Failed to create stat: ${error.message}`);
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: updateStat,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["stats"] });
//       toast.success("Stat updated successfully");
//     },
//     onError: (error) => {
//       toast.error(`Failed to update stat: ${error.message}`);
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: deleteStat,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["stats"] });
//       toast.success("Stat deleted successfully");
//     },
//     onError: (error) => {
//       toast.error(`Failed to delete stat: ${error.message}`);
//     },
//   });

//   console.log(stats);

//   const {
//     control,
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm<{ stats: Stat[] }>({
//     resolver: zodResolver(z.object({ stats: statsSchema })),
//     defaultValues: { stats: stats || [] },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "stats",
//   });

//   console.log(fields);

//   React.useEffect(() => {
//     if (stats) {
//       reset({ stats: stats || [] });
//     }
//   }, [stats, reset]);

//   const handleEdit = () => {
//     setIsEditing(true);
//     reset({ stats: stats || [] });
//   };

//   const handleDelete = (id: any) => {
//     if (window.confirm("Are you sure you want to delete this about section?")) {
//       deleteMutation.mutate(id);
//     }
//   };

//   const onSubmit: SubmitHandler<{ stats: Stat[] }> = async (data) => {
//     try {
//       for (const stat of data?.stats) {
//         if (stat.id) {
//           await updateMutation.mutateAsync(stat);
//         } else {
//           await createMutation.mutateAsync(stat);
//         }
//       }
//       toast.success("All stats updated successfully");
//     } catch (error) {
//       toast.error("Failed to update stats");
//     }
//   };

//   if (isLoading) return <div>Loading...</div>;

//   const handleEditTest = (update: any) => {
//     console.log(update);
//     setEditingId(update.id);
//     setEditedData({ ...update });
//   };

//   return (
//     <div>
//       {stats && !isEditing ? (
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between">
//             <CardTitle>Current About Section</CardTitle>
//             <div className="flex space-x-2">
//               <Button variant="outline" size="icon" onClick={handleEdit}>
//                 <Pencil className="h-4 w-4" />
//               </Button>
//               {/* <Button variant="destructive" size="icon" onClick={handleDelete}>
//             <Trash2 className="h-4 w-4" />
//           </Button> */}
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div>
//               {stats?.map((item) => (
//                 <div key={item.id} className="flex justify-between">
//                   {!(editingId === item.id) ? (
//                     <>
//                       {" "}
//                       <span>{item.emoji}</span>
//                       <span>{item.label}</span>
//                       <span>{item.value}</span>
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         onClick={() => handleEditTest(item)}
//                         className="mb-2"
//                       >
//                         <Pen className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="destructive"
//                         size="icon"
//                         onClick={() => handleDelete(item.id)}
//                         className="mb-2"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </>
//                   ) : (
//                     <>
//                       <input
//                         type="text"
//                         value={item.label}
//                         onChange={(e) => setStatData(e.target.value)}
//                       />
//                       <input
//                         type="text"
//                         value={item.value}
//                         onChange={(e) => setStatData(e.target.value)}
//                       />
//                       <input
//                         type="text"
//                         value={item.emoji}
//                         onChange={(e) => setStatData(e.target.value)}
//                       />

//                       <Button
//                         variant="outline"
//                         size="icon"
//                         onClick={() => handleDelete(item.id)}
//                         className="mb-2"
//                       >
//                         <Save className="h-4 w-4" />
//                       </Button>
//                     </>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       ) : (
//         <Card>
//           <CardHeader>
//             <CardTitle>Stats Manager</CardTitle>
//             <CardDescription>Manage your stats here.</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit(onSubmit)}>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Emoji</TableHead>
//                     <TableHead>Value</TableHead>
//                     <TableHead>Label</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {fields?.map((field, index) => {
//                     console.log(field);
//                     return (
//                       <TableRow key={field.id}>
//                         <TableCell>
//                           <Input
//                             {...register(`stats.${index}.emoji`)}
//                             placeholder="Emoji"
//                           />
//                           {errors.stats?.[index]?.emoji && (
//                             <span className="text-red-500 text-sm">
//                               {errors.stats[index]?.emoji?.message}
//                             </span>
//                           )}
//                         </TableCell>
//                         <TableCell>
//                           <Input
//                             {...register(`stats.${index}.value`, {
//                               valueAsNumber: true,
//                             })}
//                             type="number"
//                             placeholder="Value"
//                           />
//                           {errors.stats?.[index]?.value && (
//                             <span className="text-red-500 text-sm">
//                               {errors.stats[index]?.value?.message}
//                             </span>
//                           )}
//                         </TableCell>
//                         <TableCell>
//                           <Input
//                             {...register(`stats.${index}.label`)}
//                             placeholder="Label"
//                           />
//                           {errors.stats?.[index]?.label && (
//                             <span className="text-red-500 text-sm">
//                               {errors.stats[index]?.label?.message}
//                             </span>
//                           )}
//                         </TableCell>
//                         <TableCell>
//                           <Button
//                             type="button"
//                             variant="destructive"
//                             size="icon"
//                             onClick={() => {
//                               console.log(field);
//                               console.log(field.id);
//                               if (field.id) {
//                                 deleteMutation.mutate(field.id);
//                               }
//                               remove(index);
//                             }}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//               </Table>
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 className="mt-2 mb-2 ml-6"
//                 onClick={() => append({ emoji: "", value: 0, label: "" })}
//               >
//                 <Plus className="mr-2 h-4 w-4" /> Add Stat
//               </Button>
//               <Button
//                 type="button"
//                 variant="destructive"
//                 size="sm"
//                 className="mt-2 mb-2 ml-6"
//                 onClick={() => setIsEditing(false)}
//               >
//                 <Plus className="mr-2 h-4 w-4" /> Cancel
//               </Button>
//               <CardFooter className="flex justify-between">
//                 <Button type="submit">Save Changes</Button>
//                 {/* <Button
//               type="button"
//               variant="outline"
//               onClick={() => reset({ stats: stats || [] })}
//             >
//               Reset
//             </Button> */}
//               </CardFooter>
//             </form>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

// "use client";

// import React from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useCreateStatsMutation, useDeleteStatsMutation, useStatsQuery, useUpdateStatsMutation } from "@/hooks/useStats";
// import { StatsFormData } from "@/types/stats";
// import { statsSchema } from "@/schemas/stats-schema";

// export default function StatsEditor() {

//   const { data: statsData, isLoading } = useStatsQuery()
//   const createMutation = useCreateStatsMutation()
//   const updateMutation = useUpdateStatsMutation()
//   const deleteMutation = useDeleteStatsMutation()

//   const {
//     control,
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm<StatsFormData>({
//     resolver: zodResolver(statsSchema),
//     defaultValues: (statsData?.content as StatsFormData) || {
//       stats: [{ icon: "", count: 0, title: "" }],
//     },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "stats",
//   });

//   const onSubmit = (data: StatsFormData) => {
//     if (statsData) {
//       updateMutation.mutate(data);
//     } else {
//       createMutation.mutate(data);
//     }
//   };

//   if (isLoading) return <div>Loading...</div>;

//   return (
//     <div className="space-y-8">
//       <Card>
//         <CardHeader>
//           <CardTitle>Stats Section Editor</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             {fields.map((field, index) => (
//               <div key={field.id} className="flex space-x-2">
//                 <Input
//                   {...register(`stats.${index}.icon`)}
//                   placeholder="Icon"
//                 />
//                 <Input
//                   {...register(`stats.${index}.count`, { valueAsNumber: true })}
//                   type="number"
//                   placeholder="Count"
//                 />
//                 <Input
//                   {...register(`stats.${index}.title`)}
//                   placeholder="Title"
//                 />
//                 <Button
//                   type="button"
//                   variant="destructive"
//                   onClick={() => remove(index)}
//                 >
//                   Remove
//                 </Button>
//               </div>
//             ))}
//             {errors.stats && (
//               <p className="text-red-500">{errors.stats.message}</p>
//             )}
//             <Button
//               type="button"
//               onClick={() => append({ icon: "", count: 0, title: "" })}
//             >
//               Add Stat
//             </Button>
//             <div className="flex space-x-2">
//               <Button
//                 type="submit"
//                 disabled={createMutation.isPending || updateMutation.isPending}
//               >
//                 {statsData ? "Update" : "Create"}
//               </Button>
//               {statsData && (
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

//       {statsData && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Current Stats</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {(statsData?.content as StatsFormData)?.stats?.map(
//                 (stat, index) => (
//                   <div key={index} className="text-center">
//                     <div className="text-4xl mb-2">{stat.icon}</div>
//                     <div className="text-3xl font-bold">{stat.count}</div>
//                     <div className="text-xl">{stat.title}</div>
//                   </div>
//                 )
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

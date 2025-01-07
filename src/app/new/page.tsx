// // "use client";

// // import { useState, useEffect } from "react";
// // import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Textarea } from "@/components/ui/textarea";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import { supabase } from "@/lib/supabase";
// // import { toast } from "sonner";
// // import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// // type FieldType = "text" | "textarea" | "image" | "links";

// // interface FooterField {
// //   type: FieldType;
// //   label: string;
// //   value: string | { text: string; url: string }[];
// // }

// // interface FooterContent {
// //   id?: string;
// //   content: {
// //     [key: string]: FooterField;
// //   };
// // }

// // const updateFooterContent = async (footerContent: FooterContent) => {
// //   const { data, error } = await supabase
// //     .from("footer_contentsa")
// //     .upsert(footerContent)
// //     .select();

// //   if (error) throw new Error(error.message);
// //   return data;
// // };

// // const fetchFooterContent = async () => {
// //   const { data, error } = await supabase
// //     .from("footer_contentsa")
// //     .select("*")
// //     .single();

// //   if (error) {
// //     console.error("Error fetching footer content:", error.message);
// //   } else if (data) {
// //     return data;
// //   }
// // };

// // export default function DynamicFooterEditor() {
// //   const queryClient = useQueryClient();
// //   const [dropdownKey, setDropdownKey] = useState(0);

// //   const { data: fetchedFooterContent, isLoading } = useQuery({
// //     queryKey: ["footerContent"],
// //     queryFn: fetchFooterContent,
// //   });

// //   const { register, control, handleSubmit, setValue, watch } =
// //     useForm<FooterContent>({
// //       defaultValues: {
// //         content: {},
// //       },
// //     });

// //   const { fields, append, remove } = useFieldArray({
// //     control,
// //     name: "content",
// //   });

// //   useEffect(() => {
// //     if (fetchedFooterContent) {
// //       Object.entries(fetchedFooterContent.content ?? {}).forEach(
// //         ([key, value]) => {
// //           setValue(`content.${key}`, value as FooterField);
// //         }
// //       );
// //     }
// //   }, [fetchedFooterContent, setValue]);

// //   const mutation = useMutation({
// //     mutationFn: updateFooterContent,
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["footerContent"] });
// //       toast.success("Footer content updated successfully!");
// //     },
// //     onError: (error) => {
// //       console.error("Error updating footer content:", error);
// //       toast.error(`Error updating footer content: ${error.message}`);
// //     },
// //   });

// //   const addField = (type: FieldType, label: string) => {
// //     append({ type, label, value: type === "links" ? [] : "" });
// //     setDropdownKey((prev) => prev + 1);
// //   };

// //   const handleImageUpload = async (file: File, fieldName: string) => {
// //     const filePath = `uploads/${file.name}`;

// //     try {
// //       const { data: existingFile } = await supabase.storage
// //         .from("images")
// //         .download(filePath);

// //       if (existingFile) {
// //         const {
// //           data: { publicUrl },
// //         } = supabase.storage.from("images").getPublicUrl(filePath);

// //         setValue(fieldName, publicUrl);
// //         return;
// //       }
// //     } catch (error) {
// //       console.error("Error checking file existence:", error);
// //     }

// //     try {
// //       const { data, error } = await supabase.storage
// //         .from("images")
// //         .upload(filePath, file);

// //       if (error) {
// //         throw new Error("Upload failed");
// //       }

// //       const {
// //         data: { publicUrl },
// //       } = supabase.storage.from("images").getPublicUrl(filePath);

// //       setValue(fieldName, publicUrl);
// //     } catch (error) {
// //       console.error("Image upload failed:", error);
// //     }
// //   };

// //   const onSubmit: SubmitHandler<FooterContent> = (data) => {
// //     mutation.mutate(data);
// //   };

// //   if (isLoading) {
// //     return <div>Loading...</div>;
// //   }

// //   return (
// //     <form
// //       onSubmit={handleSubmit(onSubmit)}
// //       className="space-y-6 max-w-2xl mx-auto p-4"
// //     >
// //       <h1 className="text-2xl font-bold mb-4">Dynamic Footer Editor</h1>
// //       <div className="flex justify-between items-center">
// //         <Select
// //           key={dropdownKey}
// //           onValueChange={(value) => {
// //             const [type, label] = value.split("|") as [FieldType, string];
// //             addField(type, label);
// //           }}
// //         >
// //           <SelectTrigger className="w-[180px]">
// //             <SelectValue placeholder="Add new field" />
// //           </SelectTrigger>
// //           <SelectContent>
// //             <SelectItem value="text|Boat Logo">Boat Logo</SelectItem>
// //             <SelectItem value="image|Background Image">
// //               Background Image
// //             </SelectItem>
// //             <SelectItem value="text|Copyright">Copyright</SelectItem>
// //             <SelectItem value="textarea|Service Area">Service Area</SelectItem>
// //             <SelectItem value="links|Navigation Links">
// //               Navigation Links
// //             </SelectItem>
// //           </SelectContent>
// //         </Select>
// //         <Button type="submit">Save Footer Content</Button>
// //       </div>

// //       {fields.map((field, index) => (
// //         <div key={field.id} className="border p-4 rounded-md">
// //           <div className="flex justify-between items-center mb-2">
// //             <Input
// //               {...register(`content.${field.id}.label` as const)}
// //               className="font-semibold"
// //             />
// //             <Button onClick={() => remove(index)} variant="destructive">
// //               Remove
// //             </Button>
// //           </div>
// //           {field.type === "text" && (
// //             <Input
// //               {...register(`content.${field.id}.value` as const)}
// //               className="mt-1"
// //             />
// //           )}
// //           {field.type === "textarea" && (
// //             <Textarea
// //               {...register(`content.${field.id}.value` as const)}
// //               className="mt-1"
// //             />
// //           )}
// //           {field.type === "image" && (
// //             <Input
// //               type="file"
// //               onChange={(e) => {
// //                 const file = e.target.files?.[0];
// //                 if (file) {
// //                   handleImageUpload(file, `content.${field.id}.value`);
// //                 }
// //               }}
// //               className="mt-1"
// //             />
// //           )}
// //           {field.type === "links" && (
// //             <div className="space-y-2">
// //               {(
// //                 watch(`content.${field.id}.value`) as {
// //                   text: string;
// //                   url: string;
// //                 }[]
// //               )?.map((_, linkIndex) => (
// //                 <div key={linkIndex} className="flex space-x-2">
// //                   <Input
// //                     {...register(
// //                       `content.${field.id}.value.${linkIndex}.text` as const
// //                     )}
// //                     placeholder="Link Text"
// //                   />
// //                   <Input
// //                     {...register(
// //                       `content.${field.id}.value.${linkIndex}.url` as const
// //                     )}
// //                     placeholder="Link URL"
// //                   />
// //                   <Button
// //                     onClick={() => {
// //                       const currentLinks = watch(
// //                         `content.${field.id}.value`
// //                       ) as { text: string; url: string }[];
// //                       setValue(
// //                         `content.${field.id}.value`,
// //                         currentLinks.filter((_, i) => i !== linkIndex)
// //                       );
// //                     }}
// //                     variant="destructive"
// //                   >
// //                     Remove
// //                   </Button>
// //                 </div>
// //               ))}
// //               <Button
// //                 type="button"
// //                 onClick={() => {
// //                   const currentLinks = watch(`content.${field.id}.value`) as {
// //                     text: string;
// //                     url: string;
// //                   }[];
// //                   setValue(`content.${field.id}.value`, [
// //                     ...currentLinks,
// //                     { text: "", url: "" },
// //                   ]);
// //                 }}
// //                 variant="outline"
// //               >
// //                 Add Link
// //               </Button>
// //             </div>
// //           )}
// //         </div>
// //       ))}
// //     </form>
// //   );
// // }

// "use client";

// import { useState, useEffect } from "react";
// import {
//   useForm,
//   useFieldArray,
//   SubmitHandler,
//   Controller,
// } from "react-hook-form";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { supabase } from "@/lib/supabase";
// import { toast } from "sonner";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// type FieldType = "text" | "textarea" | "image" | "links";

// interface FooterField {
//   type: FieldType;
//   label: string;
//   value: string | { text: string; url: string }[];
// }

// interface FooterContent {
//   id?: string;
//   content: Record<string, FooterField>;
// }

// const updateFooterContent = async (footerContent: FooterContent) => {
//   const { data, error } = await supabase
//     .from("footer_contentsa")
//     .upsert(footerContent)
//     .select();

//   if (error) throw new Error(error.message);
//   return data;
// };

// const fetchFooterContent = async (): Promise<FooterContent | null> => {
//   const { data, error } = await supabase
//     .from("footer_contentsa")
//     .select("*")
//     .single();

//   if (error) {
//     console.error("Error fetching footer content:", error.message);
//     return null;
//   }
//   return data;
// };

// const fieldLabels = [
//   "Boat Logo",
//   "Background Image",
//   "Copyright",
//   "Service Area",
//   "Navigation Links",
//   "Custom Field",
// ];

// export default function DynamicFooterEditor() {
//   const queryClient = useQueryClient();
//   const [dropdownKey, setDropdownKey] = useState(0);

//   const { data: fetchedFooterContent, isLoading } = useQuery({
//     queryKey: ["footerContent"],
//     queryFn: fetchFooterContent,
//   });

//   const { control, handleSubmit, setValue, watch } = useForm<FooterContent>({
//     defaultValues: {
//       content: {},
//     },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "content",
//   });

//   useEffect(() => {
//     if (fetchedFooterContent) {
//       Object.entries(fetchedFooterContent.content).forEach(([key, value]) => {
//         setValue(`content.${key}`, value as FooterField);
//       });
//     }
//   }, [fetchedFooterContent, setValue]);

//   const mutation = useMutation({
//     mutationFn: updateFooterContent,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["footerContent"] });
//       toast.success("Footer content updated successfully!");
//     },
//     onError: (error) => {
//       console.error("Error updating footer content:", error);
//       toast.error(`Error updating footer content: ${(error as Error).message}`);
//     },
//   });

//   const addField = (type: FieldType) => {
//     append({ type, label: "", value: type === "links" ? [] : "" });
//     setDropdownKey((prev) => prev + 1);
//   };

//   const handleImageUpload = async (file: File, fieldName: string) => {
//     const filePath = `uploads/${file.name}`;

//     try {
//       const { data: existingFile } = await supabase.storage
//         .from("images")
//         .download(filePath);

//       if (existingFile) {
//         const {
//           data: { publicUrl },
//         } = supabase.storage.from("images").getPublicUrl(filePath);

//         setValue(fieldName, publicUrl);
//         return;
//       }
//     } catch (error) {
//       console.error("Error checking file existence:", error);
//     }

//     try {
//       const { data, error } = await supabase.storage
//         .from("images")
//         .upload(filePath, file);

//       if (error) {
//         throw new Error("Upload failed");
//       }

//       const {
//         data: { publicUrl },
//       } = supabase.storage.from("images").getPublicUrl(filePath);

//       setValue(fieldName, publicUrl);
//     } catch (error) {
//       console.error("Image upload failed:", error);
//     }
//   };

//   const onSubmit: SubmitHandler<FooterContent> = (data) => {
//     mutation.mutate(data);
//   };

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="space-y-6 max-w-2xl mx-auto p-4"
//     >
//       <h1 className="text-2xl font-bold mb-4">Dynamic Footer Editor</h1>
//       <div className="flex justify-between items-center">
//         <Select
//           key={dropdownKey}
//           onValueChange={(value: FieldType) => {
//             addField(value);
//           }}
//         >
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="Add new field" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="text">Text Field</SelectItem>
//             <SelectItem value="textarea">Text Area</SelectItem>
//             <SelectItem value="image">Image Upload</SelectItem>
//             <SelectItem value="links">Navigation Links</SelectItem>
//           </SelectContent>
//         </Select>
//         <Button type="submit">Save Footer Content</Button>
//       </div>

//       {fields.map((field, index) => (
//         <div key={field.id} className="border p-4 rounded-md">
//           <div className="flex justify-between items-center mb-2">
//             <Controller
//               name={`content.${field.id}.label`}
//               control={control}
//               render={({ field: labelField }) => (
//                 <Select
//                   onValueChange={labelField.onChange}
//                   value={labelField.value}
//                 >
//                   <SelectTrigger className="w-[180px]">
//                     <SelectValue placeholder="Select label" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {fieldLabels.map((label) => (
//                       <SelectItem key={label} value={label}>
//                         {label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               )}
//             />
//             <Button onClick={() => remove(index)} variant="destructive">
//               Remove
//             </Button>
//           </div>
//           <Controller
//             name={`content.${field.id}.value`}
//             control={control}
//             render={({ field: valueField }) => {
//               switch (field.type) {
//                 case "text":
//                   return <Input {...valueField} className="mt-1" />;
//                 case "textarea":
//                   return <Textarea {...valueField} className="mt-1" />;
//                 case "image":
//                   return (
//                     <Input
//                       type="file"
//                       onChange={(e) => {
//                         const file = e.target.files?.[0];
//                         if (file) {
//                           handleImageUpload(file, `content.${field.id}.value`);
//                         }
//                       }}
//                       className="mt-1"
//                     />
//                   );
//                 case "links":
//                   return (
//                     <div className="space-y-2">
//                       {(
//                         valueField.value as { text: string; url: string }[]
//                       )?.map((_, linkIndex) => (
//                         <div key={linkIndex} className="flex space-x-2">
//                           <Input
//                             {...register(
//                               `content.${field.id}.value.${linkIndex}.text` as const
//                             )}
//                             placeholder="Link Text"
//                           />
//                           <Input
//                             {...register(
//                               `content.${field.id}.value.${linkIndex}.url` as const
//                             )}
//                             placeholder="Link URL"
//                           />
//                           <Button
//                             onClick={() => {
//                               const currentLinks = watch(
//                                 `content.${field.id}.value`
//                               ) as { text: string; url: string }[];
//                               setValue(
//                                 `content.${field.id}.value`,
//                                 currentLinks.filter((_, i) => i !== linkIndex)
//                               );
//                             }}
//                             variant="destructive"
//                           >
//                             Remove
//                           </Button>
//                         </div>
//                       ))}
//                       <Button
//                         type="button"
//                         onClick={() => {
//                           const currentLinks = watch(
//                             `content.${field.id}.value`
//                           ) as { text: string; url: string }[];
//                           setValue(`content.${field.id}.value`, [
//                             ...currentLinks,
//                             { text: "", url: "" },
//                           ]);
//                         }}
//                         variant="outline"
//                       >
//                         Add Link
//                       </Button>
//                     </div>
//                   );
//                 default:
//                   return null;
//               }
//             }}
//           />
//         </div>
//       ))}
//     </form>
//   );
// }

// 'use client'

// import { useState, useEffect } from 'react'
// import { useForm, useFieldArray, SubmitHandler, Controller } from 'react-hook-form'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { supabase } from '@/lib/supabase'
// import { toast } from 'sonner'
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// type FieldType = 'text' | 'textarea' | 'image' | 'links'

// interface FooterField {
//   type: FieldType
//   label: string
//   value: string | { text: string; url: string }[]
// }

// interface FooterContent {
//   id?: string
//   content: Record<string, FooterField>
// }

// const updateFooterContent = async (footerContent: FooterContent) => {
//   const { data, error } = await supabase
//     .from('footer_contentsa')
//     .upsert(footerContent)
//     .select()

//   if (error) throw new Error(error.message)
//   return data
// }

// const fetchFooterContent = async (): Promise<FooterContent | null> => {
//   const { data, error } = await supabase
//     .from('footer_contentsa')
//     .select('*')
//     .single()

//   if (error) {
//     console.error('Error fetching footer content:', error.message)
//     return null
//   }
//   return data
// }

// const fieldLabels = [
//   'Boat Logo',
//   'Background Image',
//   'Copyright',
//   'Service Area',
//   'Navigation Links',
//   'Custom Field'
// ]

// export default function DynamicFooterEditor() {
//   const queryClient = useQueryClient()
//   const [dropdownKey, setDropdownKey] = useState(0)

//   const { data: fetchedFooterContent, isLoading } = useQuery({
//     queryKey: ['footerContent'],
//     queryFn: fetchFooterContent,
//   })

//   const { control, handleSubmit, setValue, watch } = useForm<FooterContent>({
//     defaultValues: {
//       content: {},
//     },
//   })

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: 'content',
//   })

//   useEffect(() => {
//     if (fetchedFooterContent) {
//       Object.entries(fetchedFooterContent.content).forEach(([key, value]) => {
//         setValue(`content.${key}`, value as FooterField)
//       })
//     }
//   }, [fetchedFooterContent, setValue])

//   const mutation = useMutation({
//     mutationFn: updateFooterContent,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['footerContent'] })
//       toast.success('Footer content updated successfully!')
//     },
//     onError: (error) => {
//       console.error('Error updating footer content:', error)
//       toast.error(`Error updating footer content: ${(error as Error).message}`)
//     },
//   })

//   const addField = (type: FieldType) => {
//     append({ type, label: '', value: type === 'links' ? [] : '' })
//     setDropdownKey((prev) => prev + 1)
//   }

//   const handleImageUpload = async (file: File, fieldName: string) => {
//     const filePath = `uploads/${file.name}`

//     try {
//       const { data: existingFile } = await supabase.storage
//         .from('images')
//         .download(filePath)

//       if (existingFile) {
//         const { data: { publicUrl } } = supabase.storage
//           .from('images')
//           .getPublicUrl(filePath)

//         setValue(fieldName, publicUrl)
//         return
//       }
//     } catch (error) {
//       console.error('Error checking file existence:', error)
//     }

//     try {
//       const { data, error } = await supabase.storage
//         .from('images')
//         .upload(filePath, file)

//       if (error) {
//         throw new Error('Upload failed')
//       }

//       const { data: { publicUrl } } = supabase.storage
//         .from('images')
//         .getPublicUrl(filePath)

//       setValue(fieldName, publicUrl)
//     } catch (error) {
//       console.error('Image upload failed:', error)
//     }
//   }

//   const onSubmit: SubmitHandler<FooterContent> = (data) => {
//     mutation.mutate(data)
//   }

//   if (isLoading) {
//     return <div>Loading...</div>
//   }

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Dynamic Footer Editor</h1>
//       <div className="flex justify-between items-center">
//         <Select
//           key={dropdownKey}
//           onValueChange={(value: FieldType) => {
//             addField(value)
//           }}
//         >
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="Add new field" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="text">Text Field</SelectItem>
//             <SelectItem value="textarea">Text Area</SelectItem>
//             <SelectItem value="image">Image Upload</SelectItem>
//             <SelectItem value="links">Navigation Links</SelectItem>
//           </SelectContent>
//         </Select>
//         <Button type="submit">Save Footer Content</Button>
//       </div>

//       {fields.map((field, index) => (
//         <div key={field.id} className="border p-4 rounded-md">
//           <div className="flex justify-between items-center mb-2">
//             <Controller
//               name={`content.${field.id}.label`}
//               control={control}
//               render={({ field: labelField }) => (
//                 <Select onValueChange={labelField.onChange} value={labelField.value}>
//                   <SelectTrigger className="w-[180px]">
//                     <SelectValue placeholder="Select label" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {fieldLabels.map((label) => (
//                       <SelectItem key={label} value={label}>
//                         {label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               )}
//             />
//             <Button onClick={() => remove(index)} variant="destructive">
//               Remove
//             </Button>
//           </div>
//           <Controller
//             name={`content.${field.id}.value`}
//             control={control}
//             render={({ field: valueField }) => {
//               switch (field.type) {
//                 case 'text':
//                   return <Input {...valueField} className="mt-1" />
//                 case 'textarea':
//                   return <Textarea {...valueField} className="mt-1" />
//                 case 'image':
//                   return (
//                     <Input
//                       type="file"
//                       onChange={(e) => {
//                         const file = e.target.files?.[0]
//                         if (file) {
//                           handleImageUpload(file, `content.${field.id}.value`)
//                         }
//                       }}
//                       className="mt-1"
//                     />
//                   )
//                 case 'links':
//                   return (
//                     <div className="space-y-2">
//                       {(valueField.value as { text: string; url: string }[])?.map((_, linkIndex) => (
//                         <div key={linkIndex} className="flex space-x-2">
//                           <Input
//                             {...register(`content.${field.id}.value.${linkIndex}.text` as const)}
//                             placeholder="Link Text"
//                           />
//                           <Input
//                             {...register(`content.${field.id}.value.${linkIndex}.url` as const)}
//                             placeholder="Link URL"
//                           />
//                           <Button
//                             onClick={() => {
//                               const currentLinks = watch(`content.${field.id}.value`) as { text: string; url: string }[]
//                               setValue(
//                                 `content.${field.id}.value`,
//                                 currentLinks.filter((_, i) => i !== linkIndex)
//                               )
//                             }}
//                             variant="destructive"
//                           >
//                             Remove
//                           </Button>
//                         </div>
//                       ))}
//                       <Button
//                         type="button"
//                         onClick={() => {
//                           const currentLinks = watch(`content.${field.id}.value`) as { text: string; url: string }[]
//                           setValue(`content.${field.id}.value`, [...currentLinks, { text: '', url: '' }])
//                         }}
//                         variant="outline"
//                       >
//                         Add Link
//                       </Button>
//                     </div>
//                   )
//                 default:
//                   return null
//               }
//             }}
//           />
//         </div>
//       ))}
//     </form>
//   )
// }

// import React from 'react';
// import { useForm, useFieldArray, Controller } from 'react-hook-form';

// type FieldType = 'text' | 'textarea' | 'image' | 'links';

// interface FooterField {
//   type: FieldType;
//   label: string;
//   value: string | { text: string; url: string }[];
// }

// interface FooterContent {
//   id?: string;
//   content: Record<string, FooterField>;
// }

// const MyForm = () => {
//   const { control, handleSubmit, setValue, watch } = useForm<FooterContent>({
//     defaultValues: {
//       content: {},
//     },
//   });

//   // Convert content object to array format for useFieldArray
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: 'contentArray', // We'll manage an array representation
//   });

//   // To update the content object when using useFieldArray
//   const updateContentObject = (fieldsArray) => {
//     const updatedContent = {};
//     fieldsArray.forEach(field => {
//       updatedContent[field.id] = {
//         type: field.type,
//         label: field.label,
//         value: field.value,
//       };
//     });
//     setValue('content', updatedContent); // Update the original content object
//   };

//   // Add a new field with a unique ID
//   const addField = (type: FieldType) => {
//     const uniqueId = `field-${Date.now()}`;
//     append({ id: uniqueId, type, label: '', value: type === 'links' ? [] : '' });
//   };

//   // Handle form submission
//   const onSubmit = (data: FooterContent) => {
//     console.log(data);
//   };

//   // Watch fields array changes to update the content object accordingly
//   watch((value) => {
//     updateContentObject(value.contentArray);
//   });

//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       {fields.map((field, index) => (
//         <div key={field.id} className="border p-4 rounded-md">
//           <div className="flex justify-between items-center mb-2">
//             <Controller
//               name={`contentArray.${index}.label`}
//               control={control}
//               render={({ field: labelField }) => (
//                 <input
//                   {...labelField}
//                   placeholder="Field Label"
//                   className="input"
//                 />
//               )}
//             />
//             <button type="button" onClick={() => remove(index)}>Remove</button>
//           </div>

//           <Controller
//             name={`contentArray.${index}.value`}
//             control={control}
//             render={({ field: valueField }) => {
//               switch (field.type) {
//                 case 'text':
//                   return <input {...valueField} placeholder="Text Value" className="input" />;
//                 case 'textarea':
//                   return <textarea {...valueField} placeholder="Textarea Value" className="input" />;
//                 case 'image':
//                   return <input type="file" onChange={(e) => { /* handle image upload */ }} />;
//                 case 'links':
//                   return (
//                     <div>
//                       {(valueField.value as { text: string; url: string }[]).map((link, linkIndex) => (
//                         <div key={linkIndex} className="flex space-x-2">
//                           <input
//                             {...register(`contentArray.${index}.value.${linkIndex}.text` as const)}
//                             placeholder="Link Text"
//                           />
//                           <input
//                             {...register(`contentArray.${index}.value.${linkIndex}.url` as const)}
//                             placeholder="Link URL"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => {
//                               const currentLinks = watch(`contentArray.${index}.value`) as { text: string; url: string }[];
//                               setValue(`contentArray.${index}.value`, currentLinks.filter((_, i) => i !== linkIndex));
//                             }}
//                           >
//                             Remove
//                           </button>
//                         </div>
//                       ))}
//                       <button
//                         type="button"
//                         onClick={() => {
//                           const currentLinks = watch(`contentArray.${index}.value`) as { text: string; url: string }[];
//                           setValue(`contentArray.${index}.value`, [...currentLinks, { text: '', url: '' }]);
//                         }}
//                       >
//                         Add Link
//                       </button>
//                     </div>
//                   );
//                 default:
//                   return null;
//               }
//             }}
//           />
//         </div>
//       ))}
//       <button type="button" onClick={() => addField('text')}>Add Text Field</button>
//       <button type="button" onClick={() => addField('links')}>Add Links Field</button>
//       <button type="submit">Submit</button>
//     </form>
//   );
// };

// export default MyForm;

"use client";

import { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Metric = {
  cpu: string;
  memory: string;
  timestamp: string;
};

export default function MetricsDisplay() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const socket = new WebSocket(
        `${protocol}//${window.location.host}/api/metrics`
      );

      socket.onopen = () => console.log("WebSocket connected");
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMetrics((prev) => [...prev.slice(-59), data]);
      };
      socket.onerror = (error) => console.error("WebSocket error:", error);
      socket.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setTimeout(connectWebSocket, 5000); // Attempt to reconnect after 5 seconds
      };

      socketRef.current = socket;
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const chartData = {
    labels: metrics.map((m) => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "CPU Usage (%)",
        data: metrics.map((m) => parseFloat(m.cpu)),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Memory Usage (%)",
        data: metrics.map((m) => parseFloat(m.memory)),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "System Metrics",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">System Metrics</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-4 bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPU Usage (%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Memory Usage (%)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {metrics
              .slice(-10)
              .reverse()
              .map((metric, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(metric.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metric.cpu}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metric.memory}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

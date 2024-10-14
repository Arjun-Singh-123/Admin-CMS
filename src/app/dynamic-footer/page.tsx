"use client";

import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type FieldType = "text" | "textarea" | "image" | "links";

interface FooterField {
  type: FieldType;
  label: string;
  value: string | { text: string; url: string }[];
}

interface FooterContent {
  id?: string;
  content: {
    [key: string]: FooterField;
  };
}
const updateFooterContent = async (footerContent: any) => {
  const { data, error } = await supabase
    .from("footer_contentsa")
    .upsert(footerContent)
    .select();

  if (error) throw new Error(error.message);
  return data;
};

const fetchFooterContent = async () => {
  const { data, error } = await supabase
    .from("footer_contentsa")
    .select("*")
    .single();

  if (error) {
    console.error("Error fetching footer content:", error.message);
  } else if (data) {
    return data;
  }
};

export default function DynamicFooterEditor() {
  const [dropdownKey, setDropdownKey] = useState(0); // Key for re-rendering
  const queryClient = useQueryClient();
  //   const [selectedValue, setSelectedValue] = useState("");

  //   const [footerContent, setFooterContent] = useState<FooterContent>({
  //     content: {},
  //   });

  //   useEffect(() => {
  //     fetchFooterContent();
  //   }, []);

  // Queries
  const {
    data: fetchedFooterContent,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["footerContent"],
    queryFn: () => fetchFooterContent(),
  });

  // Mutations
  const mutation = useMutation({
    mutationFn: updateFooterContent,
    onSuccess: () => {
      // Invalidate and refetch the footer content
      queryClient.invalidateQueries({ queryKey: ["footerContent"] });
      toast.success("Footer content updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating footer content:", error);
      toast.error(`Error updating footer content: ${error.message}`);
    },
  });

  // Local state to manage footer content updates
  //   const [footerContent, setFooterContent] = useState(() => {
  //     return fetchedFooterContent ? fetchedFooterContent : { content: {} };
  //   });

  // Local state to manage footer content updates
  const [footerContent, setFooterContent] = useState<FooterContent>({
    content: {},
  });

  // Update local state when fetchedFooterContent changes
  useEffect(() => {
    if (fetchedFooterContent) {
      setFooterContent(fetchedFooterContent as any);
    }
  }, [fetchedFooterContent]);

  console.log("fetched content using ...........", footerContent);
  const addField = (type: FieldType) => {
    const newLabel = `New ${type} field ${Date.now()}`;
    const label = newLabel.replace(/\s\d+$/, "");
    console.log(label, "checking before sending it");
    setFooterContent((prev) => ({
      ...prev,
      content: {
        [newLabel]: {
          type,
          label,
          value: type === "links" ? [] : "",
        },
        ...prev.content,
      },
    }));

    setDropdownKey((prev) => prev + 1);
  };

  const validateFooterContent = () => {
    const errors: string[] = [];
    for (const fieldKey in footerContent.content) {
      const field = footerContent.content[fieldKey];
      if (field.type === "links") {
        const links = field.value as { text: string; url: string }[];
        links.forEach((link, index) => {
          if (!link.text.trim()) {
            errors.push(`${field.label} - Link ${index + 1} text is required`);
          }
          if (!link.url.trim()) {
            errors.push(`${field.label} - Link ${index + 1} URL is required`);
          }
        });
      } else if (
        !field.value ||
        (typeof field.value === "string" && field.value.trim() === "")
      ) {
        errors.push(`${field.label} is required`);
      }
    }
    return errors;
  };

  const updateField = (label: string, updates: Partial<FooterField>) => {
    setFooterContent((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [label]: { ...prev.content[label], ...updates },
      },
    }));
  };

  const removeField = (label: string) => {
    setFooterContent((prev) => {
      const { [label]: _, ...rest } = prev.content;
      return { ...prev, content: rest };
    });
  };

  //   const handleImageUpload = async (file: File, fieldId: string) => {
  //     try {
  //       const imageUrl = await uploadImageAndGetUrl(file);

  //       setFooterContent((prevContent) => ({
  //         ...prevContent,
  //         content: {
  //           ...prevContent.content,
  //           [fieldId]: {
  //             ...prevContent.content[fieldId],
  //             value: imageUrl,
  //           },
  //         },
  //       }));
  //     } catch (error) {
  //       console.error("Image upload failed:", error);
  //     }
  //   };

  const handleImageUpload = async (file: File, fieldId: string) => {
    const filePath = `uploads/${file.name}`;

    try {
      // Check if the image already exists
      const { data: existingFile } = await supabase.storage
        .from("images")
        .download(filePath);

      if (existingFile) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(filePath);

        setFooterContent((prevContent) => ({
          ...prevContent,
          content: {
            ...prevContent.content,
            [fieldId]: {
              ...prevContent.content[fieldId],
              value: publicUrl,
            },
          },
        }));
        return;
      }
    } catch (error) {
      if (!error) {
        console.error("Error checking file existence:", error);
        return;
      }
    }

    try {
      const imageUrl = await uploadImageAndGetUrl(file);

      setFooterContent((prevContent) => ({
        ...prevContent,
        content: {
          ...prevContent.content,
          [fieldId]: {
            ...prevContent.content[fieldId],
            value: imageUrl,
          },
        },
      }));
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  const uploadImageAndGetUrl = async (file: File): Promise<string> => {
    const filePath = `uploads/${file.name}`;

    try {
      const { data, error } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (error) {
        console.error("Upload error:", error);
        throw new Error("Upload failed");
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("data before sending it ", footerContent);
    // const { data, error } = await supabase
    //   .from("footer_contentsa")
    //   .upsert(footerContent)
    //   .select();

    // if (error) {
    //   console.error("Error updating footer content:", error);
    // } else {
    //   console.log("Footer content updated successfully:", data);
    //   toast.success("Footer content updated successfully:");
    // }
    const validationErrors = validateFooterContent();

    if (validationErrors.length > 0) {
      toast.error("Please fill all the fields to submit");
      // validationErrors.forEach((error) => toast.error(error));
      return;
    }

    mutation.mutate(footerContent);
  };

  const renderField = (label: string, field: FooterField) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            value={field.value as string}
            onChange={(e) => updateField(label, { value: e.target.value })}
            className="mt-1"
          />
        );
      case "textarea":
        return (
          <Textarea
            value={field.value as string}
            onChange={(e) => updateField(label, { value: e.target.value })}
            className="mt-1"
          />
        );
      case "image":
        return (
          <Input
            type="file"
            onChange={(e) => {
              // Handle image upload logic here

              const file = e.target.files?.[0];
              if (file) {
                handleImageUpload(file, label);
              }
            }}
            className="mt-1"
          />
        );
      case "links":
        return (
          <div className="space-y-2">
            {(field.value as { text: string; url: string }[]).map(
              (link, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={link.text}
                    onChange={(e) => {
                      const newLinks = [
                        ...(field.value as { text: string; url: string }[]),
                      ];
                      newLinks[index].text = e.target.value;
                      updateField(label, { value: newLinks });
                    }}
                    placeholder="Link Text"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [
                        ...(field.value as { text: string; url: string }[]),
                      ];
                      newLinks[index].url = e.target.value;
                      updateField(label, { value: newLinks });
                    }}
                    placeholder="Link URL"
                  />
                  <Button
                    onClick={() => {
                      const newLinks = (
                        field.value as { text: string; url: string }[]
                      ).filter((_, i) => i !== index);
                      updateField(label, { value: newLinks });
                    }}
                    variant="destructive"
                  >
                    Remove
                  </Button>
                </div>
              )
            )}
            <Button
              type="button"
              onClick={() => {
                const newLinks = [
                  ...(field.value as { text: string; url: string }[]),
                  { text: "", url: "" },
                ];
                updateField(label, { value: newLinks });
              }}
              variant="outline"
            >
              Add Link
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dynamic Footer Editor</h1>
      <div className="flex justify-between items-center">
        <Select
          key={dropdownKey}
          onValueChange={(value: FieldType) => {
            addField(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Add new field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text Field</SelectItem>
            <SelectItem value="textarea">Text Area</SelectItem>
            <SelectItem value="image">Image Upload</SelectItem>
            <SelectItem value="links">Navigation Links</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">Save Footer Content</Button>
      </div>

      {Object?.entries(footerContent.content ?? {})?.map(([label, field]) => (
        <div key={label} className="border p-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <Input
              //   value={field.label}
              value={field?.label?.replace(/\s\d+$/, "")}
              onChange={(e) => updateField(label, { label: e.target.value })}
              className="font-semibold"
            />
            <Button onClick={() => removeField(label)} variant="destructive">
              Remove
            </Button>
          </div>
          {renderField(label, field)}
        </div>
      ))}
    </form>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
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
// import { PlusCircle, Trash2 } from "lucide-react";
// import { Json } from "../../../database.types";

// type FieldType = "text" | "textarea" | "image" | "links";

// interface FooterField {
//   type: FieldType;
//   label: string;
//   value: string | { text: string; url: string }[];
// }

// interface FooterContent {
//   id?: string;
//   content: Json;
// }

// const updateFooterContent = async (footerContent: FooterContent) => {
//   console.log("function called");
//   const { data, error } = await supabase
//     .from("footer_contentsa")
//     .upsert(footerContent)
//     .select();

//   if (error) throw new Error(error.message);
//   return data;
// };

// const fetchFooterContent = async () => {
//   const { data, error } = await supabase
//     .from("footer_contentsa")
//     .select("*")
//     .single();

//   if (error) {
//     console.error("Error fetching footer content:", error.message);
//   } else if (data) {
//     return data;
//   }
// };

// const formSchema = z.object({
//   content: z.record(
//     z.object({
//       type: z.enum(["text", "textarea", "image", "links"]),
//       label: z.string().optional(),
//       value: z.union([
//         z.string().min(1, "Value is required"),
//         z.array(
//           z.object({
//             text: z.string().min(1, "Link text is required"),
//             url: z.string().url("Invalid URL").min(1, "URL is required"),
//           })
//         ),
//       ]),
//     })
//   ),
// });

// export default function DynamicFooterEditor() {
//   const queryClient = useQueryClient();
//   const [dropdownKey, setDropdownKey] = useState(0);

//   const { data: fetchedFooterContent, isLoading } = useQuery({
//     queryKey: ["footerContent"],
//     queryFn: fetchFooterContent,
//   });

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       content: {},
//     },
//   });

//   useEffect(() => {
//     if (fetchedFooterContent) {
//       form.reset({ content: fetchedFooterContent.content || {} });
//     }
//   }, [fetchedFooterContent, form]);

//   const mutation = useMutation({
//     mutationFn: updateFooterContent,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["footerContent"] });
//       toast.success("Footer content updated successfully!");
//     },
//     onError: (error: Error) => {
//       console.error("Error updating footer content:", error);
//       toast.error(`Error updating footer content: ${error.message}`);
//     },
//   });

//   const addField = (type: FieldType) => {
//     const newLabel = `New ${type} field ${Date.now()}`;
//     const label = newLabel.replace(/\s\d+$/, "");
//     form.setValue(`content.${newLabel}`, {
//       type,
//       label,
//       value: type === "links" ? [] : "",
//     });
//     setDropdownKey((prev) => prev + 1);
//   };

//   const removeField = (label: string) => {
//     const content = form.getValues("content");
//     const { [label]: _, ...rest } = content;
//     form.setValue("content", rest);
//   };

//   const handleImageUpload = async (file: File, fieldId: string) => {
//     const filePath = `uploads/${file.name}`;

//     try {
//       const { data: existingFile } = await supabase.storage
//         .from("images")
//         .download(filePath);

//       if (existingFile) {
//         const {
//           data: { publicUrl },
//         } = supabase.storage.from("images").getPublicUrl(filePath);
//         form.setValue(`content.${fieldId}.value`, publicUrl);
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

//       form.setValue(`content.${fieldId}.value`, publicUrl);
//     } catch (error) {
//       console.error("Image upload failed:", error);
//     }
//   };

//   const onSubmit = (values: z.infer<typeof formSchema>) => {
//     console.log("function called onSubmit");
//     mutation.mutate(values as FooterContent);
//   };

//   const content = form.getValues("content");
//   console.log("checking content", content);
//   const renderField = (label: string, field: FooterField) => {
//     switch (field.type) {
//       case "text":
//         return (
//           <FormField
//             control={form.control}
//             name={`content.${label}.value`}
//             render={({ field }: any) => (
//               <FormItem>
//                 <FormControl>
//                   <Input {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );
//       case "textarea":
//         return (
//           <FormField
//             control={form.control}
//             name={`content.${label}.value`}
//             render={({ field }: any) => (
//               <FormItem>
//                 <FormControl>
//                   <Textarea {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );
//       case "image":
//         return (
//           <FormField
//             control={form.control}
//             name={`content.${label}.value`}
//             render={({ field }) => (
//               <FormItem>
//                 <FormControl>
//                   <Input
//                     type="file"
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       if (file) {
//                         handleImageUpload(file, label);
//                       }
//                     }}
//                   />
//                 </FormControl>
//                 <FormDescription>
//                   {field.value && (
//                     <img
//                       src={field.value as string}
//                       alt="Uploaded"
//                       className="mt-2 max-w-xs"
//                     />
//                   )}
//                 </FormDescription>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );
//       case "links":
//         return (
//           <FormField
//             control={form.control}
//             name={`content.${label}.value`}
//             render={({ field }) => (
//               <FormItem>
//                 <FormControl>
//                   <div className="space-y-2">
//                     {(field.value as { text: string; url: string }[]).map(
//                       (link, index) => (
//                         <div key={index} className="flex space-x-2">
//                           <Input
//                             value={link.text}
//                             onChange={(e) => {
//                               const newLinks = [
//                                 ...(field.value as {
//                                   text: string;
//                                   url: string;
//                                 }[]),
//                               ];
//                               newLinks[index].text = e.target.value;
//                               field.onChange(newLinks);
//                             }}
//                             placeholder="Link Text"
//                           />
//                           <Input
//                             value={link.url}
//                             onChange={(e) => {
//                               const newLinks = [
//                                 ...(field.value as {
//                                   text: string;
//                                   url: string;
//                                 }[]),
//                               ];
//                               newLinks[index].url = e.target.value;
//                               field.onChange(newLinks);
//                             }}
//                             placeholder="Link URL"
//                           />
//                           <Button
//                             onClick={() => {
//                               const newLinks = (
//                                 field.value as { text: string; url: string }[]
//                               ).filter((_, i) => i !== index);
//                               field.onChange(newLinks);
//                             }}
//                             variant="destructive"
//                             size="icon"
//                             className="p-2"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       )
//                     )}
//                     <Button
//                       type="button"
//                       onClick={() => {
//                         const newLinks = [
//                           ...(field.value as { text: string; url: string }[]),
//                           { text: "", url: "" },
//                         ];
//                         field.onChange(newLinks);
//                       }}
//                       variant="outline"
//                     >
//                       <PlusCircle className="mr-2 h-4 w-4" /> Add Link
//                     </Button>
//                   </div>
//                 </FormControl>
//                 {/* <FormMessage /> */}
//               </FormItem>
//             )}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         className="space-y-6 max-w-2xl mx-auto p-4"
//       >
//         <h1 className="text-2xl font-bold mb-4">Dynamic Footer Editor</h1>
//         <div className="flex justify-between items-center">
//           <Select
//             key={dropdownKey}
//             onValueChange={(value: FieldType) => {
//               addField(value);
//             }}
//           >
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Add new field" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="text">Text Field</SelectItem>
//               <SelectItem value="textarea">Text Area</SelectItem>
//               <SelectItem value="image">Image Upload</SelectItem>
//               <SelectItem value="links">Navigation Links</SelectItem>
//             </SelectContent>
//           </Select>
//           <Button type="submit">Save Footer Content</Button>
//         </div>

//         {Object.entries(form.watch("content")).map(([label, field]) => (
//           <div key={label} className="border p-4 rounded-md">
//             <div className="flex justify-between items-center mb-2">
//               <FormField
//                 control={form.control}
//                 name={`content.${label}.label`}
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <Input {...field} className="font-semibold" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <Button
//                 onClick={() => removeField(label)}
//                 variant="destructive"
//                 size="sm"
//               >
//                 Remove
//               </Button>
//             </div>
//             {renderField(label, field as FooterField)}
//           </div>
//         ))}
//       </form>
//     </Form>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
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
//   content: {
//     [key: string]: FooterField;
//   };
// }
// const updateFooterContent = async (footerContent: any) => {
//   const { data, error } = await supabase
//     .from("footer_contentsa")
//     .upsert(footerContent)
//     .select();

//   if (error) throw new Error(error.message);
//   return data;
// };

// const fetchFooterContent = async () => {
//   const { data, error } = await supabase
//     .from("footer_contentsa")
//     .select("*")
//     .single();

//   if (error) {
//     console.error("Error fetching footer content:", error.message);
//   } else if (data) {
//     return data;
//   }
// };

// export default function DynamicFooterEditor() {
//   const [dropdownKey, setDropdownKey] = useState(0); // Key for re-rendering
//   const queryClient = useQueryClient();
//   //   const [selectedValue, setSelectedValue] = useState("");

//   //   const [footerContent, setFooterContent] = useState<FooterContent>({
//   //     content: {},
//   //   });

//   //   useEffect(() => {
//   //     fetchFooterContent();
//   //   }, []);

//   // Queries
//   const {
//     data: fetchedFooterContent,
//     error,
//     isLoading,
//   } = useQuery({
//     queryKey: ["footerContent"],
//     queryFn: () => fetchFooterContent(),
//   });

//   // Mutations
//   const mutation = useMutation({
//     mutationFn: updateFooterContent,
//     onSuccess: () => {
//       // Invalidate and refetch the footer content
//       queryClient.invalidateQueries({ queryKey: ["footerContent"] });
//       toast.success("Footer content updated successfully!");
//     },
//     onError: (error) => {
//       console.error("Error updating footer content:", error);
//       toast.error(`Error updating footer content: ${error.message}`);
//     },
//   });

//   // Local state to manage footer content updates
//   //   const [footerContent, setFooterContent] = useState(() => {
//   //     return fetchedFooterContent ? fetchedFooterContent : { content: {} };
//   //   });

//   // Local state to manage footer content updates
//   const [footerContent, setFooterContent] = useState<FooterContent>({
//     content: {},
//   });

//   // Update local state when fetchedFooterContent changes
//   useEffect(() => {
//     if (fetchedFooterContent) {
//       setFooterContent(fetchedFooterContent as any);
//     }
//   }, [fetchedFooterContent]);

//   console.log("fetched content using ...........", footerContent);
//   const addField = (type: FieldType) => {
//     const newLabel = `New ${type} field ${Date.now()}`;
//     const label = newLabel.replace(/\s\d+$/, "");
//     console.log(label, "checking before sending it");
//     setFooterContent((prev) => ({
//       ...prev,
//       content: {
//         [newLabel]: {
//           type,
//           label,
//           value: type === "links" ? [] : "",
//         },
//         ...prev.content,
//       },
//     }));

//     setDropdownKey((prev) => prev + 1);
//   };

//   const validateFooterContent = () => {
//     const errors: string[] = [];
//     for (const fieldKey in footerContent.content) {
//       const field = footerContent.content[fieldKey];
//       if (field.type === "links") {
//         const links = field.value as { text: string; url: string }[];
//         links.forEach((link, index) => {
//           if (!link.text.trim()) {
//             errors.push(`${field.label} - Link ${index + 1} text is required`);
//           }
//           if (!link.url.trim()) {
//             errors.push(`${field.label} - Link ${index + 1} URL is required`);
//           }
//         });
//       } else if (
//         !field.value ||
//         (typeof field.value === "string" && field.value.trim() === "")
//       ) {
//         errors.push(`${field.label} is required`);
//       }
//     }
//     return errors;
//   };

//   const updateField = (label: string, updates: Partial<FooterField>) => {
//     setFooterContent((prev) => ({
//       ...prev,
//       content: {
//         ...prev.content,
//         [label]: { ...prev.content[label], ...updates },
//       },
//     }));
//   };

//   const removeField = (label: string) => {
//     setFooterContent((prev) => {
//       const { [label]: _, ...rest } = prev.content;
//       return { ...prev, content: rest };
//     });
//   };

//   //   const handleImageUpload = async (file: File, fieldId: string) => {
//   //     try {
//   //       const imageUrl = await uploadImageAndGetUrl(file);

//   //       setFooterContent((prevContent) => ({
//   //         ...prevContent,
//   //         content: {
//   //           ...prevContent.content,
//   //           [fieldId]: {
//   //             ...prevContent.content[fieldId],
//   //             value: imageUrl,
//   //           },
//   //         },
//   //       }));
//   //     } catch (error) {
//   //       console.error("Image upload failed:", error);
//   //     }
//   //   };

//   const handleImageUpload = async (file: File, fieldId: string) => {
//     const filePath = `uploads/${file.name}`;

//     try {
//       // Check if the image already exists
//       const { data: existingFile } = await supabase.storage
//         .from("images")
//         .download(filePath);

//       if (existingFile) {
//         const {
//           data: { publicUrl },
//         } = supabase.storage.from("images").getPublicUrl(filePath);

//         setFooterContent((prevContent) => ({
//           ...prevContent,
//           content: {
//             ...prevContent.content,
//             [fieldId]: {
//               ...prevContent.content[fieldId],
//               value: publicUrl,
//             },
//           },
//         }));
//         return;
//       }
//     } catch (error) {
//       if (!error) {
//         console.error("Error checking file existence:", error);
//         return;
//       }
//     }

//     try {
//       const imageUrl = await uploadImageAndGetUrl(file);

//       setFooterContent((prevContent) => ({
//         ...prevContent,
//         content: {
//           ...prevContent.content,
//           [fieldId]: {
//             ...prevContent.content[fieldId],
//             value: imageUrl,
//           },
//         },
//       }));
//     } catch (error) {
//       console.error("Image upload failed:", error);
//     }
//   };

//   const uploadImageAndGetUrl = async (file: File): Promise<string> => {
//     const filePath = `uploads/${file.name}`;

//     try {
//       const { data, error } = await supabase.storage
//         .from("images")
//         .upload(filePath, file);

//       if (error) {
//         console.error("Upload error:", error);
//         throw new Error("Upload failed");
//       }

//       const {
//         data: { publicUrl },
//       } = supabase.storage.from("images").getPublicUrl(filePath);

//       return publicUrl;
//     } catch (error) {
//       console.error("Error uploading file:", error);
//       throw error;
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     // console.log("data before sending it ", footerContent);
//     // const { data, error } = await supabase
//     //   .from("footer_contentsa")
//     //   .upsert(footerContent)
//     //   .select();

//     // if (error) {
//     //   console.error("Error updating footer content:", error);
//     // } else {
//     //   console.log("Footer content updated successfully:", data);
//     //   toast.success("Footer content updated successfully:");
//     // }
//     const validationErrors = validateFooterContent();

//     if (validationErrors.length > 0) {
//       toast.error("Please fill all the fields to submit");
//       // validationErrors.forEach((error) => toast.error(error));
//       return;
//     }

//     mutation.mutate(footerContent);
//   };

//   const renderField = (label: string, field: FooterField) => {
//     switch (field.type) {
//       case "text":
//         return (
//           <Input
//             value={field.value as string}
//             onChange={(e) => updateField(label, { value: e.target.value })}
//             className="mt-1"
//           />
//         );
//       case "textarea":
//         return (
//           <Textarea
//             value={field.value as string}
//             onChange={(e) => updateField(label, { value: e.target.value })}
//             className="mt-1"
//           />
//         );
//       case "image":
//         return (
//           <Input
//             type="file"
//             onChange={(e) => {
//               // Handle image upload logic here

//               const file = e.target.files?.[0];
//               if (file) {
//                 handleImageUpload(file, label);
//               }
//             }}
//             className="mt-1"
//           />
//         );
//       case "links":
//         return (
//           <div className="space-y-2">
//             {(field.value as { text: string; url: string }[]).map(
//               (link, index) => (
//                 <div key={index} className="flex space-x-2">
//                   <Input
//                     value={link.text}
//                     onChange={(e) => {
//                       const newLinks = [
//                         ...(field.value as { text: string; url: string }[]),
//                       ];
//                       newLinks[index].text = e.target.value;
//                       updateField(label, { value: newLinks });
//                     }}
//                     placeholder="Link Text"
//                   />
//                   <Input
//                     value={link.url}
//                     onChange={(e) => {
//                       const newLinks = [
//                         ...(field.value as { text: string; url: string }[]),
//                       ];
//                       newLinks[index].url = e.target.value;
//                       updateField(label, { value: newLinks });
//                     }}
//                     placeholder="Link URL"
//                   />
//                   <Button
//                     onClick={() => {
//                       const newLinks = (
//                         field.value as { text: string; url: string }[]
//                       ).filter((_, i) => i !== index);
//                       updateField(label, { value: newLinks });
//                     }}
//                     variant="destructive"
//                   >
//                     Remove
//                   </Button>
//                 </div>
//               )
//             )}
//             <Button
//               type="button"
//               onClick={() => {
//                 const newLinks = [
//                   ...(field.value as { text: string; url: string }[]),
//                   { text: "", url: "" },
//                 ];
//                 updateField(label, { value: newLinks });
//               }}
//               variant="outline"
//             >
//               Add Link
//             </Button>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4">
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

//       {Object?.entries(footerContent.content ?? {})?.map(([label, field]) => (
//         <div key={label} className="border p-4 rounded-md">
//           <div className="flex justify-between items-center mb-2">
//             <Input
//               //   value={field.label}
//               value={field?.label?.replace(/\s\d+$/, "")}
//               onChange={(e) => updateField(label, { label: e.target.value })}
//               className="font-semibold"
//             />
//             <Button onClick={() => removeField(label)} variant="destructive">
//               Remove
//             </Button>
//           </div>
//           {renderField(label, field)}
//         </div>
//       ))}
//     </form>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import { v4 as uuidv4 } from "uuid";
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

// type FieldType = "text" | "textarea" | "image" | "links";

// interface FooterField {
//   id?: string;
//   type: FieldType;
//   label: string;
//   value: string | { text: string; url: string }[];
// }

// interface FooterContent {
//   id?: string;
//   fields: FooterField[];
// }

// export default function DynamicFooterEditor() {
//   const [footerContent, setFooterContent] = useState<FooterContent>({
//     id: "",
//     fields: [],
//   });

//   useEffect(() => {
//     fetchFooterContent();
//   }, []);

//   const fetchFooterContent = async () => {
//     const { data, error } = await supabase
//       .from("footer_contentn")
//       .select("*")
//       .single();

//     if (error) {
//       console.error("Error fetching footer content:", error.message);
//     } else if (data) {
//       setFooterContent(data);
//     }
//   };

//   const addField = (type: FieldType) => {
//     const newField: FooterField = {

//       type,
//       label: `New ${type} field`,
//       value: type === "links" ? [] : "",
//     };
//     setFooterContent((prev) => ({
//       ...prev,
//       fields: [...prev.fields, newField],
//     }));
//   };

//   const updateField = (id: string, updates: Partial<FooterField>) => {
//     setFooterContent((prev) => ({
//       ...prev,
//       fields: prev.fields.map((field) =>
//         field.id === id ? { ...field, ...updates } : field
//       ),
//     }));
//   };

//   const removeField = (id: string) => {
//     setFooterContent((prev) => ({
//       ...prev,
//       fields: prev.fields.filter((field) => field.id !== id),
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const { data, error } = await supabase
//       .from("footer_contentn")
//       .upsert(footerContent as any)
//       .select();

//     if (error) {
//       console.error("Error updating footer content:", error);
//     } else {
//       console.log("Footer content updated successfully:", data);
//     }
//   };

//   const renderField = (field: FooterField , index:number) => {
//     switch (field.type) {
//       case "text":
//         return (
//           <Input
//             value={field.value as string}
//             onChange={(e) => updateField(field.id, { value: e.target.value })}
//             className="mt-1"
//           />
//         );
//       case "textarea":
//         return (
//           <Textarea
//             value={field.value as string}
//             onChange={(e) => updateField(field.id, { value: e.target.value })}
//             className="mt-1"
//           />
//         );
//       case "image":
//         return (
//           <Input
//             type="file"
//             onChange={(e) => {
//               // Handle image upload logic here
//               console.log("Image upload not implemented in this example");
//             }}
//             className="mt-1"
//           />
//         );
//       case "links":
//         return (
//           <div className="space-y-2">
//             {(field.value as { text: string; url: string }[]).map(
//               (link, index) => (
//                 <div key={index} className="flex space-x-2">
//                   <Input
//                     value={link.text}
//                     onChange={(e) => {
//                       const newLinks = [
//                         ...(field.value as { text: string; url: string }[]),
//                       ];
//                       newLinks[index].text = e.target.value;
//                       updateField(field.id, { value: newLinks });
//                     }}
//                     placeholder="Link Text"
//                   />
//                   <Input
//                     value={link.url}
//                     onChange={(e) => {
//                       const newLinks = [
//                         ...(field.value as { text: string; url: string }[]),
//                       ];
//                       newLinks[index].url = e.target.value;
//                       updateField(field.id, { value: newLinks });
//                     }}
//                     placeholder="Link URL"
//                   />
//                   <Button
//                     onClick={() => {
//                       const newLinks = (
//                         field.value as { text: string; url: string }[]
//                       ).filter((_, i) => i !== index);
//                       updateField(field.id, { value: newLinks });
//                     }}
//                     variant="destructive"
//                   >
//                     Remove
//                   </Button>
//                 </div>
//               )
//             )}
//             <Button
//               onClick={() => {
//                 const newLinks = [
//                   ...(field.value as { text: string; url: string }[]),
//                   { text: "", url: "" },
//                 ];
//                 updateField(field.id, { value: newLinks });
//               }}
//               variant="outline"
//             >
//               Add Link
//             </Button>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Dynamic Footer Editor</h1>

//       {footerContent.fields.map((field) => (
//         <div key={field.id} className="border p-4 rounded-md">
//           <div className="flex justify-between items-center mb-2">
//             <Input
//               value={field.label}
//               onChange={(e) => updateField(field.id, { label: e.target.value })}
//               className="font-semibold"
//             />
//             <Button onClick={() => removeField(field.id)} variant="destructive">
//               Remove
//             </Button>
//           </div>
//           {renderField(field)}
//         </div>
//       ))}

//       <div className="flex justify-between items-center">
//         <Select onValueChange={(value: FieldType) => addField(value)}>
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
//     </form>
//   );
// }
// "use client";

// import { useState, useEffect } from "react";
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

// type FieldType = "text" | "textarea" | "image" | "links";

// interface FooterField {
//   id?: string;
//   type: FieldType;
//   label: string;
//   value: string | { text: string; url: string }[];
// }

// interface FooterContent {
//   id?: string;
//   fields: FooterField[];
// }

// export default function DynamicFooterEditor() {
//   const [footerContent, setFooterContent] = useState<FooterContent>({
//     fields: [],
//   });

//   useEffect(() => {
//     fetchFooterContent();
//   }, []);

//   const fetchFooterContent = async () => {
//     const { data, error } = await supabase.from("footer_contentn").select("*");

//     if (error) {
//       console.error("Error fetching footer content:", error.message);
//     } else if (data) {
//       console.log("footer contentn data ", data);
//       setFooterContent(data);
//     }
//   };

//   const addField = (type: FieldType) => {
//     const newField: FooterField = {
//       type,
//       label: `New ${type} field`,
//       value: type === "links" ? [] : "",
//     };
//     setFooterContent((prev) => ({
//       ...prev,
//       fields: [...(prev.fields ?? []), newField],
//     }));
//   };

//   const updateField = (index: number, updates: Partial<FooterField>) => {
//     setFooterContent((prev) => ({
//       ...prev,
//       fields: prev.fields.map((field, i) =>
//         i === index ? { ...field, ...updates } : field
//       ),
//     }));
//   };

//   const removeField = (index: number) => {
//     setFooterContent((prev) => ({
//       ...prev,
//       fields: prev.fields.filter((_, i) => i !== index),
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const { data, error } = await supabase
//       .from("footer_contentn")
//       .upsert(footerContent)
//       .select();

//     if (error) {
//       console.error("Error updating footer content:", error);
//     } else {
//       console.log("Footer content updated successfully:", data);
//     }
//   };

//   const renderField = (field: FooterField, index: number) => {
//     switch (field.type) {
//       case "text":
//         return (
//           <Input
//             value={field.value as string}
//             onChange={(e) => updateField(index, { value: e.target.value })}
//             className="mt-1"
//           />
//         );
//       case "textarea":
//         return (
//           <Textarea
//             value={field.value as string}
//             onChange={(e) => updateField(index, { value: e.target.value })}
//             className="mt-1"
//           />
//         );
//       case "image":
//         return (
//           <Input
//             type="file"
//             onChange={(e) => {
//               // Handle image upload logic here
//               console.log("Image upload not implemented in this example");
//             }}
//             className="mt-1"
//           />
//         );
//       case "links":
//         return (
//           <div className="space-y-2">
//             {(field.value as { text: string; url: string }[]).map(
//               (link, linkIndex) => (
//                 <div key={linkIndex} className="flex space-x-2">
//                   <Input
//                     value={link.text}
//                     onChange={(e) => {
//                       const newLinks = [
//                         ...(field.value as { text: string; url: string }[]),
//                       ];
//                       newLinks[linkIndex].text = e.target.value;
//                       updateField(index, { value: newLinks });
//                     }}
//                     placeholder="Link Text"
//                   />
//                   <Input
//                     value={link.url}
//                     onChange={(e) => {
//                       const newLinks = [
//                         ...(field.value as { text: string; url: string }[]),
//                       ];
//                       newLinks[linkIndex].url = e.target.value;
//                       updateField(index, { value: newLinks });
//                     }}
//                     placeholder="Link URL"
//                   />
//                   <Button
//                     onClick={() => {
//                       const newLinks = (
//                         field.value as { text: string; url: string }[]
//                       ).filter((_, i) => i !== linkIndex);
//                       updateField(index, { value: newLinks });
//                     }}
//                     variant="destructive"
//                   >
//                     Remove
//                   </Button>
//                 </div>
//               )
//             )}
//             <Button
//               onClick={() => {
//                 const newLinks = [
//                   ...(field.value as { text: string; url: string }[]),
//                   { text: "", url: "" },
//                 ];
//                 updateField(index, { value: newLinks });
//               }}
//               variant="outline"
//             >
//               Add Link
//             </Button>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Dynamic Footer Editor</h1>

//       {footerContent?.fields?.map((field, index) => (
//         <div key={index} className="border p-4 rounded-md">
//           <div className="flex justify-between items-center mb-2">
//             <Input
//               value={field.label}
//               onChange={(e) => updateField(index, { label: e.target.value })}
//               className="font-semibold"
//             />
//             <Button onClick={() => removeField(index)} variant="destructive">
//               Remove
//             </Button>
//           </div>
//           {renderField(field, index)}
//         </div>
//       ))}

//       <div className="flex justify-between items-center">
//         <Select onValueChange={(value: FieldType) => addField(value)}>
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
//     </form>
//   );
// }

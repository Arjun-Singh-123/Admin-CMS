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
import { BASE_API_URL } from "@/types/benefit-types";

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
const fetchFooterContent = async (): Promise<FooterContent> => {
  const response = await fetch(`${BASE_API_URL}/footer-content`);
  if (!response.ok) {
    throw new Error("Failed to fetch footer content");
  }
  return response.json();
};

const updateFooterContent = async (
  footerContent: FooterContent
): Promise<FooterContent> => {
  const response = await fetch(`${BASE_API_URL}/footer-content`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(footerContent),
  });
  if (!response.ok) {
    throw new Error("Failed to update footer content");
  }
  return response.json();
};

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

export default function DynamicFooterEditor() {
  const [dropdownKey, setDropdownKey] = useState(0);
  const queryClient = useQueryClient();

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
    console.log("checking label and updates received", label, updates);
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

      {Object?.entries(footerContent.content ?? {})?.map(([label, field]) => {
        return (
          <div key={label} className="border p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              {/* <Input
              //   value={field.label}
              value={field?.label?.replace(/\s\d+$/, "")}
              onChange={(e) => updateField(label, { label: e.target.value })}
              className="font-semibold"
            /> */}

              <Select
                key={dropdownKey}
                onValueChange={(value: FieldType) => {
                  console.log("value captured", value);
                  updateField(label, { label: value });
                }}
                defaultValue={field.label}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Add new field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="links">Links</SelectItem>
                  <SelectItem value="Copyright">Copyright</SelectItem>
                  <SelectItem value="Logo">Logo</SelectItem>
                  <SelectItem value="boat">boat</SelectItem>
                  <SelectItem value="Background Image">
                    Background Image
                  </SelectItem>
                  <SelectItem value="Service Area">Service Area</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={() => removeField(label)} variant="destructive">
                Remove
              </Button>
            </div>
            {renderField(label, field)}
          </div>
        );
      })}
    </form>
  );
}

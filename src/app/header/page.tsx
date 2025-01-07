"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DevTool } from "@hookform/devtools";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { supabase } from "@/lib/supabase";
import {
  Clock,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Trash,
  Twitter,
} from "lucide-react";
import {
  fetchHeaderNavItems,
  fetchHeaderNavSections,
} from "@/services/header-services";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import {
  deleteContactFromDB,
  deleteNavItemFromDB,
  fetchContactsFromDB,
  fetchHeaderNavItemsFromDB,
  fetchHeaderNavSectionsFromDB,
  insertContactInDB,
  insertNavItemToDB,
  updateContactInDB,
  updateNavItemInDB,
} from "@/lib/queries/navigation";

const navItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  href: z.string().min(1, "URL is required"),
  status: z.enum(["draft", "published"]),
  priority: z.number().nullable().optional(),
});

const navSectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  href: z.string().min(1, "URL is required"),
  status: z.enum(["draft", "published"]),
  slug: z.string().min(1, "Slug is required"),
  parent_id: z.string().optional(),
});

type NavItem = z.infer<typeof navItemSchema>;
type NavSection = z.infer<typeof navSectionSchema>;

const defaultNavSectionValues = {
  name: "",
  href: "",
  status: "draft" as "draft" | "published",
  slug: "",
  parent_id: undefined,
};

const defaultNavItems = {
  name: "",
  href: "",
  status: "draft" as "draft" | "published",
  priority: null,
};

// Updated contact schema based on the latest requirements

export const contactSchema = z.object({
  id: z.string().uuid().optional(),
  icon: z.string().nullable(),
  label: z.string().min(1, "Label is required"),
  value: z.string().optional(),
  type: z.enum([
    "phone",
    "hours",
    "location",
    "email",
    "support_email",
    "social",
    "login",
  ]),
  platform: z.enum(["facebook", "twitter", "instagram", "custom"]).nullable(),
  status: z.enum(["draft", "published"]).default("published"),
  position: z.enum(["left", "right"]).default("left"),
  button_style: z.enum(["primary", "secondary", "outline"]).nullable(),
  display_order: z
    .number()
    .int()
    .min(0, "Display order must be a non-negative integer")
    .optional(),

  // created_at: z.date().optional(),
  // updated_at: z.date().optional(),
});

export type Contact = z.infer<typeof contactSchema>;

export const defaultContactValues: Partial<Contact> = {
  icon: null,
  label: "",
  value: "",
  type: "phone",
  platform: null,
  status: "published",
  position: "left",
  button_style: null,
  display_order: 0,
};

export default function EnhancedMenuCMS() {
  // states for header
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImageHeader, setUploadingImageHeader] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  // ##
  const [editingNavItem, setEditingNavItem] = useState<string | null>(null);
  const [editingNavSection, setEditingNavSection] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("header");
  const queryClient = useQueryClient();

  const navItemForm = useForm<NavItem>({
    resolver: zodResolver(navItemSchema),
    defaultValues: defaultNavItems,
  });

  const navSectionForm = useForm<NavSection>({
    resolver: zodResolver(navSectionSchema),
    defaultValues: defaultNavSectionValues,
  });

  const { data: navItems = [] } = useQuery({
    queryKey: ["navItems"],
    queryFn: () => fetchHeaderNavItemsFromDB(),
  });
  console.log(navItems);

  const { data: navSections = [] } = useQuery({
    queryKey: ["navSections"],
    queryFn: () => fetchHeaderNavSectionsFromDB(),
  });

  console.log(navSections);
  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: Contact) => {
      console.log("Mutation function called with data:", data);
      if (editingId) {
        await updateContactInDB(editingId, data);
      } else {
        await insertContactInDB(data);
      }
    },

    // mutationFn: async (data: Contact) => {
    //   console.log("Mutation function called with data:", data);
    //   if (editingId) {
    //     const { error } = await supabase
    //       .from("contacts")
    //       .update(data)
    //       .eq("id", editingId);
    //     if (error) throw error;
    //   } else {
    //     const { error } = await supabase.from("contacts").insert(data);
    //     if (error) throw error;
    //   }
    // },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      {
        editingId && toast.success("Contact updated successfully");
      }
      {
        !editingId && toast.success("Contact created successfully");
      }
      setEditingId(null);
      form.reset(defaultContactValues);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContactFromDB,

    // async (id: string) => {
    //   const { error } = await supabase.from("contacts").delete().eq("id", id);
    //   if (error) throw error;
    // },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.error("Contact deleted The contact has been deleted successfully.");
    },
    // onError : (error)=>{
    //   if(error.name === "AbortError")
    // }
  });

  const form = useForm<Contact>({
    resolver: zodResolver(contactSchema),
    defaultValues: defaultContactValues,
  });

  const { errors } = form.formState;
  console.log("Validation errors:", errors); // Log validation errors

  // images header

  const handleImageUploadNew = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImageHeader(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `header-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("images").getPublicUrl(filePath);

      if (data?.publicUrl) {
        form.setValue("icon", data.publicUrl);
        toast("Image uploaded The image has been uploaded successfully.");
      }
    } catch (error) {
      toast("Failed to upload image. Please try again.");
    } finally {
      setUploadingImageHeader(false);
    }
  };

  const navItemMutation = useMutation({
    // mutationFn: async (data: NavItem) => {
    //   if (editingNavItem) {
    //     const { error } = await supabase
    //       .from("nav_items")
    //       .update(data)
    //       .eq("id", editingNavItem);
    //     if (error) throw error;
    //   } else {
    //     const { error } = await supabase.from("nav_items").insert(data);
    //     if (error) throw error;
    //   }
    // },

    mutationFn: async (data: NavItem) => {
      if (editingNavItem) {
        await updateNavItemInDB(editingNavItem, data);
      } else {
        await insertNavItemToDB(data);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navItems"] });
      toast.success(
        editingNavItem
          ? "Nav item updated successfully"
          : "Nav item added successfully"
      );
      setEditingNavItem(null);
      navItemForm.reset(defaultNavItems);
    },
  });

  const navSectionMutation = useMutation({
    mutationFn: async (data: NavSection) => {
      if (editingNavSection) {
        const { error } = await supabase
          .from("nav_sections")
          .update(data)
          .eq("id", editingNavSection);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("nav_sections").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navItems"] });
      queryClient.invalidateQueries({ queryKey: ["navSections"] });
      toast.success(
        editingNavSection
          ? "Nav section updated successfully"
          : "Nav section added successfully"
      );
      setEditingNavSection(null);
      navSectionForm.reset(defaultNavSectionValues);
    },
  });

  const deleteNavItemMutation = useMutation({
    mutationFn: deleteNavItemFromDB,
    //
    //  async (id: string) => {
    //   const { error } = await supabase.from("nav_items").delete().eq("id", id);
    //   if (error) throw error;
    // },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navItems"] });
      toast.success("Nav item deleted successfully");
    },
  });

  const deleteNavSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("nav_sections")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navItems"] });
      queryClient.invalidateQueries({ queryKey: ["navSections"] });
      toast.success("Nav section deleted successfully");
    },
  });

  const filteredNavItems = navItems?.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNavSections = navSections.filter((section) =>
    section.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIconComponent = (type: string, platform?: string) => {
    switch (type) {
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "hours":
        return <Clock className="h-4 w-4" />;
      case "location":
        return <MapPin className="h-4 w-4" />;
      case "email":
      case "support_email":
        return <Mail className="h-4 w-4" />;
      case "social":
        switch (platform) {
          case "facebook":
            return <Facebook className="h-4 w-4" />;
          case "twitter":
            return <Twitter className="h-4 w-4" />;
          case "instagram":
            return <Instagram className="h-4 w-4" />;
          default:
            return <Globe className="h-4 w-4" />;
        }
      default:
        return null;
    }
  };

  const onSubmit = (data: Contact) => {
    // Remove any undefined or null values
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v != null)
    );
    mutation.mutate(cleanedData as Contact);
  };
  return (
    <div className="space-y-6">
      <DevTool control={form.control} />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="header">Header Details</TabsTrigger>
          <TabsTrigger value="items">Navigation Items</TabsTrigger>
          <TabsTrigger value="sections">Navigation Sections</TabsTrigger>
        </TabsList>
        <TabsContent value="header" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information CMS</CardTitle>
              <CardDescription>
                Manage your contact information, business hours, location
                details, social media links, and login button.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value === "social") {
                              form.setValue("platform", "facebook");
                            } else if (value === "login") {
                              form.setValue("button_style", "primary");
                              form.setValue("position", "right");
                            } else {
                              form.setValue("platform", "custom");
                              form.setValue("button_style", "outline");
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="location">Location</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="support_email">
                              Support Email
                            </SelectItem>
                            <SelectItem value="social">Social Media</SelectItem>
                            <SelectItem value="login">Login Button</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("type") === "social" && (
                    <FormField
                      control={form.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value as string}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="instagram">
                                Instagram
                              </SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("type") === "login" && (
                    <FormField
                      control={form.control}
                      name="button_style"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Style</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value as string}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="primary">Primary</SelectItem>
                              {/* <SelectItem value="secondary">
                                Secondary
                              </SelectItem> */}
                              <SelectItem value="outline">Outline</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Label</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              form.watch("type") === "login"
                                ? "Login"
                                : "Enter label"
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch("type") === "login" ? "URL" : "Value"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              form.watch("type") === "login"
                                ? "Enter login URL"
                                : "Enter value"
                            }
                            type={
                              form.watch("type") === "login" ? "text" : "text"
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="display_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Enter display order"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value, 10))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("type") !== "login" && (
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUploadNew}
                        disabled={uploadingImageHeader}
                      />
                    </div>
                  )}

                  <Button type="submit" disabled={mutation.isPending}>
                    {editingId ? "Update" : "Create"} Entry
                  </Button>
                </form>
              </Form>

              <div className="mt-8 space-y-4">
                {contacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        {getIconComponent(
                          contact.type,
                          contact.platform as string
                        )}
                        <div>
                          <p className="font-medium">{contact.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {contact.type === "login" ? "URL: " : ""}
                            {contact.value}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Type: {contact.type}
                            {contact.button_style
                              ? `, Style: ${contact.button_style}`
                              : ""}
                            , Position: {contact.position}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {/* {contact.type === "login" && (
                          <Button
                            variant={
                              contact.buttonStyle as
                                | "primary"
                                | "secondary"
                                | "outline"
                            }
                            size="sm"
                            asChild
                          >
                            <a
                              href={contact.value}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Preview
                            </a>
                          </Button>
                        )} */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(contact.id);
                            form.reset(contact as any);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          // onClick={() => {
                          //   if (
                          //     window.confirm(
                          //       "Are you sure you want to delete this entry?"
                          //     )
                          //   ) {
                          //     deleteMutation.mutate(contact.id);
                          //   }
                          // }}

                          onClick={() => {
                            setDeleteDialogOpen(true);
                            setContactToDelete(contact.id);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingNavItem
                  ? "Edit Navigation Item"
                  : "Add New Navigation Item"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...navItemForm}>
                <form
                  onSubmit={navItemForm.handleSubmit((data) =>
                    navItemMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={navItemForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Navigation item name"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the name for this navigation item.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={navItemForm.control}
                    name="href"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input placeholder="/example-url" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the URL for this navigation item.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={navItemForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Set the status of this navigation item.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={navItemForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Priority ..."
                            value={field.value?.toString() ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? null : Number(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the Priority for this navigation item.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">
                    {editingNavItem
                      ? "Update Navigation Item"
                      : "Add Navigation Item"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Navigation Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search navigation items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[400px]">
                {filteredNavItems.map((item) => (
                  <Card key={item.id} className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.href}</p>
                          <p className="text-sm text-gray-500">
                            Status: {item.status}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingNavItem(item.id);
                              navItemForm.reset(item as any);
                            }}
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive">Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the navigation item and all
                                  its associated sections.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteNavItemMutation.mutate(item.id)
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingNavSection
                  ? "Edit Navigation Section"
                  : "Add New Navigation Section"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...navSectionForm}>
                <form
                  onSubmit={navSectionForm.handleSubmit((data) =>
                    navSectionMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={navSectionForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Navigation section name"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the name for this navigation section.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={navSectionForm.control}
                    name="href"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input placeholder="/example-url" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the URL for this navigation section.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={navSectionForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="navigation-section-slug"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the slug for this navigation section.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={navSectionForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Set the status of this navigation section.
                        </FormDescription>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={navSectionForm.control}
                    name="parent_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Navigation Item</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a parent item" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {navItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the parent navigation item for this section
                          (optional).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">
                    {editingNavSection
                      ? "Update Navigation Section"
                      : "Add Navigation Section"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Navigation Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search navigation sections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[400px]">
                {filteredNavSections.map((section) => (
                  <Card key={section.id} className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {section.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {section.href}
                          </p>
                          <p className="text-sm text-gray-500">
                            Slug: {section.slug}
                          </p>
                          <p className="text-sm text-gray-500">
                            Status: {section.status}
                          </p>
                          <p className="text-sm text-gray-500">
                            Parent:{" "}
                            {navItems.find(
                              (item) => item.id === section.parent_id
                            )?.name || "None"}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingNavSection(section.id);
                              navSectionForm.reset(section as any);
                            }}
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive">Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the navigation section and
                                  all its associated products.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteNavSectionMutation.mutate(section.id)
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          if (contactToDelete) {
            deleteMutation.mutate(contactToDelete);
            setDeleteDialogOpen(false);
            setContactToDelete(null);
          }
        }}
      />
    </div>
  );
}

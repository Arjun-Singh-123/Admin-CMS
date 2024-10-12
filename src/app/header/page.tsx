"use client";

import React, { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash2, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface NavItem {
  id?: string;
  name: string;
  href: string;
  status: "draft" | "published";
}

interface NavSection {
  id?: string;
  name: string;
  href: string;
  status: "draft" | "published";
  nav_item_id: string | null;
}

interface NavSubsection {
  id?: string;
  name: string;
  href: string;
  section_id: string;
  status: "draft" | "published";
}

// API functions
const getNavItems = async (): Promise<NavItem[]> => {
  const { data, error } = await supabase
    .from("nav_items")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
};

const getNavSections = async (): Promise<NavSection[]> => {
  const { data, error } = await supabase
    .from("nav_sections")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
};

const getNavSubsections = async (): Promise<NavSubsection[]> => {
  const { data, error } = await supabase
    .from("nav_subsections")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
};

const addNavItem = async (item: NavItem): Promise<NavItem> => {
  const { data, error } = await supabase
    .from("nav_items")
    .insert(item)
    .single();
  if (error) throw error;
  return data;
};

const addNavSection = async (section: NavSection): Promise<NavSection> => {
  const { data, error } = await supabase
    .from("nav_sections")
    .insert(section)
    .single();
  if (error) throw error;
  return data;
};

const addNavSubsection = async (
  subsection: NavSubsection
): Promise<NavSubsection> => {
  const { data, error } = await supabase
    .from("nav_subsections")
    .insert(subsection)
    .single();
  if (error) throw error;
  return data;
};

const deleteNavItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from("nav_items").delete().match({ id });
  if (error) throw error;
};

const deleteNavSection = async (id: string): Promise<void> => {
  const { error } = await supabase.from("nav_sections").delete().match({ id });
  if (error) throw error;
};

const deleteNavSubsection = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("nav_subsections")
    .delete()
    .match({ id });
  if (error) throw error;
};

const updateItemStatus = async (
  table: string,
  id: string,
  status: "draft" | "published"
): Promise<void> => {
  const { error } = await supabase.from(table).update({ status }).match({ id });
  if (error) throw error;
};

const updateNavSectionMenuItem = async (
  sectionId: string,
  navItemId: string | null
): Promise<void> => {
  const { error } = await supabase
    .from("nav_sections")
    .update({ nav_item_id: navItemId })
    .match({ id: sectionId });
  if (error) throw error;
};

// Create a client

export default function EnhancedMenuCMS() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [newNavItem, setNewNavItem] = useState<NavItem>({
    name: "",
    href: "",
    status: "draft",
  });
  const [newNavSection, setNewNavSection] = useState<NavSection>({
    name: "",
    href: "",
    status: "draft",
    nav_item_id: null,
  });
  const [newNavSubsection, setNewNavSubsection] = useState<NavSubsection>({
    name: "",
    href: "",
    section_id: "",
    status: "draft",
  });

  const { data: navItems } = useQuery({
    queryKey: ["navItems"],
    queryFn: getNavItems,
  });
  const { data: navSections } = useQuery({
    queryKey: ["navSections"],
    queryFn: getNavSections,
  });
  const { data: navSubsections } = useQuery({
    queryKey: ["navSubsections"],
    queryFn: getNavSubsections,
  });

  // Mutations
  const addNavItemMutation = useMutation({
    mutationFn: addNavItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navItems"] });
      setNewNavItem({ name: "", href: "", status: "draft" });
    },
  });

  const addNavSectionMutation = useMutation({
    mutationFn: addNavSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navSections"] });
      setNewNavSection({
        name: "",
        href: "",
        status: "draft",
        nav_item_id: null,
      });
    },
  });

  const addNavSubsectionMutation = useMutation({
    mutationFn: addNavSubsection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navSubsections"] });
      setNewNavSubsection({
        name: "",
        href: "",
        section_id: "",
        status: "draft",
      });
    },
  });

  const deleteNavItemMutation = useMutation({
    mutationFn: deleteNavItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navItems", "navSections"] });
    },
  });

  const deleteNavSectionMutation = useMutation({
    mutationFn: deleteNavSection,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["navSections", "navSubsections"],
      });
    },
  });

  const deleteNavSubsectionMutation = useMutation({
    mutationFn: deleteNavSubsection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navSubsections"] });
    },
  });

  const updateItemStatusMutation = useMutation({
    mutationFn: ({
      table,
      id,
      status,
    }: {
      table: string;
      id: string;
      status: "draft" | "published";
    }) => updateItemStatus(table, id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.table] });
    },
  });

  const updateNavSectionMenuItemMutation = useMutation({
    mutationFn: ({
      sectionId,
      navItemId,
    }: {
      sectionId: string;
      navItemId: string | null;
    }) => updateNavSectionMenuItem(sectionId, navItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navSections"] });
    },
  });

  const filteredNavSections =
    navSections?.filter((section) =>
      section.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6"> Menu CMS</h1>

      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="nav-items">
          <AccordionTrigger>Navigation Items</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Add Navigation Item</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input
                    placeholder="Name"
                    value={newNavItem.name}
                    onChange={(e) =>
                      setNewNavItem({ ...newNavItem, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="URL"
                    value={newNavItem.href}
                    onChange={(e) =>
                      setNewNavItem({ ...newNavItem, href: e.target.value })
                    }
                  />
                </div>
                <Button
                  onClick={() => addNavItemMutation.mutate(newNavItem)}
                  className="w-full"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Navigation Item
                </Button>
              </CardContent>
            </Card>
            <ScrollArea className="h-[300px] mt-4">
              {navItems?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 border-b"
                >
                  <span>
                    {item.name} - {item.href}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={item.status === "published"}
                      onCheckedChange={(checked) =>
                        updateItemStatusMutation.mutate({
                          table: "nav_items",
                          id: item.id || "",
                          status: checked ? "published" : "draft",
                        })
                      }
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        deleteNavItemMutation.mutate(item.id || "")
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="nav-sections">
          <AccordionTrigger>Navigation Sections</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Add Navigation Section</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input
                    placeholder="Name"
                    value={newNavSection.name}
                    onChange={(e) =>
                      setNewNavSection({
                        ...newNavSection,
                        name: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="URL"
                    value={newNavSection.href}
                    onChange={(e) =>
                      setNewNavSection({
                        ...newNavSection,
                        href: e.target.value,
                      })
                    }
                  />
                  <Select
                    value={newNavSection.nav_item_id || ""}
                    onValueChange={(value) =>
                      setNewNavSection({ ...newNavSection, nav_item_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Menu Item" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {navItems?.map((item) => (
                        <SelectItem key={item.id} value={item.id || ""}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => addNavSectionMutation.mutate(newNavSection)}
                  className="w-full"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Navigation Section
                </Button>
              </CardContent>
            </Card>
            <div className="relative mb-4 mt-4">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <ScrollArea className="h-[200px]">
              {filteredNavSections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-2 border-b"
                >
                  <span>
                    {section.name} - {section.href}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={section.nav_item_id || ""}
                      onValueChange={(value) =>
                        updateNavSectionMenuItemMutation.mutate({
                          sectionId: section.id || "",
                          navItemId: value || null,
                        })
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Menu Item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        {navItems?.map((item) => (
                          <SelectItem key={item.id} value={item.id || ""}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Switch
                      checked={section.status === "published"}
                      onCheckedChange={(checked) =>
                        updateItemStatusMutation.mutate({
                          table: "nav_sections",
                          id: section.id || "",
                          status: checked ? "published" : "draft",
                        })
                      }
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        deleteNavSectionMutation.mutate(section.id || "")
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="nav-subsections">
          <AccordionTrigger>Navigation Subsections</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Add Navigation Subsection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input
                    placeholder="Name"
                    value={newNavSubsection.name}
                    onChange={(e) =>
                      setNewNavSubsection({
                        ...newNavSubsection,
                        name: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="URL"
                    value={newNavSubsection.href}
                    onChange={(e) =>
                      setNewNavSubsection({
                        ...newNavSubsection,
                        href: e.target.value,
                      })
                    }
                  />
                  <Select
                    value={newNavSubsection.section_id}
                    onValueChange={(value) =>
                      setNewNavSubsection({
                        ...newNavSubsection,
                        section_id: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {navSections?.map((section) => (
                        <SelectItem key={section.id} value={section.id || ""}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() =>
                    addNavSubsectionMutation.mutate(newNavSubsection)
                  }
                  className="w-full"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Subsection
                </Button>
              </CardContent>
            </Card>
            <ScrollArea className="h-[200px] mt-4">
              {navSubsections?.map((subsection) => (
                <div
                  key={subsection.id}
                  className="flex items-center justify-between p-2 border-b"
                >
                  <span>
                    {subsection.name} - {subsection.href} (Section:{" "}
                    {
                      navSections?.find((s) => s.id === subsection.section_id)
                        ?.name
                    }
                    )
                  </span>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={subsection.status === "published"}
                      onCheckedChange={(checked) =>
                        updateItemStatusMutation.mutate({
                          table: "nav_subsections",
                          id: subsection.id || "",
                          status: checked ? "published" : "draft",
                        })
                      }
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        deleteNavSubsectionMutation.mutate(subsection.id || "")
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// "use client";
// import React, { useState, useEffect } from "react";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { PlusCircle, Trash2 } from "lucide-react";
// import { supabase } from "@/lib/supabase";

// interface MenuItem {
//   name: string;
//   href: string;
//   parent_id: string | null;
//   order_index: number;
// }

// interface Category {
//   name: string;
//   href: string;
//   order_index: number;
// }

// interface Subcategory {
//   name: string;
//   href: string;
//   category_id: string;
//   order_index: number;
// }

// export default function MenuCMS() {
//   const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
//   const [newMenuItem, setNewMenuItem] = useState<MenuItem>({
//     name: "",
//     href: "",
//     parent_id: null,
//     order_index: 0,
//   });
//   const [newCategory, setNewCategory] = useState<Category>({
//     name: "",
//     href: "",
//     order_index: 0,
//   });
//   const [newSubcategory, setNewSubcategory] = useState<Subcategory>({
//     name: "",
//     href: "",
//     category_id: "",
//     order_index: 0,
//   });

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     const { data: menuData } = await supabase
//       .from("menu_itemsd")
//       .select("*")
//       .order("order_index");
//     const { data: categoryData } = await supabase
//       .from("categoriesd")
//       .select("*")
//       .order("order_index");
//     const { data: subcategoryData } = await supabase
//       .from("subcategoriesd")
//       .select("*")
//       .order("order_index");

//     setMenuItems(menuData || []);
//     setCategories(categoryData || []);
//     setSubcategories(subcategoryData || []);
//   };

//   const addMenuItem = async () => {
//     const { data, error } = await supabase
//       .from("menu_itemsd")
//       .insert({ ...newMenuItem });
//     if (error) console.error("Error adding menu item:", error);
//     else {
//       setMenuItems([
//         ...menuItems,
//         data?.[0] ?? { name: "", href: "", parent_id: null, order_index: 0 },
//       ]);
//       setNewMenuItem({ name: "", href: "", parent_id: null, order_index: 0 });
//     }
//   };

//   const addCategory = async () => {
//     const { data, error } = await supabase
//       .from("categoriesd")
//       .insert({ ...newCategory });
//     if (error) console.error("Error adding category:", error);
//     else {
//       setCategories([
//         ...categories,
//         data?.[0] ?? {
//           name: "",
//           href: "",

//           order_index: 0,
//         },
//       ]);
//       setNewCategory({ name: "", href: "", order_index: 0 });
//     }
//   };

//   const addSubcategory = async () => {
//     const { data, error } = await supabase
//       .from("subcategoriesd")
//       .insert({ ...newSubcategory });
//     if (error) console.error("Error adding subcategory:", error);
//     else {
//       setSubcategories([...subcategories, data?.[0] as {}]);
//       setNewSubcategory({ name: "", href: "", category_id: "",order_index:0 });
//     }
//   };

//   const deleteMenuItem = async (id) => {
//     const { error } = await supabase.from("menu_itemsd").delete().match({ id });
//     if (error) console.error("Error deleting menu item:", error);
//     else setMenuItems(menuItems.filter((item) => item.id !== id));
//   };

//   const deleteCategory = async (id) => {
//     const { error } = await supabase.from("categoriesd").delete().match({ id });
//     if (error) console.error("Error deleting category:", error);
//     else {
//       setCategories(categories.filter((category) => category.id !== id));
//       setSubcategories(
//         subcategories.filter((subcategory) => subcategory.category_id !== id)
//       );
//     }
//   };

//   const deleteSubcategory = async (id) => {
//     const { error } = await supabase
//       .from("subcategoriesd")
//       .delete()
//       .match({ id });
//     if (error) console.error("Error deleting subcategory:", error);
//     else
//       setSubcategories(
//         subcategories.filter((subcategory) => subcategory.id !== id)
//       );
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6">Menu CMS</h1>

//       <Accordion type="single" collapsible className="mb-6">
//         <AccordionItem value="menu-items">
//           <AccordionTrigger>Menu Items</AccordionTrigger>
//           <AccordionContent>
//             <Card>
//               <CardHeader>
//                 <CardTitle>Add Menu Item</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex space-x-2 mb-4">
//                   <Input
//                     placeholder="Name"
//                     value={newMenuItem.name}
//                     onChange={(e) =>
//                       setNewMenuItem({ ...newMenuItem, name: e.target.value })
//                     }
//                   />
//                   <Input
//                     placeholder="URL"
//                     value={newMenuItem.href}
//                     onChange={(e) =>
//                       setNewMenuItem({ ...newMenuItem, href: e.target.value })
//                     }
//                   />
//                   <Button onClick={addMenuItem}>
//                     <PlusCircle className="mr-2 h-4 w-4" /> Add
//                   </Button>
//                 </div>
//                 {menuItems.map((item) => (
//                   <div
//                     key={item.id}
//                     className="flex items-center justify-between p-2 border-b"
//                   >
//                     <span>
//                       {item.name} - {item.href}
//                     </span>
//                     <Button
//                       variant="destructive"
//                       size="sm"
//                       onClick={() => deleteMenuItem(item.id)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </AccordionContent>
//         </AccordionItem>

//         <AccordionItem value="categories">
//           <AccordionTrigger>Categories</AccordionTrigger>
//           <AccordionContent>
//             <Card>
//               <CardHeader>
//                 <CardTitle>Add Category</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex space-x-2 mb-4">
//                   <Input
//                     placeholder="Name"
//                     value={newCategory.name}
//                     onChange={(e) =>
//                       setNewCategory({ ...newCategory, name: e.target.value })
//                     }
//                   />
//                   <Input
//                     placeholder="URL"
//                     value={newCategory.href}
//                     onChange={(e) =>
//                       setNewCategory({ ...newCategory, href: e.target.value })
//                     }
//                   />
//                   <Button onClick={addCategory}>
//                     <PlusCircle className="mr-2 h-4 w-4" /> Add
//                   </Button>
//                 </div>
//                 {categories.map((category) => (
//                   <div
//                     key={category.id}
//                     className="flex items-center justify-between p-2 border-b"
//                   >
//                     <span>
//                       {category.name} - {category.href}
//                     </span>
//                     <Button
//                       variant="destructive"
//                       size="sm"
//                       onClick={() => deleteCategory(category.id)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </AccordionContent>
//         </AccordionItem>

//         <AccordionItem value="subcategories">
//           <AccordionTrigger>Subcategories</AccordionTrigger>
//           <AccordionContent>
//             <Card>
//               <CardHeader>
//                 <CardTitle>Add Subcategory</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex space-x-2 mb-4">
//                   <Input
//                     placeholder="Name"
//                     value={newSubcategory.name}
//                     onChange={(e) =>
//                       setNewSubcategory({
//                         ...newSubcategory,
//                         name: e.target.value,
//                       })
//                     }
//                   />
//                   <Input
//                     placeholder="URL"
//                     value={newSubcategory.href}
//                     onChange={(e) =>
//                       setNewSubcategory({
//                         ...newSubcategory,
//                         href: e.target.value,
//                       })
//                     }
//                   />
//                   <select
//                     className="border rounded px-2 py-1"
//                     value={newSubcategory.category_id}
//                     onChange={(e) =>
//                       setNewSubcategory({
//                         ...newSubcategory,
//                         category_id: e.target.value,
//                       })
//                     }
//                   >
//                     <option value="">Select Category</option>
//                     {categories.map((category) => (
//                       <option key={category.id} value={category.id}>
//                         {category.name}
//                       </option>
//                     ))}
//                   </select>
//                   <Button onClick={addSubcategory}>
//                     <PlusCircle className="mr-2 h-4 w-4" /> Add
//                   </Button>
//                 </div>
//                 {subcategories?.map((subcategory) => (
//                   <div
//                     key={subcategory.id}
//                     className="flex items-center justify-between p-2 border-b"
//                   >
//                     <span>
//                       {subcategory.name} - {subcategory.href} (Category:{" "}
//                       {
//                         categories.find((c) => c.id === subcategory.category_id)
//                           ?.name
//                       }
//                       )
//                     </span>
//                     <Button
//                       variant="destructive"
//                       size="sm"
//                       onClick={() => deleteSubcategory(subcategory.id)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </AccordionContent>
//         </AccordionItem>
//       </Accordion>
//     </div>
//   );
// }

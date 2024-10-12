"use client";
import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PlusCircle, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface MenuItem {
  name: string;
  href: string;
  parent_id: string | null;
  order_index: number;
}

interface Category {
  name: string;
  href: string;
  order_index: number;
}

interface Subcategory {
  name: string;
  href: string;
  category_id: string;
  order_index: number;
}

export default function MenuCMS() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [newMenuItem, setNewMenuItem] = useState<MenuItem>({
    name: "",
    href: "",
    parent_id: null,
    order_index: 0,
  });
  const [newCategory, setNewCategory] = useState<Category>({
    name: "",
    href: "",
    order_index: 0,
  });
  const [newSubcategory, setNewSubcategory] = useState<Subcategory>({
    name: "",
    href: "",
    category_id: "",
    order_index: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: menuData } = await supabase
      .from("menu_itemsd")
      .select("*")
      .order("order_index");
    const { data: categoryData } = await supabase
      .from("categoriesd")
      .select("*")
      .order("order_index");
    const { data: subcategoryData } = await supabase
      .from("subcategoriesd")
      .select("*")
      .order("order_index");

    setMenuItems(menuData || []);
    setCategories(categoryData || []);
    setSubcategories(subcategoryData || []);
  };

  const addMenuItem = async () => {
    const { data, error } = await supabase
      .from("menu_itemsd")
      .insert({ ...newMenuItem });
    if (error) console.error("Error adding menu item:", error);
    else {
      setMenuItems([
        ...menuItems,
        data?.[0] ?? { name: "", href: "", parent_id: null, order_index: 0 },
      ]);
      setNewMenuItem({ name: "", href: "", parent_id: null, order_index: 0 });
    }
  };

  const addCategory = async () => {
    const { data, error } = await supabase
      .from("categoriesd")
      .insert({ ...newCategory });
    if (error) console.error("Error adding category:", error);
    else {
      setCategories([
        ...categories,
        data?.[0] ?? {
          name: "",
          href: "",

          order_index: 0,
        },
      ]);
      setNewCategory({ name: "", href: "", order_index: 0 });
    }
  };

  const addSubcategory = async () => {
    const { data, error } = await supabase
      .from("subcategoriesd")
      .insert({ ...newSubcategory });
    if (error) console.error("Error adding subcategory:", error);
    else {
      setSubcategories([...subcategories, data[0]]);
      setNewSubcategory({ name: "", href: "", category_id: "" });
    }
  };

  const deleteMenuItem = async (id) => {
    const { error } = await supabase.from("menu_itemsd").delete().match({ id });
    if (error) console.error("Error deleting menu item:", error);
    else setMenuItems(menuItems.filter((item) => item.id !== id));
  };

  const deleteCategory = async (id) => {
    const { error } = await supabase.from("categoriesd").delete().match({ id });
    if (error) console.error("Error deleting category:", error);
    else {
      setCategories(categories.filter((category) => category.id !== id));
      setSubcategories(
        subcategories.filter((subcategory) => subcategory.category_id !== id)
      );
    }
  };

  const deleteSubcategory = async (id) => {
    const { error } = await supabase
      .from("subcategoriesd")
      .delete()
      .match({ id });
    if (error) console.error("Error deleting subcategory:", error);
    else
      setSubcategories(
        subcategories.filter((subcategory) => subcategory.id !== id)
      );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Menu CMS</h1>

      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="menu-items">
          <AccordionTrigger>Menu Items</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Add Menu Item</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  <Input
                    placeholder="Name"
                    value={newMenuItem.name}
                    onChange={(e) =>
                      setNewMenuItem({ ...newMenuItem, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="URL"
                    value={newMenuItem.href}
                    onChange={(e) =>
                      setNewMenuItem({ ...newMenuItem, href: e.target.value })
                    }
                  />
                  <Button onClick={addMenuItem}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 border-b"
                  >
                    <span>
                      {item.name} - {item.href}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMenuItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Add Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  <Input
                    placeholder="Name"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="URL"
                    value={newCategory.href}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, href: e.target.value })
                    }
                  />
                  <Button onClick={addCategory}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-2 border-b"
                  >
                    <span>
                      {category.name} - {category.href}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="subcategories">
          <AccordionTrigger>Subcategories</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Add Subcategory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  <Input
                    placeholder="Name"
                    value={newSubcategory.name}
                    onChange={(e) =>
                      setNewSubcategory({
                        ...newSubcategory,
                        name: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="URL"
                    value={newSubcategory.href}
                    onChange={(e) =>
                      setNewSubcategory({
                        ...newSubcategory,
                        href: e.target.value,
                      })
                    }
                  />
                  <select
                    className="border rounded px-2 py-1"
                    value={newSubcategory.category_id}
                    onChange={(e) =>
                      setNewSubcategory({
                        ...newSubcategory,
                        category_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <Button onClick={addSubcategory}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
                {subcategories?.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className="flex items-center justify-between p-2 border-b"
                  >
                    <span>
                      {subcategory.name} - {subcategory.href} (Category:{" "}
                      {
                        categories.find((c) => c.id === subcategory.category_id)
                          ?.name
                      }
                      )
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSubcategory(subcategory.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

"use client";
import React, { useState } from "react";
 import {
  useMenuItems,
  useCategories,
  useSubcategories,
  useProducts,
  useCreateItem,
  useUpdateItem,
} from "../../lib/service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CMS() {
  const [activeTab, setActiveTab] = useState("menu_items");
  const [formData, setFormData] = useState({});

  const { data: menuItems } = useMenuItems();
  const { data: categories } = useCategories();
  const { data: subcategories } = useSubcategories();
  const { data: products } = useProducts();

  const createMutation = useCreateItem(activeTab);
  const updateMutation = useUpdateItem(activeTab);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
    setFormData({});
  };

  const handleStatusChange = (id, newStatus) => {
    updateMutation.mutate({ id, updates: { status: newStatus } });
  };

  const renderForm = () => {
    switch (activeTab) {
      case "menu_items":
      case "categories":
      case "subcategories":
        return (
          <>
            <Input
              name="name"
              placeholder="Name"
              onChange={handleInputChange}
              value={formData.name || ""}
            />
            <Input
              name="href"
              placeholder="Href"
              onChange={handleInputChange}
              value={formData.href || ""}
            />
            {activeTab === "categories" && (
              <Select
                name="menu_item_id"
                onChange={handleInputChange}
                value={formData.menu_item_id || ""}
              >
                <option value="">Select Menu Item</option>
                {menuItems?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            )}
            {activeTab === "subcategories" && (
              <Select
                name="category_id"
                onChange={handleInputChange}
                value={formData.category_id || ""}
              >
                <option value="">Select Category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            )}
          </>
        );
      case "products":
        return (
          <>
            <Input
              name="name"
              placeholder="Name"
              onChange={handleInputChange}
              value={formData.name || ""}
            />
            <Input
              name="price"
              type="number"
              placeholder="Price"
              onChange={handleInputChange}
              value={formData.price || ""}
            />
            <Input
              name="description"
              placeholder="Description"
              onChange={handleInputChange}
              value={formData.description || ""}
            />
            <Select
              name="subcategory_id"
              onChange={handleInputChange}
              value={formData.subcategory_id || ""}
            >
              <option value="">Select Subcategory</option>
              {subcategories?.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </Select>
            <Input
              name="details"
              placeholder="Details (JSON)"
              onChange={handleInputChange}
              value={formData.details || ""}
            />
          </>
        );
      default:
        return null;
    }
  };

  const renderItems = (items) => {
    return items?.map((item) => (
      <div
        key={item.id}
        className="flex justify-between items-center bg-secondary p-2 rounded mb-2"
      >
        <span>{item.name}</span>
        <div>
          <Button
            onClick={() =>
              handleStatusChange(
                item.id,
                item.status === "draft" ? "published" : "draft"
              )
            }
            variant={item.status === "published" ? "default" : "outline"}
            size="sm"
          >
            {item.status === "published" ? "Published" : "Draft"}
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>CMS</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="menu_items">Menu Items</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>
          <TabsContent value="menu_items">{renderItems(menuItems)}</TabsContent>
          <TabsContent value="categories">
            {renderItems(categories)}
          </TabsContent>
          <TabsContent value="subcategories">
            {renderItems(subcategories)}
          </TabsContent>
          <TabsContent value="products">{renderItems(products)}</TabsContent>
        </Tabs>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {renderForm()}
          <Button type="submit">Add Item</Button>
        </form>
      </CardContent>
    </Card>
  );
}

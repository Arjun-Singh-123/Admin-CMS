"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DevTool } from "@hookform/devtools";
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

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string(),
  price: z.number().min(0, "Price must be non-negative"),
  nav_subsection_id: z.string().min(1, "Navigation subsection is required"),
});

const productDetailSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().min(1, "Product is required"),
  title: z.string().min(2, "Title must be at least 2 characters."),
  subtitle: z.string(),
  description: z.string(),
  hero_image: z.array(z.string().url("Invalid URL for hero image")),
  icon: z.string().url("Invalid URL for icon"),
  images: z.object({
    internal: z.array(z.string().url("Invalid URL for internal image")),
    external: z.array(z.string().url("Invalid URL for external image")),
  }),
  amenities: z.array(
    z.object({
      feature: z.string().min(1, "Feature is required"),
      value: z.string().min(1, "Value is required"),
    })
  ),
  specifications: z.record(z.record(z.string())),
});

type Product = z.infer<typeof productSchema>;
type ProductDetail = z.infer<typeof productDetailSchema>;

const fetchProducts = async () => {
  const { data, error } = await supabase.from("products").select("*");
  if (error) throw error;
  return data;
};

const fetchProductDetails = async () => {
  const { data, error } = await supabase.from("product_details").select("*");
  if (error) throw error;
  return data;
};

const fetchNavSubsections = async () => {
  const { data, error } = await supabase.from("nav_subsections").select("*");
  if (error) throw error;
  return data;
};

export default function ProductManagement() {
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingProductDetail, setEditingProductDetail] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState("products"); // Default active tab
  const [specCategories, setSpecCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Queries
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: productDetails = [] } = useQuery({
    queryKey: ["productDetails"],
    queryFn: fetchProductDetails,
  });

  const { data: navSubsections = [] } = useQuery({
    queryKey: ["navSubsections"],
    queryFn: fetchNavSubsections,
  });

  // Product Mutation
  const productMutation = useMutation({
    mutationFn: async (data) => {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(data as any)
          .eq("id", editingProduct);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(data as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditingProduct(null);
    },
  });

  // Product Detail Mutation
  const productDetailMutation = useMutation({
    mutationFn: async (data) => {
      if (editingProductDetail) {
        const { error } = await supabase
          .from("product_details")
          .update(data as any)
          .eq("id", editingProductDetail);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("product_details")
          .insert(data as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productDetails"] });
      setEditingProductDetail(null);
    },
  });

  const productForm = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      nav_subsection_id: "",
    },
  });

  const productDetailForm = useForm<ProductDetail>({
    resolver: zodResolver(productDetailSchema),
    defaultValues: {
      product_id: "",
      title: "",
      subtitle: "",
      description: "",
      hero_image: [],
      icon: "",
      images: { internal: [], external: [] },
      amenities: [],
      specifications: {},
    },
  });

  const {
    fields: amenityFields,
    append: appendAmenity,
    remove: removeAmenity,
  } = useFieldArray({
    control: productDetailForm.control,
    name: "amenities",
  });

  const handleImageUpload = async (files: FileList, fieldName: string) => {
    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      const filePath = `uploads/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        continue;
      }

      const { data } = supabase.storage.from("images").getPublicUrl(filePath);
      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }
    }

    // if (fieldName === "hero_image" || fieldName === "icon") {
    //   productDetailForm.setValue(fieldName, uploadedUrls[0]);
    // }

    // Check which field is being updated
    if (fieldName === "hero_image") {
      // For hero_image, set the array of uploaded URLs
      const currentHeroImages = productDetailForm.getValues("hero_image") || [];
      productDetailForm.setValue("hero_image", [
        ...currentHeroImages, // Preserve existing hero images
        ...uploadedUrls, // Add newly uploaded URLs
      ]);
    } else if (fieldName === "icon") {
      // For icon, set only the first uploaded URL
      productDetailForm.setValue(fieldName, uploadedUrls[0]);
    } else if (
      fieldName === "internal_images" ||
      fieldName === "external_images"
    ) {
      const imageType = fieldName.split("_")[0] as "internal" | "external";
      const currentImages = productDetailForm.getValues("images");
      productDetailForm.setValue("images", {
        ...currentImages,
        [imageType]: [...(currentImages[imageType] || []), ...uploadedUrls],
      });
    }

    return uploadedUrls;
  };

  const deleteProductDetailMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("product_details")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productDetails"] });
    },
  });

  console.log("productDetailForm.watch", productDetailForm.watch());
  console.log("productDetailForm.getValue ", productDetailForm.getValues());

  const availableProducts = products?.filter(
    (product) =>
      !productDetails.some((detail) => detail.product_id === product.id)
  );

  const filteredProductDetails = productDetails.filter(
    (detail) =>
      detail.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      products
        .find((p) => p.id === detail.product_id)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleDeleteProduct = (id: string) => {
    deleteProductMutation.mutate(id);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      (product?.description &&
        product?.description
          .toLowerCase()
          .includes(productSearchTerm.toLowerCase()))
  );

  const addSpecCategory = () => {
    const category = productDetailForm.watch("newSpecCategory" as any);
    if (category && !specCategories.includes(category)) {
      setSpecCategories([...specCategories, category]);
      productDetailForm.setValue("newSpecCategory" as any, "");
    }
  };

  const handleDeleteProductDetail = (id: string) => {
    deleteProductDetailMutation.mutate(id);
  };

  return (
    <>
      {/* Setting up DevTool */}
      {/* <DevTool
        placement="top-right"
        control={
          activeTab === "product"
            ? productForm.control
            : productDetailForm.control
        }
      />{" "} */}
      {/* DevTools for productForm */}

      {activeTab === "products" && (
        <DevTool placement="top-right" control={productForm.control} />
      )}

      {activeTab === "details" && (
        <DevTool placement="top-right" control={productDetailForm.control} />
      )}
      {/* DevTools for productDetailForm */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="products"
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="details">Product Details</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...productForm}>
                <form
                  onSubmit={productForm.handleSubmit((data) =>
                    productMutation.mutate(data as any)
                  )}
                  className="space-y-8"
                >
                  <FormField
                    control={productForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Product name" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the product name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Product description"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a brief description of the product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Set the product price.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="nav_subsection_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Navigation Subsection</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subsection" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {navSubsections?.map((subsection) => (
                              <SelectItem
                                key={subsection.id}
                                value={subsection.id as string}
                              >
                                {subsection?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the navigation subsection for this product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">
                    {editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          {/* 
          <Card>
            <CardHeader>
              <CardTitle>Products List</CardTitle>
            </CardHeader>
            <CardContent>
              {products.map((product) => (
                <Card key={product.id} className="mb-4">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {product.description}
                    </p>
                    <p className="text-sm font-medium">
                      Price: ${product.price}
                    </p>
                    <p className="text-sm text-gray-500">
                      Category:{" "}
                      {
                        navSubsections.find(
                          (s) => s.id === product.nav_subsection_id
                        )?.name
                      }
                    </p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        setEditingProduct(product.id);
                        productForm.reset(product);
                      }}
                    >
                      Edit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader>
              <CardTitle>Products List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search products..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[400px]">
                {filteredProducts?.map((product) => (
                  <Card key={product.id} className="mb-4">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-500">
                        {product.description}
                      </p>
                      <p className="text-sm font-medium">
                        Price: ${product.price}
                      </p>
                      {/* <p className="text-sm text-gray-500">
                        Category:{" "}
                        {
                          navSubsections.find(
                            (s) => s.id === product.nav_subsection_id
                          )?.name
                        }
                      </p> */}
                      <div className="flex space-x-2 mt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(product.id);
                            productForm.reset(product as any);
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
                                permanently delete the product and remove it
                                from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingProductDetail
                  ? "Edit Product Detail"
                  : "Add New Product Detail"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...productDetailForm}>
                <form
                  onSubmit={productDetailForm.handleSubmit((data) =>
                    productDetailMutation.mutate(data as any)
                  )}
                  className="space-y-8"
                >
                  <FormField
                    control={productDetailForm.control}
                    name="product_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))} */}

                            {availableProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the product for this detail.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productDetailForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Product detail title"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the title for this product detail.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productDetailForm.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Product detail subtitle"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter a subtitle for this product detail (optional).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productDetailForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Product detail description"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed description for this product
                          detail.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productDetailForm.control}
                    name="hero_image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hero Images</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            multiple
                            onChange={(e) =>
                              handleImageUpload(e.target.files!, "hero_image")
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Upload hero images for this product detail.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productDetailForm.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            onChange={(e) =>
                              handleImageUpload(e.target.files!, "icon")
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Upload an icon for this product detail.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productDetailForm.control}
                    name="images.internal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Internal Images</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            multiple
                            onChange={(e) =>
                              handleImageUpload(
                                e.target.files!,
                                "internal_images"
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Upload internal images for this product detail.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productDetailForm.control}
                    name="images.external"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>External Images</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            multiple
                            onChange={(e) =>
                              handleImageUpload(
                                e.target.files!,
                                "external_images"
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Upload external images for this product detail.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                    {amenityFields?.map((field, index) => (
                      <div key={field.id} className="flex space-x-2 mb-2">
                        <FormField
                          control={productDetailForm.control}
                          name={`amenities.${index}.feature`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Feature" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={productDetailForm.control}
                          name={`amenities.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Value" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeAmenity(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => appendAmenity({ feature: "", value: "" })}
                    >
                      Add Amenity
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Specifications
                    </h3>
                    <div className="flex space-x-2 mb-2">
                      <Input
                        placeholder="New Category"
                        {...productDetailForm.register(
                          "newSpecCategory" as any
                        )}
                      />
                      <Button type="button" onClick={addSpecCategory}>
                        Add Category
                      </Button>
                    </div>
                    {specCategories?.map((category) => (
                      <Card key={category} className="mb-4">
                        <CardHeader>
                          <CardTitle>{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <FormField
                            control={productDetailForm.control}
                            name={`specifications.${category}.newKey`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="New Key" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productDetailForm.control}
                            name={`specifications.${category}.newValue`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="New Value" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              const key = productDetailForm.getValues(
                                `specifications.${category}.newKey`
                              );
                              const value = productDetailForm.getValues(
                                `specifications.${category}.newValue`
                              );
                              if (key && value) {
                                productDetailForm.setValue(
                                  `specifications.${category}.${key}`,
                                  value
                                );
                                productDetailForm.setValue(
                                  `specifications.${category}.newKey`,
                                  ""
                                );
                                productDetailForm.setValue(
                                  `specifications.${category}.newValue`,
                                  ""
                                );
                              }
                            }}
                          >
                            Add Specification
                          </Button>
                          {Object.entries(
                            productDetailForm.watch(
                              `specifications.${category}`
                            ) || {}
                          ).map(([key, value]) => {
                            if (key !== "newKey" && key !== "newValue") {
                              return (
                                <div
                                  key={key}
                                  className="flex justify-between items-center mt-2"
                                >
                                  <span>
                                    {key}: {value}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      const specs = {
                                        ...productDetailForm.getValues(
                                          `specifications.${category}`
                                        ),
                                      };
                                      delete specs[key];
                                      productDetailForm.setValue(
                                        `specifications.${category}`,
                                        specs
                                      );
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Button type="submit">
                    {editingProductDetail
                      ? "Update Product Detail"
                      : "Add Product Detail"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Product Details List</CardTitle>
            </CardHeader>
            <CardContent>
              {productDetails.map((detail) => (
                <Card key={detail.id} className="mb-4">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">{detail.title}</h3>
                    <p className="text-sm text-gray-500">{detail.subtitle}</p>
                    <p className="text-sm">{detail.description}</p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        setEditingProductDetail(detail.id);
                        productDetailForm.reset(detail);
                      }}
                    >
                      Edit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card> */}

          {/* <Card>
            <CardHeader>
              <CardTitle>Product Details List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search product details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[400px]">
                {filteredProductDetails.map((detail) => (
                  <Card key={detail.id} className="mb-4">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold">{detail.title}</h3>
                      <p className="text-sm text-gray-500">
                        Product:{" "}
                        {products.find((p) => p.id === detail.product_id)?.name}
                      </p>
                      <p className="text-sm text-gray-500">{detail.subtitle}</p>
                      <p className="text-sm">{detail.description}</p>
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          setEditingProductDetail(detail.id);
                          productDetailForm.reset(detail);
                        }}
                      >
                        Edit
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader>
              <CardTitle>Product Details List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search product details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[400px]">
                {filteredProductDetails.map((detail) => (
                  <Card key={detail.id} className="mb-4">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold">{detail.title}</h3>
                      <p className="text-sm text-gray-500">
                        Product:{" "}
                        {products.find((p) => p.id === detail.product_id)?.name}
                      </p>
                      <p className="text-sm text-gray-500">{detail.subtitle}</p>
                      <p className="text-sm">{detail.description}</p>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingProductDetail(detail.id);
                            productDetailForm.reset(detail as any);
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
                                permanently delete the product detail and remove
                                it from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteProductDetail(detail.id)
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useListState } from "@mantine/hooks";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { supabase } from "@/lib/supabase";

// // Zod schemas
// const productSchema = z.object({
//   id: z.string().optional(),
//   name: z.string().min(1, "Name is required"),
//   description: z.string(),
//   price: z.number().min(0, "Price must be non-negative"),
//   nav_subsection_id: z.string().min(1, "Navigation subsection is required"),
// });

// const productDetailSchema = z.object({
//   id: z.string().optional(),
//   product_id: z.string().min(1, "Product is required"),
//   title: z.string().min(1, "Title is required"),
//   subtitle: z.string(),
//   description: z.string(),
//   hero_image: z.array(z.string().url("Invalid URL for internal image")),
//   icon: z.string().url("Invalid URL for icon"),
//   images: z.object({
//     internal: z.array(z.string().url("Invalid URL for internal image")),
//     external: z.array(z.string().url("Invalid URL for external image")),
//   }),
//   amenities: z.array(
//     z.object({
//       feature: z.string().min(1, "Feature is required"),
//       value: z.string().min(1, "Value is required"),
//     })
//   ),
//   specifications: z.record(z.record(z.string())),
// });

// type Product = z.infer<typeof productSchema>;
// type ProductDetail = z.infer<typeof productDetailSchema>;

// export default function ProductManagement() {
//   const [navSubsections, setNavSubsections] = useState([]);
//   const [products, handlers] = useListState<Product>([]);
//   const [productDetails, detailHandlers] = useListState<ProductDetail>([]);
//   const [editingProduct, setEditingProduct] = useState<string | null>(null);
//   const [editingProductDetail, setEditingProductDetail] = useState<
//     string | null
//   >(null);

//   const productForm = useForm<Product>({
//     resolver: zodResolver(productSchema),
//     defaultValues: {
//       name: "",
//       description: "",
//       price: 0,
//       nav_subsection_id: "",
//     },
//   });

//   const productDetailForm = useForm<ProductDetail>({
//     resolver: zodResolver(productDetailSchema),
//     defaultValues: {
//       product_id: "",
//       title: "",
//       subtitle: "",
//       description: "",
//       hero_image: [],
//       icon: "",
//       images: { internal: [], external: [] },
//       amenities: [],
//       specifications: {},
//     },
//   });

//   useEffect(() => {
//     fetchProducts();
//     fetchNavSubsections();
//     fetchProductDetails();
//   }, []);

//   const fetchProducts = async () => {
//     const { data, error } = await supabase.from("products").select("*");
//     if (error) console.error("Error fetching products:", error);
//     else handlers.setState(data || []);
//   };

//   const fetchNavSubsections = async () => {
//     const { data, error } = await supabase.from("nav_subsections").select("*");
//     if (error) console.error("Error fetching nav subsections:", error);
//     else setNavSubsections(data || []);
//   };

//   const fetchProductDetails = async () => {
//     const { data, error } = await supabase.from("product_details").select("*");
//     if (error) console.error("Error fetching product details:", error);
//     else detailHandlers.setState(data || []);
//   };

//   const handleProductSubmit = async (data: Product) => {
//     if (editingProduct) {
//       const { error } = await supabase
//         .from("products")
//         .update(data)
//         .eq("id", editingProduct);
//       if (error) console.error("Error updating product:", error);
//       else {
//         handlers.updateFirst((item) => item.id === editingProduct, data);
//         setEditingProduct(null);
//       }
//     } else {
//       const { data: newProduct, error } = await supabase
//         .from("products")
//         .insert(data)
//         .select()
//         .single();
//       if (error) console.error("Error adding product:", error);
//       else handlers.append(newProduct);
//     }
//     productForm.reset();
//   };

//   const handleProductDetailSubmit = async (data: ProductDetail) => {
//     if (editingProductDetail) {
//       const { error } = await supabase
//         .from("product_details")
//         .update(data)
//         .eq("id", editingProductDetail);
//       if (error) console.error("Error updating product detail:", error);
//       else {
//         detailHandlers.updateFirst(
//           (item) => item.id === editingProductDetail,
//           data
//         );
//         setEditingProductDetail(null);
//       }
//     } else {
//       const { data: newProductDetail, error } = await supabase
//         .from("product_details")
//         .insert(data)
//         .select()
//         .single();
//       if (error) console.error("Error adding product detail:", error);
//       else detailHandlers.append(newProductDetail);
//     }
//     productDetailForm.reset();
//   };

//   const startEditingProduct = (product: Product) => {
//     setEditingProduct(product.id);
//     productForm.reset(product);
//   };

//   const startEditingProductDetail = (productDetail: ProductDetail) => {
//     setEditingProductDetail(productDetail.id);
//     productDetailForm.reset(productDetail);
//   };

//   const cancelEditing = () => {
//     setEditingProduct(null);
//     setEditingProductDetail(null);
//     productForm.reset();
//     productDetailForm.reset();
//   };

//   return (
//     <Tabs defaultValue="products" className="space-y-4">
//       <TabsList>
//         <TabsTrigger value="products">Products</TabsTrigger>
//         <TabsTrigger value="details">Product Details</TabsTrigger>
//       </TabsList>

//       <TabsContent value="products" className="space-y-4">
//         <Card>
//           <CardHeader>
//             <CardTitle>
//               {editingProduct ? "Edit Product" : "Add New Product"}
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form
//               onSubmit={productForm.handleSubmit(handleProductSubmit)}
//               className="space-y-4"
//             >
//               <div>
//                 <Label htmlFor="name">Name</Label>
//                 <Controller
//                   name="name"
//                   control={productForm.control}
//                   render={({ field }) => <Input {...field} />}
//                 />
//                 {productForm.formState.errors.name && (
//                   <p className="text-red-500">
//                     {productForm.formState.errors.name.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Controller
//                   name="description"
//                   control={productForm.control}
//                   render={({ field }) => <Textarea {...field} />}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="price">Price</Label>
//                 <Controller
//                   name="price"
//                   control={productForm.control}
//                   render={({ field }) => (
//                     <Input
//                       type="number"
//                       {...field}
//                       onChange={(e) =>
//                         field.onChange(parseFloat(e.target.value))
//                       }
//                     />
//                   )}
//                 />
//                 {productForm.formState.errors.price && (
//                   <p className="text-red-500">
//                     {productForm.formState.errors.price.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Label htmlFor="nav_subsection_id">Navigation Subsection</Label>
//                 <Controller
//                   name="nav_subsection_id"
//                   control={productForm.control}
//                   render={({ field }) => (
//                     <Select onValueChange={field.onChange} value={field.value}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select a subsection" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {navSubsections.map((subsection) => (
//                           <SelectItem key={subsection.id} value={subsection.id}>
//                             {subsection.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//                 {productForm.formState.errors.nav_subsection_id && (
//                   <p className="text-red-500">
//                     {productForm.formState.errors.nav_subsection_id.message}
//                   </p>
//                 )}
//               </div>
//               <Button type="submit">
//                 {editingProduct ? "Update Product" : "Add Product"}
//               </Button>
//               {editingProduct && (
//                 <Button type="button" onClick={cancelEditing}>
//                   Cancel
//                 </Button>
//               )}
//             </form>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Products List</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {products.map((product) => (
//               <Card key={product.id} className="mb-4">
//                 <CardContent className="p-4">
//                   <h3 className="text-lg font-semibold">{product.name}</h3>
//                   <p className="text-sm text-gray-500">{product.description}</p>
//                   <p className="text-sm font-medium">Price: ${product.price}</p>
//                   <p className="text-sm text-gray-500">
//                     Category:{" "}
//                     {
//                       navSubsections.find(
//                         (s) => s.id === product.nav_subsection_id
//                       )?.name
//                     }
//                   </p>
//                   <Button
//                     variant="outline"
//                     className="mt-2"
//                     onClick={() => startEditingProduct(product)}
//                   >
//                     Edit
//                   </Button>
//                 </CardContent>
//               </Card>
//             ))}
//           </CardContent>
//         </Card>
//       </TabsContent>

//       <TabsContent value="details" className="space-y-4">
//         <Card>
//           <CardHeader>
//             <CardTitle>
//               {editingProductDetail
//                 ? "Edit Product Detail"
//                 : "Add New Product Detail"}
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form
//               onSubmit={productDetailForm.handleSubmit(
//                 handleProductDetailSubmit
//               )}
//               className="space-y-4"
//             >
//               <div>
//                 <Label htmlFor="product_id">Product</Label>
//                 <Controller
//                   name="product_id"
//                   control={productDetailForm.control}
//                   render={({ field }) => (
//                     <Select onValueChange={field.onChange} value={field.value}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select a product" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {products.map((product) => (
//                           <SelectItem key={product.id} value={product.id}>
//                             {product.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//                 {productDetailForm.formState.errors.product_id && (
//                   <p className="text-red-500">
//                     {productDetailForm.formState.errors.product_id.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Label htmlFor="title">Title</Label>
//                 <Controller
//                   name="title"
//                   control={productDetailForm.control}
//                   render={({ field }) => <Input {...field} />}
//                 />
//                 {productDetailForm.formState.errors.title && (
//                   <p className="text-red-500">
//                     {productDetailForm.formState.errors.title.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Label htmlFor="subtitle">Subtitle</Label>
//                 <Controller
//                   name="subtitle"
//                   control={productDetailForm.control}
//                   render={({ field }) => <Input {...field} />}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Controller
//                   name="description"
//                   control={productDetailForm.control}
//                   render={({ field }) => <Textarea {...field} />}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="hero_image">Hero Image URL</Label>
//                 <Controller
//                   name="hero_image"
//                   control={productDetailForm.control}
//                   render={({ field }) => <Input {...field} />}
//                 />
//                 {productDetailForm.formState.errors.hero_image && (
//                   <p className="text-red-500">
//                     {productDetailForm.formState.errors.hero_image.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Label htmlFor="icon">Icon URL</Label>
//                 <Controller
//                   name="icon"
//                   control={productDetailForm.control}
//                   render={({ field }) => <Input {...field} />}
//                 />
//                 {productDetailForm.formState.errors.icon && (
//                   <p className="text-red-500">
//                     {productDetailForm.formState.errors.icon.message}
//                   </p>
//                 )}
//               </div>
//               {/* Add more fields for images, amenities, and specifications as needed */}
//               <Button type="submit">
//                 {editingProductDetail
//                   ? "Update Product Detail"
//                   : "Add Product Detail"}
//               </Button>
//               {editingProductDetail && (
//                 <Button type="button" onClick={cancelEditing}>
//                   Cancel
//                 </Button>
//               )}
//             </form>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Product Details List</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {productDetails?.map((detail) => (
//               <Card key={detail.id} className="mb-4">
//                 <CardContent className="p-4">
//                   <h3 className="text-lg font-semibold">{detail.title}</h3>
//                   <p className="text-sm text-gray-500">{detail.subtitle}</p>
//                   <p className="text-sm">{detail.description}</p>
//                   <Button
//                     variant="outline"
//                     className="mt-2"
//                     onClick={() => startEditingProductDetail(detail)}
//                   >
//                     Edit
//                   </Button>
//                 </CardContent>
//               </Card>
//             ))}
//           </CardContent>
//         </Card>
//       </TabsContent>
//     </Tabs>
//   );
// }

// "use client";

// import { useState, useEffect, FormEvent } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { supabase } from "@/lib/supabase";

// type Product = {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   nav_subsection_id: string;
// };

// type NavSubsection = {
//   id: string;
//   name: string;
// };

// type ProductDetail = {
//   id: string;
//   product_id: string;
//   hero_image: string;
//   title: string;
//   subtitle: string;
//   icon: string;
//   description: string;
//   amenities: { feature: string; value: string }[];
//   images: {
//     internal: string[];
//     external: string[];
//   };
//   specifications: {
//     [key: string]: {
//       [specKey: string]: string;
//     };
//   };
// };
// type Amenity = {
//   feature: string;
//   value: string;
// };

// // type Specification = {
// //   [category: string]: {
// //     [key: string]: string;
// //   };
// // };
// export default function ProductManagement() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [navSubsections, setNavSubsections] = useState<NavSubsection[]>([]);
//   const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);

//   const [newProduct, setNewProduct] = useState<Partial<Product>>({
//     name: "",
//     description: "",
//     price: 0,
//     nav_subsection_id: "",
//   });

//   const [newProductDetail, setNewProductDetail] = useState<
//     Partial<ProductDetail>
//   >({
//     product_id: "",
//     title: "",
//     subtitle: "",
//     description: "",
//     hero_image: "",
//     icon: "",
//     images: { internal: [], external: [] },
//     amenities: [],
//     specifications: {},
//   });

//   const [open, setOpen] = useState(false);
//   const [productValue, setProductValue] = useState("");
//   const [newAmenity, setNewAmenity] = useState<Amenity>({
//     feature: "",
//     value: "",
//   });
//   const [newSpecCategory, setNewSpecCategory] = useState("");
//   const [newSpecKey, setNewSpecKey] = useState("");
//   const [newSpecValue, setNewSpecValue] = useState("");
//   useEffect(() => {
//     fetchProducts();
//     fetchNavSubsections();
//     fetchProductDetails();
//   }, []);

//   const fetchProducts = async () => {
//     const { data, error } = await supabase.from("products").select("*");
//     if (error) console.error("Error fetching products:", error);
//     else setProducts(data || []);
//   };

//   const fetchNavSubsections = async () => {
//     const { data, error } = await supabase.from("nav_subsections").select("*");
//     if (error) console.error("Error fetching nav subsections:", error);
//     else setNavSubsections(data || []);
//   };

//   const fetchProductDetails = async () => {
//     const { data, error } = await supabase.from("product_details").select("*");
//     if (error) console.error("Error fetching product details:", error);
//     else setProductDetails(data || []);
//   };

//   const handleProductSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     const { error } = await supabase.from("products").insert(newProduct);
//     if (error) console.error("Error adding product:", error);
//     else {
//       setNewProduct({
//         name: "",
//         description: "",
//         price: 0,
//         nav_subsection_id: "",
//       });
//       fetchProducts();
//     }
//   };

//   const handleProductDetailSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     const { error } = await supabase
//       .from("product_details")
//       .insert(newProductDetail);
//     if (error) console.error("Error adding product details:", error);
//     else {
//       setNewProductDetail({
//         product_id: "",
//         title: "",
//         subtitle: "",
//         description: "",
//         hero_image: "",
//         icon: "",
//         images: { internal: [], external: [] },
//         amenities: [],
//         specifications: {},
//       });
//       fetchProductDetails();
//     }
//   };

//   const addAmenity = () => {
//     if (newAmenity.feature && newAmenity.value) {
//       setNewProductDetail((prev) => ({
//         ...prev,
//         amenities: [...(prev.amenities || []), newAmenity],
//       }));
//       setNewAmenity({ feature: "", value: "" });
//     }
//   };

//   const removeAmenity = (index: number) => {
//     setNewProductDetail((prev) => ({
//       ...prev,
//       amenities: prev.amenities?.filter((_, i) => i !== index) || [],
//     }));
//   };

//   const addSpecification = () => {
//     if (newSpecCategory && newSpecKey && newSpecValue) {
//       setNewProductDetail((prev) => ({
//         ...prev,
//         specifications: {
//           ...prev.specifications,
//           [newSpecCategory]: {
//             ...(prev.specifications?.[newSpecCategory] || {}),
//             [newSpecKey]: newSpecValue,
//           },
//         },
//       }));
//       setNewSpecCategory("");
//       setNewSpecKey("");
//       setNewSpecValue("");
//     }
//   };

//   const removeSpecification = (category: string, key: string) => {
//     setNewProductDetail((prev) => {
//       const newSpecs = { ...prev.specifications };
//       delete newSpecs[category][key];
//       if (Object.keys(newSpecs[category]).length === 0) {
//         delete newSpecs[category];
//       }
//       return { ...prev, specifications: newSpecs };
//     });
//   };

//   const handleImageUpload = async (files: FileList, fieldName: string) => {
//     const uploadedUrls: any = [];
//     for (let i = 0; i < files.length; i++) {
//       const file = files[i];
//       const filePath = `uploads/${Date.now()}_${file.name}`;
//       const { error: uploadError } = await supabase.storage
//         .from("images")
//         .upload(filePath, file);

//       if (uploadError) {
//         console.error("Error uploading file:", uploadError);
//         continue;
//       }

//       const {
//         data: { publicUrl },
//       } = supabase.storage.from("images").getPublicUrl(filePath);

//       uploadedUrls.push(publicUrl);
//     }

//     if (fieldName === "hero_image" || fieldName === "icon") {
//       setNewProductDetail((prev) => ({
//         ...prev,
//         [fieldName]: uploadedUrls[0],
//       }));
//     } else if (
//       fieldName === "internal_images" ||
//       fieldName === "external_images"
//     ) {
//       setNewProductDetail((prev) => {
//         const currentImages = prev.images || { internal: [], external: [] }; // Default to empty arrays
//         const currentFieldImages =
//           currentImages[
//             (fieldName.split("_")[0] as "internal") || "external"
//           ] || []; // Default to empty array

//         return {
//           ...prev,
//           images: {
//             ...currentImages,
//             [fieldName.split("_")[0]]: [...currentFieldImages, ...uploadedUrls],
//           },
//         };
//       });

//       // setNewProductDetail((prev) => ({
//       //   ...prev,
//       //   images: {
//       //     ...prev.images,
//       //     [fieldName.split("_")[0]]: [
//       //       ...(prev.images?.[
//       //         fieldName.split("_")[0] as "internal" | "external"
//       //       ] || []),
//       //       ...uploadedUrls,
//       //     ],
//       //   },
//       // }));
//     }

//     return uploadedUrls;
//   };

//   return (
//     <Tabs defaultValue="products" className="space-y-4">
//       <TabsList>
//         <TabsTrigger value="products">Products</TabsTrigger>
//         <TabsTrigger value="details">Product Details</TabsTrigger>
//       </TabsList>

//       <TabsContent value="products" className="space-y-4">
//         <Card>
//           <CardHeader>
//             <CardTitle>Add New Product</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleProductSubmit} className="space-y-4">
//               <div>
//                 <Label htmlFor="name">Name</Label>
//                 <Input
//                   id="name"
//                   value={newProduct.name}
//                   onChange={(e) =>
//                     setNewProduct((prev) => ({ ...prev, name: e.target.value }))
//                   }
//                   required
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   value={newProduct.description}
//                   onChange={(e) =>
//                     setNewProduct((prev) => ({
//                       ...prev,
//                       description: e.target.value,
//                     }))
//                   }
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="price">Price</Label>
//                 <Input
//                   type="number"
//                   id="price"
//                   value={newProduct.price}
//                   onChange={(e) =>
//                     setNewProduct((prev) => ({
//                       ...prev,
//                       price: parseFloat(e.target.value),
//                     }))
//                   }
//                   step="0.01"
//                   required
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="nav_subsection_id">Navigation Subsection</Label>
//                 <Select
//                   value={newProduct.nav_subsection_id}
//                   onValueChange={(value) =>
//                     setNewProduct((prev) => ({
//                       ...prev,
//                       nav_subsection_id: value,
//                     }))
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a subsection" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {navSubsections?.map((subsection) => (
//                       <SelectItem key={subsection.id} value={subsection.id}>
//                         {subsection.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <Button type="submit">Add Product</Button>
//             </form>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Products List</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {products.map((product) => (
//               <Card key={product.id} className="mb-4">
//                 <CardContent className="p-4">
//                   <h3 className="text-lg font-semibold">{product.name}</h3>
//                   <p className="text-sm text-gray-500">{product.description}</p>
//                   <p className="text-sm font-medium">Price: ${product.price}</p>
//                   <p className="text-sm text-gray-500">
//                     Category:{" "}
//                     {
//                       navSubsections.find(
//                         (s) => s.id === product.nav_subsection_id
//                       )?.name
//                     }
//                   </p>
//                   <Button
//                     variant="outline"
//                     className="mt-2"
//                     onClick={() => {
//                       /* Implement edit functionality */
//                     }}
//                   >
//                     Edit
//                   </Button>
//                 </CardContent>
//               </Card>
//             ))}
//           </CardContent>
//         </Card>
//       </TabsContent>

//       <TabsContent value="details" className="space-y-4">
//         <Card>
//           <CardHeader>
//             <CardTitle>Add Product Details</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleProductDetailSubmit} className="space-y-4">
//               <div>
//                 <Label htmlFor="product_id">Product</Label>
//                 <Popover open={open} onOpenChange={setOpen}>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       role="combobox"
//                       aria-expanded={open}
//                       className="w-full justify-between"
//                     >
//                       {productValue
//                         ? products.find(
//                             (product) => product.id === productValue
//                           )?.name
//                         : "Select product..."}
//                       <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-full p-0">
//                     <Command>
//                       <CommandInput placeholder="Search product..." />
//                       <CommandEmpty>No product found.</CommandEmpty>
//                       <CommandGroup>
//                         <CommandList>
//                           {products
//                             .filter(
//                               (product) =>
//                                 !productDetails.some(
//                                   (detail) => detail.product_id === product.id
//                                 )
//                             )

//                             .map((product) => (
//                               <CommandItem
//                                 key={product.id}
//                                 onSelect={() => {
//                                   setProductValue(product.id);
//                                   setNewProductDetail((prev) => ({
//                                     ...prev,
//                                     product_id: product.id,
//                                   }));
//                                   setOpen(false);
//                                 }}
//                               >
//                                 <Check
//                                   className={cn(
//                                     "mr-2 h-4 w-4",
//                                     productValue === product.id
//                                       ? "opacity-100"
//                                       : "opacity-0"
//                                   )}
//                                 />
//                                 {product.name}
//                               </CommandItem>
//                             ))}
//                         </CommandList>
//                       </CommandGroup>
//                     </Command>
//                   </PopoverContent>
//                 </Popover>
//               </div>
//               <div>
//                 <Label htmlFor="title">Title</Label>
//                 <Input
//                   id="title"
//                   value={newProductDetail.title}
//                   onChange={(e) =>
//                     setNewProductDetail((prev) => ({
//                       ...prev,
//                       title: e.target.value,
//                     }))
//                   }
//                   required
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="subtitle">Subtitle</Label>
//                 <Input
//                   id="subtitle"
//                   value={newProductDetail.subtitle}
//                   onChange={(e) =>
//                     setNewProductDetail((prev) => ({
//                       ...prev,
//                       subtitle: e.target.value,
//                     }))
//                   }
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   value={newProductDetail.description}
//                   onChange={(e) =>
//                     setNewProductDetail((prev) => ({
//                       ...prev,
//                       description: e.target.value,
//                     }))
//                   }
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="hero_image">Hero Image</Label>
//                 <Input
//                   id="hero_image"
//                   type="file"
//                   onChange={async (e) => {
//                     const urls = await handleImageUpload(
//                       e.target.files!,
//                       "hero_image"
//                     );
//                     if (urls.length > 0) {
//                       setNewProductDetail((prev) => ({
//                         ...prev,
//                         hero_image: urls[0],
//                       }));
//                     }
//                   }}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="icon">Icon</Label>
//                 <Input
//                   id="icon"
//                   type="file"
//                   onChange={async (e) => {
//                     const urls = await handleImageUpload(
//                       e.target.files!,
//                       "icon"
//                     );
//                     if (urls.length > 0) {
//                       setNewProductDetail((prev) => ({
//                         ...prev,
//                         icon: urls[0],
//                       }));
//                     }
//                   }}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="internal_images">Internal Images</Label>
//                 <Input
//                   id="internal_images"
//                   type="file"
//                   multiple
//                   onChange={async (e) => {
//                     await handleImageUpload(e.target.files!, "internal_images");
//                   }}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="external_images">External Images</Label>
//                 <Input
//                   id="external_images"
//                   type="file"
//                   multiple
//                   onChange={async (e) => {
//                     await handleImageUpload(e.target.files!, "external_images");
//                   }}
//                 />
//               </div>

//               <div>
//                 <Label>Amenities</Label>
//                 <div className="flex space-x-2 mb-2">
//                   <Input
//                     placeholder="Feature"
//                     value={newAmenity.feature}
//                     onChange={(e) =>
//                       setNewAmenity((prev) => ({
//                         ...prev,
//                         feature: e.target.value,
//                       }))
//                     }
//                   />
//                   <Input
//                     placeholder="Value"
//                     value={newAmenity.value}
//                     onChange={(e) =>
//                       setNewAmenity((prev) => ({
//                         ...prev,
//                         value: e.target.value,
//                       }))
//                     }
//                   />
//                   <Button type="button" onClick={addAmenity}>
//                     <Plus className="h-4 w-4" />
//                   </Button>
//                 </div>
//                 {newProductDetail.amenities?.map((amenity, index) => (
//                   <div key={index} className="flex items-center space-x-2 mb-2">
//                     <span>
//                       {amenity.feature}: {amenity.value}
//                     </span>
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       onClick={() => removeAmenity(index)}
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ))}
//               </div>

//               <div>
//                 <Label>Specifications</Label>
//                 <div className="flex space-x-2 mb-2">
//                   <Input
//                     placeholder="Category"
//                     value={newSpecCategory}
//                     onChange={(e) => setNewSpecCategory(e.target.value)}
//                   />
//                   <Input
//                     placeholder="Key"
//                     value={newSpecKey}
//                     onChange={(e) => setNewSpecKey(e.target.value)}
//                   />
//                   <Input
//                     placeholder="Value"
//                     value={newSpecValue}
//                     onChange={(e) => setNewSpecValue(e.target.value)}
//                   />
//                   <Button type="button" onClick={addSpecification}>
//                     <Plus className="h-4 w-4" />
//                   </Button>
//                 </div>
//                 {Object.entries(newProductDetail.specifications || {}).map(
//                   ([category, specs]) => (
//                     <div key={category} className="mb-2">
//                       <h4 className="font-semibold">{category}</h4>
//                       {Object.entries(specs).map(([key, value]) => (
//                         <div
//                           key={key}
//                           className="flex items-center space-x-2 ml-4"
//                         >
//                           <span>
//                             {key}: {value}
//                           </span>
//                           <Button
//                             type="button"
//                             variant="ghost"
//                             onClick={() => removeSpecification(category, key)}
//                           >
//                             <X className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       ))}
//                     </div>
//                   )
//                 )}
//               </div>

//               <Button type="submit">Add Product Details</Button>
//             </form>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Product Details List</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {productDetails.map((detail) => (
//               <Card key={detail.id} className="mb-4">
//                 <CardContent className="p-4">
//                   <h3 className="text-lg font-semibold">{detail.title}</h3>
//                   <p className="text-sm text-gray-500">{detail.subtitle}</p>
//                   <p className="text-sm">{detail.description}</p>
//                   <Button
//                     variant="outline"
//                     className="mt-2"
//                     onClick={() => {
//                       /* Implement edit functionality */
//                     }}
//                   >
//                     Edit
//                   </Button>
//                 </CardContent>
//               </Card>
//             ))}
//           </CardContent>
//         </Card>
//       </TabsContent>
//     </Tabs>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { PlusCircle, Search, Trash2, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { DevTool } from "@hookform/devtools";
import ScrollToTop from "@/components/header/scroll-to-top";
import {
  Product,
  ProductDetail,
  productDetailSchema,
  productSchema,
} from "@/schemas/product-schema";
import {
  fetchNavSections,
  fetchProductDetails,
  fetchProducts,
  fetchSingleProductDetail,
  getProductData,
} from "@/services/product-services";
import {
  useDeleteProductDetailMutation,
  useDeleteProductMutation,
  useProductDetailMutation,
  useProductMutation,
} from "@/hooks/use-product";
import { Json } from "../../../database.types";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3";
interface ImageTypes {
  internal: string[];
  external: string[];
}

export default function ProductManagement() {
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingProductDetail, setEditingProductDetail] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState("products");
  const [specCategories, setSpecCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");

  // State to track which specification is being edited
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // To toggle between add and update
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Queries
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
  const { data: singleProductData } = useQuery({
    queryKey: ["single-product-details", selectedProductId],
    queryFn: () => fetchSingleProductDetail(selectedProductId),
    enabled: !!selectedProductId,
  });
  // console.log("checing id of the product", id);
  const { data: productDetails = [] } = useQuery({
    queryKey: ["productDetails"],
    queryFn: fetchProductDetails,
  });
  console.log(productDetails);

  const productForm = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      nav_section_id: "",
      href: "",
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
      // icon: "",
      images: { internal: [], external: [] },
      amenities: [],
      specifications: {},
    },
  });

  const { errors } = productDetailForm.formState;
  // const { errors } = productForm.formState;
  console.log(productDetailForm.watch("amenities"));
  console.log("Validation errors:", errors); // Log validation errors
  const {
    fields: amenityFields,
    append: appendAmenity,
    remove: removeAmenity,
    insert,
  } = useFieldArray({
    control: productDetailForm.control,
    name: "amenities",
  });
  console.log(amenityFields);
  console.log("checking selected id is ", selectedProductId);

  const { data: navSections = [] } = useQuery({
    queryKey: ["navSections"],
    queryFn: fetchNavSections,
  });

  useEffect(() => {
    console.log("single product data", singleProductData);
    if (singleProductData?.specifications) {
      setSpecCategories(Object.keys(singleProductData?.specifications as any));
    }
  }, [singleProductData]);

  const resetProductForm = () => {
    setEditingProduct(null);
    productForm.reset({
      name: "",
      description: "",
      price: "0",
      nav_section_id: "",
    });
  };

  const resetForm = () => {
    setEditingProductDetail(null);
    productDetailForm.reset({
      product_id: "",
      title: "",
      subtitle: "",
      description: "",
      hero_image: [],
      // icon: "",
      images: { internal: [], external: [] },
      amenities: [],
      specifications: {},
    });
  };

  // Mutations
  const productMutation = useProductMutation(editingProduct, resetProductForm);

  const productDetailMutation = useProductDetailMutation(
    editingProductDetail,
    resetForm
  );

  const deleteProductMutation = useDeleteProductMutation();
  const deleteProductDetailMutation = useDeleteProductDetailMutation();

  const BUCKET_NAME = "sailing-club";

  const handleImageUpload = async (
    files: FileList,
    fieldName: string,
    productId?: string
  ) => {
    const uploadedUrls: string[] = [];
    console.log("🚀 Starting the image upload process...");

    console.log("Fetching product data for ID:", productId);
    const productData = (await getProductData(productId as string)) as any;

    if (!productData) {
      console.error("❌ No product data found! Exiting upload process.");
      return;
    }
    function sanitizeFolderName(name: string): string {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }
    console.log("✅ Product data fetched successfully:", productData);

    // const productFolderName = productData?.name
    //   .toLowerCase()
    //   .replace(/\s+/g, "-");
    // const navSectionFolderName = productData?.nav_sections?.name
    //   .toLowerCase()
    //   .replace(/\s+/g, "-");
    // const navItemFolderName = productData?.nav_sections?.nav_items?.[0]?.name
    //   .toLowerCase()
    //   .replace(/\s+/g, "-");

    // Sanitize folder names
    const productFolderName = sanitizeFolderName(productData?.name);
    const navSectionFolderName = sanitizeFolderName(
      productData?.nav_sections?.name
    );
    const navItemFolderName = sanitizeFolderName(
      productData?.nav_sections?.nav_items?.[0]?.name
    );

    let imageTypeFolder =
      fieldName === "internal_images" ? "internal_images" : "external_images";

    const folderPath = `${navItemFolderName}/${navSectionFolderName}/${productFolderName}/${imageTypeFolder}`;

    console.log(process.env.NEXT_PUBLIC_AWS_REGION);

    for (const file of Array.from(files)) {
      const filePath = `${folderPath}/${Date.now()}_${file.name}`;

      try {
        const fileBuffer = await file.arrayBuffer();
        const params = {
          Bucket: BUCKET_NAME,
          Key: filePath,
          Body: Buffer.from(fileBuffer),
          ContentType: file.type,
        };

        const command = new PutObjectCommand(params);
        const uploadResult = await s3Client.send(command);
        console.log("✅ File uploaded successfully:", uploadResult);

        console.log(process.env.NEXT_PUBLIC_AWS_REGION);
        const uploadedUrl = `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${filePath}`;
        console.log("✅ File uploaded successfully:", {
          fileName: file.name,
          filePath,
          uploadResult,
        });

        uploadedUrls.push(uploadedUrl);
      } catch (error) {
        console.error("❌ Error uploading file:", file.name, error);

        // Specific Error Handling
        if (error instanceof Error) {
          switch (true) {
            case error.message.includes("credentials"):
              console.error("🚫 Credentials Unauthorized!");
              break;
            case error.message.includes("network"):
              console.error("📡 Network Issue Detected");
              break;
            default:
              console.error("💥 Unknown Upload Drama");
          }
        }
      }
    }

    console.log("📝 Updating product detail form with uploaded URLs...");
    const currentImages = productDetailForm.getValues("images");
    productDetailForm.setValue("images", {
      ...currentImages,
      [imageTypeFolder.split("_")[0]]: [
        ...(currentImages?.[
          imageTypeFolder.split("_")[0] as keyof ImageTypes
        ] || []),
        ...uploadedUrls,
      ],
    });

    console.log("✅ Form updated successfully!");

    return uploadedUrls;
  };

  // const handleImageUpload = async (files: FileList, fieldName: string) => {
  //   const uploadedUrls: string[] = [];
  //   for (const file of Array.from(files)) {
  //     const filePath = `uploads/${Date.now()}_${file.name}`;
  //     const { error: uploadError } = await supabase.storage
  //       .from("images")
  //       .upload(filePath, file);

  //     if (uploadError) {
  //       console.error("Error uploading file:", uploadError);
  //       continue;
  //     }

  //     const { data } = supabase.storage.from("images").getPublicUrl(filePath);
  //     if (data?.publicUrl) {
  //       uploadedUrls.push(data.publicUrl);
  //     }
  //   }

  //   if (fieldName === "hero_image") {
  //     const currentHeroImages = productDetailForm.getValues("hero_image") || [];
  //     productDetailForm.setValue("hero_image", [
  //       ...currentHeroImages,
  //       ...uploadedUrls,
  //     ]);
  //   } else if (fieldName === "icon") {
  //     productDetailForm.setValue(fieldName, uploadedUrls[0]);
  //   } else if (
  //     fieldName === "internal_images" ||
  //     fieldName === "external_images"
  //   ) {
  //     const imageType = fieldName.split("_")[0] as "internal" | "external";
  //     const currentImages = productDetailForm.getValues("images");
  //     productDetailForm.setValue("images", {
  //       ...currentImages,
  //       [imageType]: [...(currentImages[imageType] || []), ...uploadedUrls],
  //     });
  //   }

  //   return uploadedUrls;
  // };

  // const handleImageUpload = async (
  //   files: FileList,
  //   fieldName: string,
  //   productId?: string
  // ) => {
  //   const uploadedUrls: string[] = [];
  //   console.log("inside teh image upload function");
  //   // Step 1: Fetch product, nav section, and nav item data

  //   const productData = await getProductData(productId);

  //   console.log("product Data", productData);
  //   if (!productData) return;

  //   const productFolderName = productData?.name
  //     .toLowerCase()
  //     .replace(/\s+/g, "-");
  //   const navSectionFolderName = productData?.nav_sections?.name
  //     .toLowerCase()
  //     .replace(/\s+/g, "-");
  //   const navItemFolderName = productData?.nav_sections?.nav_items?.name
  //     .toLowerCase()
  //     .replace(/\s+/g, "-");

  //   let imageTypeFolder =
  //     fieldName === "internal_images" ? "internal_images" : "external_images";

  //   const folderPath = `${navItemFolderName}/${navSectionFolderName}/${productFolderName}/${imageTypeFolder}`;
  //   console.log("folder path is ", folderPath);

  //   for (const file of Array.from(files)) {
  //     const filePath = `${folderPath}/${Date.now()}_${file.name}`;

  //     const { error: uploadError } = await supabase.storage
  //       .from("images")
  //       .upload(filePath, file);

  //     if (uploadError) {
  //       console.error("Error uploading file:", uploadError);
  //       continue;
  //     }

  //     const { data } = supabase.storage.from("images").getPublicUrl(filePath);
  //     if (data?.publicUrl) {
  //       uploadedUrls.push(data.publicUrl);
  //     }
  //   }

  //    const currentImages = productDetailForm.getValues("images");
  //   productDetailForm.setValue("images", {
  //     ...currentImages,

  //     [imageTypeFolder.split("_")[0]]: [
  //       ...(currentImages?.[
  //         imageTypeFolder.split("_")[0] as keyof ImageTypes
  //       ] || []),
  //       ...uploadedUrls,
  //     ],
  //   });

  //   return uploadedUrls;
  // };

  const addSpecCategory = () => {
    const category = productDetailForm.watch("newSpecCategory" as any);
    if (category && !specCategories.includes(category)) {
      setSpecCategories([...specCategories, category]);
      productDetailForm.setValue("newSpecCategory" as any, ""); // if in default value we can use reset also here
    }
  };

  // Check if the category exists in specifications before deleting
  const removeCategory = (categoryToRemove: any) => {
    console.log("categegory to remove", categoryToRemove);
    console.log("checking product data", singleProductData);

    const isCategoryInUse = (
      singleProductData as any
    )?.specifications?.hasOwnProperty(categoryToRemove);
    console.log("checking iscategory value", isCategoryInUse);

    if (isCategoryInUse) {
      toast.error(
        `Category "${categoryToRemove}" is in use and cannot be deleted.`
      );
      return;
    }

    // Remove category if not in use
    setSpecCategories(
      specCategories.filter((category) => category !== categoryToRemove)
    );
  };

  // Check if the category exists in specifications before deleting
  const removeCategorySingle = (categoryToRemove: any) => {
    // Remove category if not in use
    setSpecCategories(
      specCategories.filter((category) => category !== categoryToRemove)
    );
  };
  const handleEditSpec = (category: any, key: any) => {
    const value = productDetailForm.getValues(
      `specifications.${category}.${key}`
    );
    setEditingCategory(category);
    setEditingKey(key);
    setIsEditing(true);

    // Set the existing key and value into the form fields
    productDetailForm.setValue(`specifications.${category}.newKey`, key);
    productDetailForm.setValue(`specifications.${category}.newValue`, value);
  };

  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      (product?.description &&
        product?.description
          .toLowerCase()
          .includes(productSearchTerm.toLowerCase()))
  );

  const filteredProductDetails = productDetails?.filter(
    (detail) =>
      detail.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      products
        .find((p) => p.id === detail.product_id)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleImageUploadImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("⚠️ No file selected. Exiting upload process.");
      return;
    }

    console.log("📂 File selected for upload:", file.name);

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const params = {
        Bucket: "sailing-club",
        Key: filePath,
        Body: file,
        ContentType: file.type,
      };

      const command = new PutObjectCommand(params);
      const uploadResult = await s3Client.send(command);
      console.log("✅ File uploaded successfully:", uploadResult);
      const uploadedUrl = `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${filePath}`;

      productForm.setValue("image_url", uploadedUrl);
      toast.success("🎉 Image uploaded successfully!");
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      toast.error("Error uploading image. Please try again.");
    } finally {
      setUploadingImage(false);
      console.log("🏁 Upload process completed.");
    }
  };

  // const handleImageUploadImage = async (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;

  //   setUploadingImage(true);
  //   try {
  //     const fileExt = file.name.split(".").pop();
  //     const fileName = `${Math.random()}.${fileExt}`;
  //     const filePath = `product-images/${fileName}`;

  //     const { error: uploadError } = await supabase.storage
  //       .from("images")
  //       .upload(filePath, file);

  //     if (uploadError) {
  //       throw uploadError;
  //     }

  //     const { data } = supabase.storage.from("images").getPublicUrl(filePath);

  //     if (data?.publicUrl) {
  //       productForm.setValue("image_url", data.publicUrl);
  //       toast.success("Image uploaded successfully");
  //     }
  //   } catch (error) {
  //     toast.error("Error uploading image");
  //     console.error("Error uploading image:", error);
  //   } finally {
  //     setUploadingImage(false);
  //   }
  // };

  const availableProducts = useMemo(() => {
    const productIdsWithDetails = new Set(
      productDetails?.map((detail) => detail.product_id)
    );
    return products.filter(
      (product) => !productIdsWithDetails.has(product.id as string)
    );
  }, [products, productDetails]);

  const handleProductSelect = (value: string) => {
    setSelectedProductId(value);
  };

  console.log("Amenity Fields:", amenityFields);
  console.log("Form State:", productDetailForm.getValues());

  return (
    <>
      <DevTool placement="top-right" control={productDetailForm.control} />
      <ScrollToTop />
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
                    productMutation.mutate(data)
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
                            value={field.value ? Number(field.value) : ""}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
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
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Image</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUploadImage}
                              disabled={uploadingImage}
                            />
                            {field.value && (
                              <img
                                src={field.value}
                                alt="Product"
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload an image for the product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="href"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>slug</FormLabel>
                        <FormControl>
                          <Input placeholder="Product name" {...field} />
                        </FormControl>
                        <FormDescription>Enter the slug name.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={productForm.control}
                    name="nav_section_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Navigation Section</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {navSections?.map((section: any) => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the navigation section for this product.
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
                      <p className="text-sm text-gray-500">
                        Category:{" "}
                        {
                          ((navSections as any) ?? {})?.find(
                            (s: any) => s.id === product.nav_section_id
                          )?.name
                        }
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(product.id as string);
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
                                onClick={() =>
                                  deleteProductMutation.mutate(
                                    product.id as string
                                  )
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
              {availableProducts.length === 0 && !editingProductDetail ? (
                <div className="text-center py-8">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                    No Products Available
                  </h3>
                  <p className="text-gray-500">
                    All products have details added. Create a new product first.
                  </p>
                </div>
              ) : (
                <Form {...productDetailForm}>
                  <form
                    // onSubmit={productDetailForm.handleSubmit((data) =>
                    //   productDetailMutation.mutate(data)
                    // )}

                    onSubmit={productDetailForm.handleSubmit((data) => {
                      console.log("checking");
                      const formattedData = {
                        ...data,
                        amenities: data.amenities || [],
                      };
                      productDetailMutation.mutate(formattedData);
                    })}
                    className="space-y-8"
                  >
                    {/* <FormField
                    control={productDetailForm.control}
                    name="product_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleProductSelect(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          

                            {availableProducts?.map((product) => (
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
                  /> */}

                    <FormField
                      control={productDetailForm.control}
                      name="product_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Product</FormLabel>
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={open}
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? availableProducts.find(
                                        (product) => product.id === field.value
                                      )?.name
                                    : "Select a product"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-full p-0"
                              align="start"
                              side="bottom"
                              sideOffset={5}
                            >
                              <Command className="w-full">
                                <CommandInput
                                  className="w-full"
                                  placeholder="Search products..."
                                />
                                <CommandEmpty>No product found.</CommandEmpty>
                                <CommandGroup className="w-full">
                                  <CommandList>
                                    {availableProducts?.map((product) => (
                                      <CommandItem
                                        key={product.id}
                                        value={product.name}
                                        onSelect={() => {
                                          field.onChange(product.id);
                                          handleProductSelect(
                                            product.id as string
                                          );
                                          setOpen(false);
                                        }}
                                        className="w-full"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            product.id === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {product.name}
                                      </CommandItem>
                                    ))}
                                  </CommandList>
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
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
                    {/* <FormField
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
                    /> */}
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
                                  "internal_images",
                                  selectedProductId ?? ""
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
                                  "external_images",
                                  selectedProductId ?? ""
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

                    {amenityFields && amenityFields.length > 0 ? (
                      <div>
                        <div className="flex justify-between">
                          {" "}
                          <h3 className="text-lg font-semibold mb-2">
                            Amenities
                          </h3>
                          <Button
                            type="button"
                            variant="default"
                            onClick={() =>
                              insert(0, { feature: "", value: "" })
                            }
                          >
                            Add Amenity
                          </Button>
                        </div>
                        <ScrollArea className="h-[30rem] overflow-y-auto">
                          <div className="">
                            {/* <h3 className="text-lg font-semibold mb-2">
                            Amenities
                          </h3> */}

                            {amenityFields?.map((field, index) => (
                              <div
                                key={field.id}
                                className="flex space-x-2 mb-2"
                              >
                                <FormField
                                  control={productDetailForm.control}
                                  name={`amenities.${index}.feature`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          placeholder="Feature"
                                          {...field}
                                        />
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
                                        <Input
                                          placeholder="Value"
                                          {...field}
                                          value={
                                            typeof field.value === "string"
                                              ? field.value
                                              : JSON.stringify(field.value) ||
                                                ""
                                          }
                                        />
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
                          </div>
                        </ScrollArea>
                      </div>
                    ) : (
                      <>
                        {" "}
                        <h3 className="text-lg font-semibold mb-2">
                          Amenities
                        </h3>
                      </>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Specifications
                      </h3>
                      <ScrollArea className="h-[37.5rem] overflow-y-auto">
                        <div>
                          {/* <h3 className="text-lg font-semibold mb-2">
                            Specifications
                          </h3> */}
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
                              <CardHeader className="flex flex-row justify-between">
                                <CardTitle>{category}</CardTitle>
                                <Button
                                  onClick={() => removeCategorySingle(category)}
                                  className="bg-red-500 m-2"
                                >
                                  Remove
                                </Button>
                              </CardHeader>
                              <CardContent>
                                <FormField
                                  control={productDetailForm.control}
                                  name={`specifications.${category}.newKey`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          placeholder="New Key"
                                          {...field}
                                        />
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
                                        <Input
                                          placeholder="New Value"
                                          {...field}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                {/* <Button
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
                          </Button> */}

                                <Button
                                  type="button"
                                  onClick={() => {
                                    // 1. Get the 'key' and 'value' that the user is trying to add or edit
                                    const key = productDetailForm.getValues(
                                      `specifications.${category}.newKey`
                                    );
                                    const value = productDetailForm.getValues(
                                      `specifications.${category}.newValue`
                                    );

                                    // 2. Check if both key and value are not empty (form validation step)
                                    if (key && value) {
                                      // 3. Check if we're in 'edit mode'. 'isEditing' determines if we're updating an existing spec.
                                      //    'editingCategory' tells us if this is the category being edited, and 'editingKey' is the spec key being edited.
                                      if (
                                        isEditing &&
                                        editingCategory === category &&
                                        editingKey === key
                                      ) {
                                        // 4. Update the existing specification under the given category and key

                                        productDetailForm.setValue(
                                          `specifications.${category}.${editingKey}` as any,
                                          value
                                        );
                                      } else {
                                        // 5. If we're not in 'edit mode', we are adding a new specification
                                        productDetailForm.setValue(
                                          `specifications.${category}.${key}`,
                                          value
                                        );
                                      }

                                      // 6. Clear the form fields for adding a new spec (this ensures the form is reset after the add/update action)
                                      productDetailForm.setValue(
                                        `specifications.${category}.newKey`,
                                        ""
                                      );
                                      productDetailForm.setValue(
                                        `specifications.${category}.newValue`,
                                        ""
                                      );

                                      // 7. Reset 'edit mode' after the action is complete
                                      setIsEditing(false); // This puts the button back to "Add Specification" mode
                                    }
                                  }}
                                >
                                  {/* 8. Conditionally render the button text: If in edit mode for this specific category, show "Update Specification",
        otherwise show "Add Specification" */}
                                  {isEditing && editingCategory === category
                                    ? "Update Specification"
                                    : "Add Specification"}
                                </Button>

                                <Button
                                  onClick={() => removeCategory(category)}
                                  className="bg-red-500 m-2"
                                >
                                  Remove
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
                                          onClick={() =>
                                            handleEditSpec(category, key)
                                          }
                                        >
                                          Edit
                                        </Button>
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
                      </ScrollArea>
                    </div>

                    <Button type="submit">
                      {editingProductDetail
                        ? "Update Product Detail"
                        : "Add Product Detail"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>

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
                {filteredProductDetails.length === 0 ? (
                  <div className="text-center py-8">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Product Details Found
                    </h3>
                    <p className="text-gray-500">
                      Try adjusting your search or add new product details.
                    </p>
                  </div>
                ) : (
                  filteredProductDetails?.map((detail) => (
                    <Card key={detail.id} className="mb-4">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold">
                          {detail.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Product:{" "}
                          {
                            products.find((p) => p.id === detail.product_id)
                              ?.name
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          {detail.subtitle}
                        </p>
                        <p className="text-sm">{detail.description}</p>
                        <div className="flex space-x-2 mt-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingProductDetail(detail.id as string);
                              productDetailForm.reset(detail as any);
                              setSelectedProductId(detail.product_id as string);
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
                                  permanently delete the product detail and
                                  remove it from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteProductDetailMutation.mutate(
                                      detail.id as string
                                    )
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
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

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
                                deleteProductDetailMutation.mutate(detail.id)
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
        </Card> */}
        </TabsContent>
      </Tabs>
    </>
  );
}

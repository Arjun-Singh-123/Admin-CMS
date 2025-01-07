import { Product, ProductDetail } from "@/schemas/product-schema";
import {
  deleteProductById,
  deleteProductDetailById,
  saveProduct,
  saveProductDetail,
} from "@/services/product-services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useProductDetailMutation = (
  editingProductDetail: string | null,
  resetForm: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductDetail) =>
      saveProductDetail(data, editingProductDetail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productDetails"] });

      toast.success(
        editingProductDetail
          ? "Product detail updated successfully"
          : "Product detail added successfully"
      );

      // Reset the form and editing state
      resetForm();
    },
    onError: (error) => {
      console.error("Error saving product detail:", error);
      toast.error("Failed to save product detail");
    },
  });
};

export const useProductMutation = (
  editingProductDetail: string | null,
  resetForm: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Product) => saveProduct(data, editingProductDetail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(
        editingProductDetail
          ? "Product updated successfully"
          : "Product added successfully"
      );
      resetForm()
    },
    onError: (error) => {
      console.error("Error saving product detail:", error);
      toast.error("Failed to save product detail");
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProductById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    },
  });
};

export const useDeleteProductDetailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProductDetailById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productDetails"] });
      toast.success("Product detail deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting product detail:", error);
      toast.error("Failed to delete product detail");
    },
  });
};

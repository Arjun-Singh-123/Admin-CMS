import {
  backendRevalidateAllProducts,
  backendRevalidateProduct,
} from "../actions/backend-revalidate";

export default function AdminPage() {
  async function handleRevalidateProduct(formData: FormData) {
    "use server";
    const productId = formData.get("productId") as string;
    await backendRevalidateProduct(productId);
  }

  async function handleRevalidateAllProducts() {
    "use server";
    await backendRevalidateAllProducts();
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin: Revalidate Products</h1>
      <form action={handleRevalidateProduct} className="mb-4">
        <input
          type="text"
          name="productId"
          placeholder="Enter product ID"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Revalidate Product
        </button>
      </form>
      <form action={handleRevalidateAllProducts}>
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Revalidate All Products
        </button>
      </form>
    </div>
  );
}

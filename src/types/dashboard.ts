export interface Section {
  id: string;
  name: string;
  status: string;
  display_order: number;
}
export const BASE_API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PROD_API_URL
    : process.env.NEXT_PUBLIC_BASE_API_URL;

export interface Product {
  id: string;
  name: string;
  href: string;
  product_details: any;
}

export interface NavSection {
  id: string;
  name: string;
  href: string;
  status: string;
  parent_id?: string;
  products: Product[];
}

export interface NavItem {
  id: string;
  name: string;
  href: string;
  status: string;
  nav_sections: NavSection[];
}

export interface UserSelection {
  id: string;
  section_id: string;
  product_id: string;
  is_external_image: boolean;
}
export interface Category {
  category: string;
}

export interface Subcategory {
  subcategory: string;
}

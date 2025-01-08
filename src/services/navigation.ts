"use server";
import {
  fetchNavItemsFromDB,
  insertNavItemToDB,
  updateNavItemInDB,
  deleteNavItemFromDB,
  insertNavSectionToDB,
  updateNavSectionInDB,
  deleteNavSectionFromDB,
  fetchContactsFromDB,
  updateContactInDB,
  deleteContactFromDB,
  insertContactInDB,
} from "@/lib/queries/navigation";
import { Contact } from "@/schemas/enhanced-menu-schema";
import { NavItem, NavSection } from "@/types/dashboard";

export async function fetchNavItems(): Promise<NavItem[]> {
  return fetchNavItemsFromDB();
}

export async function createNavItem(
  data: Omit<NavItem, "id" | "nav_sections">
): Promise<void> {
  await insertNavItemToDB(data);
}

export async function updateNavItem(
  id: string,
  data: Omit<NavItem, "id" | "nav_sections">
): Promise<void> {
  await updateNavItemInDB(id, data);
}

export async function deleteNavItem(id: string): Promise<void> {
  await deleteNavItemFromDB(id);
}

export async function createNavSection(
  data: Omit<NavSection, "id" | "products">
): Promise<void> {
  await insertNavSectionToDB(data);
}

export async function updateNavSection(
  id: string,
  data: Omit<NavSection, "id" | "products">
): Promise<void> {
  await updateNavSectionInDB(id, data);
}

export async function deleteNavSection(id: string): Promise<void> {
  await deleteNavSectionFromDB(id);
}

export async function fetchContacts(): Promise<Contact[]> {
  return fetchContactsFromDB();
}

export async function createContact(data: Omit<Contact, "id">): Promise<void> {
  await insertContactInDB(data);
}

export async function updateContact(
  id: string,
  data: Omit<Contact, "id">
): Promise<void> {
  await updateContactInDB(id, data);
}

export async function deleteContact(id: string): Promise<void> {
  await deleteContactFromDB(id);
}

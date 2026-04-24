import Category from "@/types/category";
import { createContext, use, useContext, useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import * as categoryService from "@/services/categoryService";
import { DEFAULT_CATEGORIES } from "@/constants/defaultCategories";

type CategoryContextType = {
    categories: Category[];
    addCategory: (category: Omit<Category, "id">) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    updateCategory: (id: string, data: any) => Promise<void>;
    loadCategories: () => Promise<void>;
    getCategoryById: (id: string) => Promise<Category>;
    getCategoriesByWalletId: (walletId: string) => Promise<Category[]>;
};

const CategoryContext = createContext({} as CategoryContextType);

export function CategoryProvider({ children }: any) {
  const [userCategories, setUserCategories] = useState<Category[]>([]);
  const {token, isReady} = useContext(AuthContext);
  const allCategories = [...DEFAULT_CATEGORIES, ...userCategories]

  async function loadCategories() {
    const data = await categoryService.loadCategorires();

    const userOnly = data.filter((c: Category) => c.type !== "default");
    setUserCategories(userOnly);
  }

  async function addCategory(category: Omit<Category, "id">) {
    const newCategory = await categoryService.addCategory(category);

    setUserCategories((prev) => [...prev, newCategory]);
  }

  async function updateCategory(id: string, data: any){
    const updateCategory = await categoryService.updateCategory(id, data);

    setUserCategories((prev) => prev.map((userCategories) => (userCategories.id === id ? updateCategory : userCategories)));
  }

  async function deleteCategory(id: string) {
    await categoryService.deleteCategory(id);

    setUserCategories((prev) => prev.filter((userCategories) => userCategories.id !== id));
  }

  async function getCategoryById(id: string) {
    const category = await categoryService.getCategoryById(id);
    return category;
  }

  async function getCategoriesByWalletId(walletId: string) {
    const categories = await categoryService.getCategoriesByWalletId(walletId);
    return categories;
  }

useEffect(() => {
  if (!isReady || !token) return 

  loadCategories();
}, [isReady, token]);

return(
  <CategoryContext.Provider
    value={{
      categories: allCategories,
      addCategory: addCategory,
      deleteCategory: deleteCategory,
      updateCategory: updateCategory,
      loadCategories: loadCategories,
      getCategoryById: getCategoryById,
      getCategoriesByWalletId: getCategoriesByWalletId
    }}
  >
    {children}
  </CategoryContext.Provider>
)

}

export function useCategory() {
  return useContext(CategoryContext);
}
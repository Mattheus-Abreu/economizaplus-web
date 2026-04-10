import Category from "@/types/category";
import { createContext, use, useContext, useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import * as categoryService from "@/services/categoryService";

type CategoryContextType = {
    categories: Category[];
    addCategory: (category: Category) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    updateCategory: (id: string, data: any) => Promise<void>;
    loadCategories: () => Promise<void>;
    getCategoryById: (id: string) => Promise<Category>;
    getCategoriesByWalletId: (walletId: string) => Promise<Category[]>;
};

const CategoryContext = createContext({} as CategoryContextType);

export function CategoryProvider({ children }: any) {
  const [category, setCategory] = useState<Category[]>([]);
  const {token, isReady} = useContext(AuthContext);

  async function loadCategories() {
    const data = await categoryService.loadCategorires();

    setCategory(data);
  }

  async function createCategory(category: Category) {
    const newCategory = await categoryService.createCategory(category);
    
    setCategory((prev) => [...prev, newCategory]);
  }

  async function updateCategory(id: string, data: any){
    const updateCategory = await categoryService.updateCategory(id, data);

    setCategory((prev) => prev.map((category) => (category.id === id ? updateCategory : category)));
  }

  async function deleteCategory(id: string) {
    await categoryService.deleteCategory(id);

    setCategory((prev) => prev.filter((category) => category.id !== id));
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
      categories: category,
      addCategory: createCategory,
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
import { useQuery } from '@tanstack/react-query';
import { categoryService, Category } from '../services/category.service';

export const usePublicCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['publicCategories'],
    queryFn: () => categoryService.getPublicCategories(),
  });
};

export const useAdminCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['adminCategories'],
    queryFn: () => categoryService.getAllCategories(),
  });
};

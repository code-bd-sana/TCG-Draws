"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Category, categoryService } from "../../../../services/category.service";
import CategoryStatsCards from "../../../../components/dashboard/admin/CategoryStatsCards";
import CategoryFormModal from "../../../../components/dashboard/admin/CategoryFormModal";
import ConfirmDeleteCategoryModal from "../../../../components/dashboard/admin/ConfirmDeleteCategoryModal";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Partial<Category> | null>(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      toast.error("Failed to load competition categories");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedCategory(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setIsEditMode(true);
    setSelectedCategory(category);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      const updated = await categoryService.updateCategory(category.id, { isActive: !category.isActive });
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, isActive: updated.isActive } : c))
      );
      toast.success(
        `Category "${category.name}" is now ${updated.isActive ? "Active (visible)" : "Inactive (hidden)"}`
      );
    } catch (err: any) {
      console.error("Failed to toggle status", err);
      toast.error(err?.response?.data?.message || "Failed to update category status");
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete category", err);
      toast.error(
        err?.response?.data?.message || "Failed to delete category. It may be in use by active competitions."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      // Status filter
      if (statusFilter === "ACTIVE" && !c.isActive) return false;
      if (statusFilter === "INACTIVE" && c.isActive) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchSlug = c.slug.toLowerCase().includes(q);
        const matchIcon = (c.icon || "").toLowerCase().includes(q);
        if (!matchName && !matchSlug && !matchIcon) return false;
      }

      return true;
    });
  }, [categories, statusFilter, searchQuery]);

  return (
    <div className="relative flex flex-col gap-8 p-4 sm:p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn font-sans">
      {/* Background ambient lighting for luxury aesthetic */}
      <div 
        className="pointer-events-none absolute -top-24 right-1/4 w-[500px] h-[300px] bg-[radial-gradient(ellipse_at_center,_var(--color-accent-bg)_0%,_transparent_70%)] blur-3xl opacity-60" 
        aria-hidden="true" 
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-divider pb-6">
        <div className="flex flex-col gap-2">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-sans text-text-muted">
            <Link 
              href="/dashboard/admin" 
              className="hover:text-text-primary transition-colors flex items-center gap-1"
            >
              <span>Admin Hub</span>
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-text-brand font-semibold">Competition Categories</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
              Competition Categories Catalog
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-heading font-bold text-[11px] uppercase tracking-wider">
              Catalog Master
            </span>
          </div>

          <p className="font-sans text-xs sm:text-sm text-text-muted max-w-2xl leading-relaxed">
            Organize competition categories, upload card visual banners, manage homepage icon badges, and configure public visibility.
          </p>
        </div>

        {/* Live System Badge + Add Category Action */}
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-border text-xs font-sans shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-bold text-text-primary text-[11px] tracking-wide uppercase font-heading">
              Catalog Active
            </span>
          </div>

          <button
            onClick={openAddModal}
            className="btn-gold-metallic h-10 px-4 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <CategoryStatsCards categories={categories} isLoading={isLoading} />

      {/* Filter and Instant Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Instant Search Bar */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by name, slug, or icon..."
            className="input-obsidian w-full h-10 pl-10 pr-9 rounded-xl font-sans text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs cursor-pointer"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
          {(
            [
              { id: "ALL", label: "All Categories", count: categories.length },
              { id: "ACTIVE", label: "Active", count: categories.filter((c) => c.isActive).length },
              { id: "INACTIVE", label: "Hidden", count: categories.filter((c) => !c.isActive).length },
            ] as const
          ).map((filter) => {
            const isActive = statusFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`px-3.5 py-1.5 rounded-full font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? "bg-primary text-[#090A0E] font-black shadow-lg shadow-primary/20 border border-primary"
                    : "bg-surface border border-border text-text-muted hover:text-text-primary hover:border-border-medium"
                }`}
              >
                <span>{filter.label}</span>
                <span className={`text-[10px] font-mono font-bold ${isActive ? "text-[#090A0E]" : "text-text-muted"}`}>
                  ({filter.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories Table Container in Luxury Art-Deco Card */}
      <div className="art-deco-card rounded-card overflow-hidden shadow-card border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-accent-bg/40">
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider w-[80px]">
                  Banner
                </th>
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider">
                  Category Name
                </th>
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider">
                  Slug / URL Path
                </th>
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider text-center">
                  Icon Badge
                </th>
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider text-center">
                  Public Status
                </th>
                <th className="py-4 px-6 font-heading font-bold text-[11px] text-text-muted uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-sans text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="animate-spin w-6 h-6 text-text-brand" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="font-heading font-bold text-xs uppercase tracking-wider">
                        Loading competition categories...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-text-muted/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                      </svg>
                      <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
                        No competition categories found
                      </span>
                      <p className="text-xs text-text-muted">
                        Try adjusting your search criteria or add a new category.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-accent-bg/30 transition-colors group"
                  >
                    {/* Banner Image */}
                    <td className="py-4 px-6">
                      {category.image ? (
                        <div className="w-12 h-10 rounded-lg overflow-hidden border border-primary/30 shadow-xs bg-surface">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-surface border border-border flex items-center justify-center shadow-xs">
                          <svg
                            className="w-4 h-4 text-text-muted"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col min-w-0">
                        <span className="font-heading font-black text-xs sm:text-sm text-text-primary group-hover:text-text-brand transition-colors">
                          {category.name}
                        </span>
                        <span className="font-mono text-[10px] text-text-muted truncate max-w-[200px]">
                          ID: {category.id.slice(0, 8)}...
                        </span>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-surface border border-border font-mono text-xs text-text-muted">
                        /{category.slug}
                      </span>
                    </td>

                    {/* Icon */}
                    <td className="py-4 px-6 text-center">
                      {category.icon ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-mono font-bold text-[11px]">
                          <span>✦</span>
                          <span>{category.icon}</span>
                        </span>
                      ) : (
                        <span className="text-text-muted text-xs">—</span>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleStatus(category)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer shadow-xs ${
                          category.isActive
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-neutral-800 border border-neutral-700 text-neutral-400 hover:bg-neutral-700/50"
                        }`}
                        title="Click to toggle public visibility"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${category.isActive ? "bg-emerald-400" : "bg-neutral-400"}`}
                        />
                        {category.isActive ? "Active (Live)" : "Hidden"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="btn-dark-metallic h-8 px-3 rounded-lg font-heading font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                          title="Edit Category Details"
                        >
                          <svg
                            className="w-3.5 h-3.5 text-text-brand"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => openDeleteModal(category)}
                          className="btn-dark-metallic h-8 w-8 rounded-lg flex items-center justify-center text-rose-400 hover:text-rose-300 hover:border-rose-500/40 transition-all cursor-pointer"
                          title="Delete Category"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Meta Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-accent-bg/20">
          <div className="text-xs text-text-muted font-sans">
            Showing <span className="font-bold text-text-primary">{filteredCategories.length}</span> of{" "}
            <span className="font-bold text-text-primary">{categories.length}</span> total competition categories
          </div>
        </div>
      </div>

      {/* Draggable Category Create / Edit Form Modal */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        category={selectedCategory}
        isEditMode={isEditMode}
        onSaveSuccess={fetchCategories}
      />

      {/* Draggable Delete Confirmation Modal */}
      <ConfirmDeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        category={categoryToDelete}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

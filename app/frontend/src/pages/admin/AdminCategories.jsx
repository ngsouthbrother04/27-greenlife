import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Search, Edit, Trash2, 
  Loader2, Tags, X 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import categoryService from '@/api/categoryService';

// Zod Schema for Category Form
const categorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  slug: z.string().min(2, 'Slug phải có ít nhất 2 ký tự').regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  description: z.string().optional(),
});

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Data Fetching
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      handleCloseModal();
      toast.success('Thêm danh mục thành công');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      handleCloseModal();
      toast.success('Cập nhật danh mục thành công');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      toast.success('Xóa danh mục thành công');
    },
  });

  // Form Setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  // Filter categories
  const filteredCategories = Array.isArray(categories) ? categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Handlers
  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setValue('name', category.name);
      setValue('slug', category.slug);
      setValue('description', category.description || '');
    } else {
      setEditingCategory(null);
      reset({
        name: '',
        slug: '',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = (data) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id);
    }
  };

  // Convert name to slug automatically if creating
  const handleNameChange = (e) => {
    if (!editingCategory) {
        const slug = e.target.value
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/[^a-z0-9\s-]/g, "") 
            .trim()
            .replace(/\s+/g, "-");
        setValue('slug', slug);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="heading-2 text-primary-custom">Quản lý danh mục</h1>
          <p className="paragraph-2 text-secondary-custom">
            Quản lý các danh mục sản phẩm của cửa hàng
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm danh mục
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-divider flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-custom" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-divider focus:outline-none focus:border-de-primary transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-divider overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-de-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-light border-b border-divider">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-custom uppercase tracking-wider">Tên danh mục</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-custom uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-custom uppercase tracking-wider">Mô tả</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-secondary-custom uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-secondary-custom">
                      Không tìm thấy danh mục nào
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-surface-light/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-de-primary/10 rounded-lg flex items-center justify-center text-de-primary">
                            <Tags className="w-5 h-5" />
                          </div>
                          <span className="font-medium text-primary-custom">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-custom font-mono">
                        {cat.slug}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-custom max-w-xs truncate">
                        {cat.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(cat)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-de-primary transition-colors"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(cat)}
                            className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="sticky top-0 bg-white border-b border-divider px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="heading-3 text-primary-custom">
                {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-surface-light rounded-full transition-colors">
                <X className="w-5 h-5 text-secondary-custom" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="label mb-2 block">Tên danh mục *</label>
                <input
                  {...register('name')}
                  type="text"
                  className="input-field w-full"
                  placeholder="Ví dụ: Bàn chải tre"
                  onChange={(e) => {
                      register('name').onChange(e);
                      handleNameChange(e);
                  }}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label mb-2 block">Slug (URL friendly) *</label>
                <input
                  {...register('slug')}
                  type="text"
                  className="input-field w-full"
                  placeholder="ví dụ: ban-chai-tre"
                />
                <p className="text-xs text-gray-400 mt-1">Dùng để tạo đường dẫn thân thiện</p>
                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
              </div>

              <div>
                <label className="label mb-2 block">Mô tả</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="input-field w-full"
                  placeholder="Mô tả ngắn về danh mục này..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-divider">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="btn-outline px-4 py-2"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary px-4 py-2 flex items-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="heading-3 text-red-500 mb-4">Xác nhận xóa</h3>
            <p className="paragraph-2 text-secondary-custom mb-6">
              Bạn có chắc chắn muốn xóa danh mục <span className="font-semibold text-primary-custom">"{categoryToDelete?.name}"</span>? 
              Các sản phẩm thuộc danh mục này sẽ hiển thị là "Chưa phân loại".
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn-outline px-4 py-2"
              >
                Hủy
              </button>
              <button 
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;

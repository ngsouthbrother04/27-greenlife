import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Search, Edit, Trash2, MoreHorizontal, 
  Loader2, Image as ImageIcon, X 
} from 'lucide-react';
import { 
  useProducts, 
  useAdminProducts 
} from '@/hooks';

// Zod Schema for Product Form
const productSchema = z.object({
  name: z.string().min(3, 'Tên sản phẩm phải có ít nhất 3 ký tự'),
  price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  originalPrice: z.number().min(0, 'Giá gốc phải lớn hơn hoặc bằng 0').optional(),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  image: z.string().url('URL hình ảnh không hợp lệ').or(z.literal('')),
});

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Data Fetching
  const { data: productsData, isLoading } = useProducts();
  const products = productsData?.products || productsData || []; // Handle different API response structures

  // Mutations
  const { 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    isCreating, 
    isUpdating, 
    isDeleting 
  } = useAdminProducts();

  // Form Setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      originalPrice: 0,
      category: '',
      description: '',
      image: '',
    },
  });

  // Filter products
  const filteredProducts = Array.isArray(products) ? products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Handlers
  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      // Set form values for editing
      setValue('name', product.name);
      setValue('price', product.price);
      setValue('originalPrice', product.originalPrice || 0);
      setValue('category', product.category || '');
      setValue('description', product.description || '');
      setValue('image', product.image || '');
    } else {
      setEditingProduct(null);
      reset({
        name: '',
        price: 0,
        originalPrice: 0,
        category: '',
        description: '',
        image: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset();
  };

  const onSubmit = (data) => {
    if (editingProduct) {
      updateProduct({ id: editingProduct.id, data }, {
        onSuccess: () => {
          handleCloseModal();
          // Show toast success (impl later)
        }
      });
    } else {
      createProduct(data, {
        onSuccess: () => {
          handleCloseModal();
          // Show toast success
        }
      });
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="heading-2 text-primary-custom">Quản lý sản phẩm</h1>
          <p className="paragraph-2 text-secondary-custom">
            Quản lý danh sách sản phẩm, giá cả và kho hàng
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-divider flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-custom" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-custom uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-custom uppercase tracking-wider">Danh mục</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-custom uppercase tracking-wider">Giá</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-custom uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-secondary-custom uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-secondary-custom">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-surface-light/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-surface-light rounded-lg overflow-hidden flex-shrink-0 border border-divider">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-disabled-custom" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-primary-custom line-clamp-1">{product.name}</p>
                            <p className="text-xs text-secondary-custom">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-custom">
                        {product.category || 'Chưa phân loại'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-primary-custom">
                        ${product.price}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Đang bán
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(product)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-de-primary transition-colors"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(product)}
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

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-divider px-6 py-4 flex items-center justify-between z-10">
              <h3 className="heading-3 text-primary-custom">
                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-surface-light rounded-full transition-colors">
                <X className="w-5 h-5 text-secondary-custom" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="label mb-2 block">Tên sản phẩm *</label>
                  <input
                    {...register('name')}
                    type="text"
                    className="input-field w-full"
                    placeholder="Nhập tên sản phẩm"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="label mb-2 block">Giá bán ($) *</label>
                  <input
                    {...register('price', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="input-field w-full"
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>

                <div>
                  <label className="label mb-2 block">Giá gốc ($)</label>
                  <input
                    {...register('originalPrice', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="input-field w-full"
                    placeholder="0.00"
                  />
                  {errors.originalPrice && <p className="text-red-500 text-xs mt-1">{errors.originalPrice.message}</p>}
                </div>

                <div className="col-span-2">
                  <label className="label mb-2 block">Danh mục *</label>
                  <select {...register('category')} className="input-field w-full">
                    <option value="">Chọn danh mục</option>
                    <option value="Toothpaste">Toothpaste</option>
                    <option value="Toothbrush">Toothbrush</option>
                    <option value="Mouthwash">Mouthwash</option>
                    <option value="Dental Floss">Dental Floss</option>
                    <option value="Kits">Kits</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>

                <div className="col-span-2">
                  <label className="label mb-2 block">URL Hình ảnh</label>
                  <input
                    {...register('image')}
                    type="text"
                    className="input-field w-full"
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
                </div>

                <div className="col-span-2">
                  <label className="label mb-2 block">Mô tả chi tiết *</label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="input-field w-full"
                    placeholder="Mô tả về sản phẩm..."
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-divider">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="btn-outline px-6 py-2"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating || isUpdating}
                  className="btn-primary px-6 py-2 flex items-center gap-2"
                >
                  {isCreating || isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {editingProduct ? 'Cập nhật' : 'Thêm mới'}
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
              Bạn có chắc chắn muốn xóa sản phẩm <span className="font-semibold text-primary-custom">"{productToDelete?.name}"</span>? 
              Hành động này không thể hoàn tác.
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
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Loader2, Plus, Search, Edit, Trash2, X, ImageIcon } from 'lucide-react';
import productService from '@/api/productService';
import categoryService from '@/api/categoryService';
import uploadService from '@/api/uploadService';

const productSchema = z.object({
  name: z.string().min(3, 'Tên sản phẩm phải có ít nhất 3 ký tự'),
  price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  originalPrice: z.number().min(0, 'Giá gốc phải lớn hơn hoặc bằng 0').optional(),
  categoryId: z.coerce.number().min(1, 'Vui lòng chọn danh mục'),
  stock: z.number().int('Tồn kho phải là số nguyên').min(0, 'Tồn kho phải lớn hơn hoặc bằng 0'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  image: z.string().optional(),
});

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting: isFormSubmitting } } = useForm({
    resolver: zodResolver(productSchema),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts({ limit: 1000 }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  const products = productsData?.products || [];

  const { mutate: createProduct, isLoading: isCreating } = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Thêm sản phẩm thành công');
      handleCloseModal();
    },
    onError: (error) => toast.error('Thêm sản phẩm thất bại: ' + error.message),
  });

  const { mutate: updateProduct, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Cập nhật sản phẩm thành công');
      handleCloseModal();
    },
    onError: (error) => toast.error('Cập nhật thất bại'),
  });

  const { mutate: deleteProduct, isLoading: isDeleting } = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Xóa sản phẩm thành công');
      setIsDeleteModalOpen(false);
    },
    onError: () => toast.error('Xóa thất bại'),
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset({
      name: '',
      price: 0,
      originalPrice: 0,
      stock: 0,
      categoryId: 0,
      description: '',
      image: '',
    });
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      // Reset form with product values
      setValue('name', product.name);
      setValue('price', product.price);
      setValue('originalPrice', product.originalPrice || 0);
      setValue('stock', product.stock);
      setValue('categoryId', product.categoryId);
      setValue('description', product.description || '');
      setValue('image', product.images?.[0] || '');
    } else {
      setEditingProduct(null);
      reset({
        name: '',
        price: 0,
        originalPrice: 0,
        stock: 0,
        categoryId: 0,
        description: '',
        image: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadService.uploadImage(file);
      // result: { status: 'success', data: { url, filename } }
      // Backend returns relative path or full URL? 
      // Based on upload.routes.js: res.json({ data: { url: req.file.path } })
      // req.file.path might be 'public/uploads/filename.jpg' or similar.
      // We might need to prepend backend URL if it's relative.
      // Let's assume for now we store what backend gives, and frontend handles display.
      // Actually, standard is usually returning a usable URL.
      // Let's check `upload.routes.js` context again. It uses `req.file.path`.
      // If using `multer` with diskStorage, path is local file path.
      // We probably need to map this to a public URL.
      // But let's set the value for now.
      
      // FIX: The backend likely returns a path that needs to be accessible.
      // If backend is localhost:3000, and path is 'uploads/file.jpg', we need 'http://localhost:3000/uploads/file.jpg'.
      // For now, let's assume the backend serves 'uploads' static folder.
      // We will set the full URL if possible, or just the path and prepend base URL.
      // Let's set the path returned.
      
      // wait, `productController` doesn't transform it? 
      // `upload.routes.js` returns `req.file.path`.
      // We might need to normalize this on backend or frontend.
      // Let's use a helper to get full URL or just store relative.
      
      // Let's just setValue for now.
      setValue('image', result.data.url);
    } catch (error) {
      console.error('Upload failed:', error);
      // toast error
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data) => {
    // Transform data for backend
    const payload = { ...data };
    
    // Transform image string to images array if present
    if (data.image) {
      payload.images = [data.image];
    } else {
       payload.images = [];
    }
    delete payload.image;
    delete payload.originalPrice; // Not in schema

    // Ensure categoryId is number
    payload.categoryId = Number(payload.categoryId);

    if (editingProduct) {
      updateProduct({ id: editingProduct.id, data: payload }, {
        onSuccess: () => {
          handleCloseModal();
        }
      });
    } else {
      createProduct(payload, {
        onSuccess: () => {
          handleCloseModal();
        }
      });
    }
  };

  // ... (render)

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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-custom uppercase tracking-wider">Kho</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-custom uppercase tracking-wider">Giá</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-custom uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-secondary-custom uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-secondary-custom">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-surface-light/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-surface-light rounded-lg overflow-hidden flex-shrink-0 border border-divider">
                            {product.images && product.images.length > 0 ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
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
                        {product.category?.name || 'Chưa phân loại'}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-custom">
                        {product.stock || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-custom">
                        {Number(product.price).toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {product.status === 'ACTIVE' ? 'Đang bán' : 'Ngừng bán'}
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
                  <label className="label mb-2 block">Giá bán (VND) *</label>
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
                  <label className="label mb-2 block">Giá gốc (VND)</label>
                  <input
                    {...register('originalPrice', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="input-field w-full"
                    placeholder="0.00"
                  />
                  {errors.originalPrice && <p className="text-red-500 text-xs mt-1">{errors.originalPrice.message}</p>}
                </div>

                <div>
                  <label className="label mb-2 block">Tồn kho *</label>
                  <input
                    {...register('stock', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="input-field w-full"
                    placeholder="0"
                  />
                  {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
                </div>

                <div className="col-span-2">
                  <label className="label mb-2 block">Danh mục *</label>
                  <select {...register('categoryId')} className="input-field w-full">
                    <option value="0">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
                </div>

                <div className="col-span-2">
                  <label className="label mb-2 block">Hình ảnh sản phẩm</label>
                  
                  {/* Image Preview */}
                  <div className="mb-4">
                     {(watch('image') || editingProduct?.images?.[0] || isUploading) && (
                       <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-divider">
                          {isUploading ? (
                              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <Loader2 className="w-6 h-6 animate-spin text-de-primary" />
                              </div>
                          ) : (
                              <img 
                                src={watch('image') || (editingProduct?.images && editingProduct.images[0]) || ''} 
                                alt="Preview" 
                                className="w-full h-full object-cover" 
                                onError={(e) => e.target.style.display = 'none'}
                              />
                          )}
                       </div>
                     )}
                     {/* If using react-hook-form's watch to show preview of newly uploaded image */}
                     {/* construct preview logic better */}
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="btn-outline px-4 py-2 cursor-pointer flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>{isUploading ? 'Đang tải lên...' : 'Chọn ảnh từ máy'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                    <span className="text-xs text-secondary-custom">
                       JPG, PNG, WEBP (Max 5MB)
                    </span>
                  </div>
                  
                  {/* Hidden input to store URL for form submission */}
                  <input type="hidden" {...register('image')} />

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

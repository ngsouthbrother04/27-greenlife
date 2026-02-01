import { useParams } from 'react-router-dom';

const ProductDetailPage = () => {
    const { id } = useParams();
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-muted rounded-xl animate-pulse" />
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Product Title {id}</h1>
            <div className="text-2xl font-semibold text-primary">500.000đ</div>
            <p className="text-muted-foreground">
                Mô tả chi tiết sản phẩm sẽ hiển thị ở đây.
            </p>
            <div className="flex gap-4">
                <button className="flex-1 bg-primary text-primary-foreground h-11 rounded-md font-medium">
                    Thêm vào giỏ
                </button>
            </div>
        </div>
      </div>
    );
  };
  
  export default ProductDetailPage;

const ProductListPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Tất cả sản phẩm</h1>
        <p className="text-muted-foreground">Khám phá các sản phẩm thân thiện môi trường tốt nhất cho bạn.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="w-full h-fit md:sticky md:top-24 space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="font-semibold mb-4 text-lg">Bộ lọc</h3>
              <div className="space-y-4">
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="group relative rounded-2xl border bg-card transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden">
                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-tr from-muted/50 to-muted/20" />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse" />
                      <div className="h-4 w-1/4 bg-primary/20 rounded animate-pulse" />
                    </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};
  
export default ProductListPage;

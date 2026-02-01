const HomePage = () => {
  return (
    <div className="space-y-12">
      <section className="text-center py-20 md:py-32 bg-gradient-to-b from-primary/5 via-accent/20 to-transparent rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518531933037-91b2f5d2294c?q=80&w=2648&auto=format&fit=crop')] opacity-5 bg-cover bg-center" />
        <div className="relative z-10 space-y-6 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl text-foreground">
            Sống xanh <span className="text-primary">bền vững</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            Giải pháp toàn diện giúp doanh nghiệp của bạn chuyển đổi xanh, tiết kiệm chi phí và bảo vệ hành tinh.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <button className="bg-primary hover:bg-primary/90 text-white h-12 px-8 rounded-full font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
              Khám phá ngay
            </button>
            <button className="border border-input bg-background hover:bg-accent text-foreground h-12 px-8 rounded-full font-medium transition-all">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-6">Sản phẩm nổi bật</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Product Cards Placeholder */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;

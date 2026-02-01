const RegisterPage = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Đăng ký</h1>
            <p className="text-sm text-muted-foreground">Tạo tài khoản mới</p>
        </div>
        
        <form className="space-y-4">
             <div className="bg-muted p-4 rounded text-center text-sm">
                Form đăng ký sẽ nằm ở đây
             </div>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                Đăng ký ngay
            </button>
        </form>
      </div>
    );
  };
  
  export default RegisterPage;

fetch('http://localhost:3000/api/products?page=2&limit=6').then(res => res.json()).then(data => {
  const returns = {
    ...data.data,
    pagination: data.pagination,
    total: data.pagination?.total
  };
  console.log("Returned:", returns.products.map(p => p.name).join(', '));
}).catch(console.error);

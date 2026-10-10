const products = [
  { name: "Family Miniature", sku: "FAM-1001", price: "₹4,999", status: "Published" },
  { name: "Couple Portrait", sku: "CPL-2201", price: "₹7,499", status: "Draft" },
  { name: "Pet Memory", sku: "PET-3302", price: "₹5,999", status: "Published" },
];

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Catalog</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Products</h1>
        </div>
        <button className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950">
          Create Product
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">SKU</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.sku} className="border-t border-slate-800">
                <td className="px-5 py-4 font-medium text-white">{product.name}</td>
                <td className="px-5 py-4 text-slate-300">{product.sku}</td>
                <td className="px-5 py-4 text-slate-300">{product.price}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                    {product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

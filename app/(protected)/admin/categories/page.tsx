const categories = [
  { name: "Family", products: 26, active: true },
  { name: "Couple", products: 18, active: true },
  { name: "Pets", products: 12, active: false },
  { name: "Wedding", products: 9, active: true },
];

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Catalog</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Categories</h1>
        </div>
        <button className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950">
          Create Category
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <div key={category.name} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{category.name}</h2>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  category.active ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-700 text-slate-300"
                }`}
              >
                {category.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-slate-400">{category.products} products</p>
          </div>
        ))}
      </div>
    </div>
  );
}

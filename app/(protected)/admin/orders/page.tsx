const orders = [
  { number: "MIN-2026-000125", customer: "Aisha Khan", amount: "₹8,499", status: "In Production" },
  { number: "MIN-2026-000126", customer: "Rahul Mehta", amount: "₹6,199", status: "Photo Review" },
  { number: "MIN-2026-000127", customer: "Sonia Verma", amount: "₹9,899", status: "Shipped" },
];

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Operations</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Orders</h1>
        </div>
        <button className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200">
          Export CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.number} className="border-t border-slate-800">
                <td className="px-5 py-4 font-medium text-white">{order.number}</td>
                <td className="px-5 py-4">{order.customer}</td>
                <td className="px-5 py-4">{order.amount}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs text-cyan-300">
                    {order.status}
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

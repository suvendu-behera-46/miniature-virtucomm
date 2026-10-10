const customers = [
  { name: "Aisha Khan", phone: "+91 98765 43210", email: "aisha@example.com", city: "Bengaluru" },
  { name: "Rahul Mehta", phone: "+91 99887 66554", email: "rahul@example.com", city: "Delhi" },
  { name: "Sonia Verma", phone: "+91 91234 56789", email: "sonia@example.com", city: "Mumbai" },
];

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">CRM</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Customers</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {customers.map((customer) => (
          <div key={customer.email} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <h2 className="text-lg font-semibold text-white">{customer.name}</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>{customer.phone}</p>
              <p>{customer.email}</p>
              <p>{customer.city}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

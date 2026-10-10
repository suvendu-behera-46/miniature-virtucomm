import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeDollarSign,
  Box,
  PackageCheck,
  ShoppingCart,
  Users,
} from "lucide-react";

const metrics = [
  { label: "Total Orders", value: "1,284", change: "+12.4%", icon: ShoppingCart },
  { label: "New Orders", value: "38", change: "+8.1%", icon: PackageCheck },
  { label: "Completed", value: "972", change: "+5.8%", icon: Box },
  { label: "Customers", value: "486", change: "+14.9%", icon: Users },
  { label: "Products", value: "124", change: "+7.0%", icon: BadgeDollarSign },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">Overview</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-100">Dashboard</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300">
          View reports <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-emerald-400">{item.change}</span>
              </div>
              <p className="text-3xl font-bold text-white">{item.value}</p>
              <p className="mt-2 text-sm text-slate-400">{item.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Orders over time</h2>
          <div className="h-56 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 p-4">
            <div className="flex h-full items-end gap-3">
              {[24, 40, 30, 58, 70, 63, 90].map((height, index) => (
                <motion.div
                  key={height}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  className="flex-1 rounded-t-lg bg-gradient-to-t from-cyan-500 to-blue-400"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Order status distribution</h2>
          <div className="space-y-4 text-sm text-slate-300">
            {[
              ["In Production", "46%"],
              ["Ready To Ship", "22%"],
              ["Completed", "18%"],
              ["Pending Review", "14%"],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between">
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: value }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

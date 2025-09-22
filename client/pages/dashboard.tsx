import Dashboard from "@/components/Dashboard";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white w-full">
      <Header />
      <div className="container mx-auto px-6 py-10">
        <div className="mb-6">
          <Link to="/" className="text-indigo-600 hover:underline">← Home</Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <Dashboard />
      </div>
  </div>
  );
}

"use client";

import { useAuth } from "../../contexts/AuthContext";
import CustomerDashboard from "./components/CustomerDashboard";
import ProDashboard from "./components/ProDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === "professional") {
    return <ProDashboard />;
  }

  return <CustomerDashboard />;
}

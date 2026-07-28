"use client";

import { useAuth } from "../../contexts/AuthContext";
import CustomerDashboard from "@/components/dashboard/overview/CustomerDashboard";
import ProDashboard from "@/components/dashboard/overview/ProDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === "professional") {
    return <ProDashboard />;
  }

  return <CustomerDashboard />;
}

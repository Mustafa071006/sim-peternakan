import { useAuth } from "../contexts";
import OperatorDashboard from "./dashboard/OperatorDashboard";
import AdminDashboard from "./dashboard/AdminDashboard";

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <OperatorDashboard />;
}

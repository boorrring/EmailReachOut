import { useAuth } from "./auth/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const AppContent = () => {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Login />;
};

export default AppContent;

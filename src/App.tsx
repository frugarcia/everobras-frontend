import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ToastProvider} from "@/components/ui/toast";
import {AuthProvider, useAuth} from "@/contexts/AuthContext";
import MainLayout from "@/layouts/MainLayout";
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/LoginPage";
import DeliveryNotesListPage from "@/pages/delivery-notes/DeliveryNotesListPage";
import DeliveryNoteDetailPage from "@/pages/delivery-notes/DeliveryNoteDetailPage";
import DeliveryNoteFormPage from "@/pages/delivery-notes/DeliveryNoteFormPage";
import CustomersPage from "@/pages/maintenance/CustomersPage";
import ProjectsPage from "@/pages/maintenance/ProjectsPage";
import MaterialsPage from "@/pages/maintenance/MaterialsPage";
import ServicesPage from "@/pages/maintenance/ServicesPage";
import VehiclesPage from "@/pages/maintenance/VehiclesPage";
import WorkersPage from "@/pages/maintenance/WorkersPage";
import UsersPage from "@/pages/maintenance/UsersPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

function ProtectedRoute({children}: {children: React.ReactNode}) {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({children}: {children: React.ReactNode}) {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route
                  path="/albaranes"
                  element={<DeliveryNotesListPage />}
                />
                <Route
                  path="/albaranes/nuevo"
                  element={<DeliveryNoteFormPage key="new" />}
                />
                <Route
                  path="/albaranes/:id"
                  element={<DeliveryNoteDetailPage />}
                />
                <Route
                  path="/albaranes/:id/editar"
                  element={<DeliveryNoteFormPage key="edit" />}
                />
                <Route
                  path="/mantenimiento/clientes"
                  element={<CustomersPage />}
                />
                <Route
                  path="/mantenimiento/obras"
                  element={<ProjectsPage />}
                />
                <Route
                  path="/mantenimiento/materiales"
                  element={<MaterialsPage />}
                />
                <Route
                  path="/mantenimiento/servicios"
                  element={<ServicesPage />}
                />
                <Route
                  path="/mantenimiento/vehiculos"
                  element={<VehiclesPage />}
                />
                <Route
                  path="/mantenimiento/operarios"
                  element={<WorkersPage />}
                />
                <Route
                  path="/mantenimiento/usuarios"
                  element={<UsersPage />}
                />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Toaster} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import ConfirmDialog from "@/components/ConfirmDialog";
import Loader from "@/components/Loader";
import {AuthProvider} from "@/contexts/AuthContext";
import {useAuth} from "@/hooks/useAuth";
import MainLayout from "@/layouts/MainLayout";
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/LoginPage";
import DeliveryNotesListPage from "@/pages/delivery-notes/DeliveryNotesListPage";
import DeliveryNoteDetailPage from "@/pages/delivery-notes/DeliveryNoteDetailPage";
import DeliveryNoteFormPage from "@/pages/delivery-notes/DeliveryNoteFormPage";
import InternalPartsListPage from "@/pages/internal-parts/InternalPartsListPage";
import InternalPartDetailPage from "@/pages/internal-parts/InternalPartDetailPage";
import InternalPartFormPage from "@/pages/internal-parts/InternalPartFormPage";
import ProformasListPage from "@/pages/proformas/ProformasListPage";
import ProformaDetailPage from "@/pages/proformas/ProformaDetailPage";
import ProformaFormPage from "@/pages/proformas/ProformaFormPage";
import CustomersPage from "@/pages/maintenance/CustomersPage";
import SuppliersPage from "@/pages/maintenance/SuppliersPage";
import ProjectsPage from "@/pages/maintenance/ProjectsPage";
import MaterialsPage from "@/pages/maintenance/MaterialsPage";
import ServicesPage from "@/pages/maintenance/ServicesPage";
import VehiclesPage from "@/pages/maintenance/VehiclesPage";
import WorkersPage from "@/pages/maintenance/WorkersPage";
import UsersPage from "@/pages/maintenance/UsersPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

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
      <div className="flex h-svh items-center justify-center">
        <Loader />
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
      <div className="flex h-svh items-center justify-center">
        <Loader />
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
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <ConfirmDialog />
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
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={<ResetPasswordPage />}
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
                <Route path="/proformas" element={<ProformasListPage />} />
                <Route
                  path="/proformas/nuevo"
                  element={<ProformaFormPage key="new" />}
                />
                <Route path="/proformas/:id" element={<ProformaDetailPage />} />
                <Route
                  path="/proformas/:id/editar"
                  element={<ProformaFormPage key="edit" />}
                />
                <Route
                  path="/partes-internos"
                  element={<InternalPartsListPage />}
                />
                <Route
                  path="/partes-internos/nuevo"
                  element={<InternalPartFormPage key="new" />}
                />
                <Route
                  path="/partes-internos/:id"
                  element={<InternalPartDetailPage />}
                />
                <Route
                  path="/partes-internos/:id/editar"
                  element={<InternalPartFormPage key="edit" />}
                />
                <Route
                  path="/mantenimiento/clientes"
                  element={<CustomersPage />}
                />
                <Route
                  path="/mantenimiento/proveedores"
                  element={<SuppliersPage />}
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
      </QueryClientProvider>
    </TooltipProvider>
  );
}

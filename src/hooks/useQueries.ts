import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  customersApi,
  projectsApi,
  materialsApi,
  servicesApi,
  vehiclesApi,
  workersApi,
  suppliersApi,
  deliveryNotesApi,
  internalPartsApi,
  proformasApi,
  usersApi,
} from "@/lib/api";

// ─── Pagination types ──────────────────────────────────────
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Query Keys ────────────────────────────────────────────
export const queryKeys = {
  customers: (params?: PaginationParams) => ["customers", params] as const,
  customer: (id: string) => ["customers", id] as const,
  projects: (params?: PaginationParams) => ["projects", params] as const,
  project: (id: string) => ["projects", id] as const,
  materials: (params?: PaginationParams) => ["materials", params] as const,
  material: (id: string) => ["materials", id] as const,
  services: (params?: PaginationParams) => ["services", params] as const,
  service: (id: string) => ["services", id] as const,
  vehicles: (params?: PaginationParams) => ["vehicles", params] as const,
  vehicle: (id: string) => ["vehicles", id] as const,
  workers: (params?: PaginationParams) => ["workers", params] as const,
  worker: (id: string) => ["workers", id] as const,
  suppliers: (params?: PaginationParams) => ["suppliers", params] as const,
  supplier: (id: string) => ["suppliers", id] as const,
  deliveryNotes: (params?: Record<string, string>) => ["delivery-notes", params] as const,
  deliveryNote: (id: string) => ["delivery-notes", id] as const,
  internalParts: (params?: Record<string, string>) => ["internal-parts", params] as const,
  internalPart: (id: string) => ["internal-parts", id] as const,
  proformas: (params?: Record<string, string>) => ["proformas", params] as const,
  proforma: (id: string) => ["proformas", id] as const,
  users: (params?: PaginationParams) => ["users", params] as const,
  user: (id: string) => ["users", id] as const,
};

// ─── Customers ─────────────────────────────────────────────
export function useCustomers(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.customers(params),
    placeholderData: keepPreviousData,
    queryFn: () => customersApi.getAll(params),
  });
}

export function useCustomer(id: string) {
  return useQuery({ queryKey: queryKeys.customer(id), queryFn: () => customersApi.getById(id), enabled: !!id });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; cif: string }) => customersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; cif: string }> }) =>
      customersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

// ─── Projects ──────────────────────────────────────────────
export function useProjects(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.projects(params),
    placeholderData: keepPreviousData,
    queryFn: () => projectsApi.getAll(params),
  });
}

export function useProject(id: string) {
  return useQuery({ queryKey: queryKeys.project(id), queryFn: () => projectsApi.getById(id), enabled: !!id });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; customerId: string }) => projectsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; customerId: string }> }) =>
      projectsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

// ─── Materials ─────────────────────────────────────────────
export function useMaterials(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.materials(params),
    placeholderData: keepPreviousData,
    queryFn: () => materialsApi.getAll(params),
  });
}

export function useCreateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => materialsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materials"] }),
  });
}

export function useUpdateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) => materialsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materials"] }),
  });
}

export function useDeleteMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => materialsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materials"] }),
  });
}

// ─── Services ──────────────────────────────────────────────
export function useServices(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.services(params),
    placeholderData: keepPreviousData,
    queryFn: () => servicesApi.getAll(params),
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => servicesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) => servicesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

// ─── Vehicles ──────────────────────────────────────────────
export function useVehicles(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.vehicles(params),
    placeholderData: keepPreviousData,
    queryFn: () => vehiclesApi.getAll(params),
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; plate: string }) => vehiclesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; plate: string }> }) =>
      vehiclesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiclesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

// ─── Workers ───────────────────────────────────────────────
export function useWorkers(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.workers(params),
    placeholderData: keepPreviousData,
    queryFn: () => workersApi.getAll(params),
  });
}

export function useCreateWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { firstName: string; lastName: string; dni: string; email: string }) =>
      workersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workers"] }),
  });
}

export function useUpdateWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ firstName: string; lastName: string; dni: string; email: string }>;
    }) => workersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workers"] }),
  });
}

export function useDeleteWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workers"] }),
  });
}

// ─── Suppliers ─────────────────────────────────────────────
export function useSuppliers(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.suppliers(params),
    placeholderData: keepPreviousData,
    queryFn: () => suppliersApi.getAll(params),
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { commercialName: string; legalName: string; cif: string }) =>
      suppliersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ commercialName: string; legalName: string; cif: string }>;
    }) => suppliersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

// ─── Delivery Notes ────────────────────────────────────────
export function useDeliveryNotes(params?: Record<string, string>, enabled = true) {
  return useQuery({
    queryKey: queryKeys.deliveryNotes(params),
    queryFn: () => deliveryNotesApi.getAll(params),
    enabled,
  });
}

export function useDeliveryNote(id: string) {
  return useQuery({
    queryKey: queryKeys.deliveryNote(id),
    queryFn: () => deliveryNotesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDeliveryNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => deliveryNotesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery-notes"] }),
  });
}

export function useUpdateDeliveryNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => deliveryNotesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery-notes"] }),
  });
}

export function useDeleteDeliveryNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliveryNotesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery-notes"] }),
  });
}

// ─── Internal parts ────────────────────────────────────────
export function useInternalParts(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.internalParts(params),
    queryFn: () => internalPartsApi.getAll(params),
  });
}

export function useInternalPart(id: string) {
  return useQuery({
    queryKey: queryKeys.internalPart(id),
    queryFn: () => internalPartsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateInternalPart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => internalPartsApi.create(data),
    onSuccess: () => qc.invalidateQueries({queryKey: ["internal-parts"]}),
  });
}

export function useUpdateInternalPart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: unknown}) =>
      internalPartsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({queryKey: ["internal-parts"]}),
  });
}

export function useDeleteInternalPart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => internalPartsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({queryKey: ["internal-parts"]}),
  });
}

// ─── Proformas ─────────────────────────────────────────────
export function useProformas(params?: Record<string, string>, enabled = true) {
  return useQuery({
    queryKey: queryKeys.proformas(params),
    queryFn: () => proformasApi.getAll(params),
    enabled,
  });
}

export function useProforma(id: string) {
  return useQuery({
    queryKey: queryKeys.proforma(id),
    queryFn: () => proformasApi.getById(id),
    enabled: !!id,
  });
}

export function usePreviewProforma() {
  return useMutation({
    mutationFn: (data: unknown) => proformasApi.preview(data),
  });
}

export function useCreateProforma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => proformasApi.create(data),
    onSuccess: () => qc.invalidateQueries({queryKey: ["proformas"]}),
  });
}

export function useUpdateProforma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: unknown}) => proformasApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({queryKey: ["proformas"]}),
  });
}

export function useDeleteProforma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proformasApi.delete(id),
    onSuccess: () => qc.invalidateQueries({queryKey: ["proformas"]}),
  });
}

// ─── Users ─────────────────────────────────────────────────
export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.users(params),
    placeholderData: keepPreviousData,
    queryFn: () => usersApi.getAll(params),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; name: string }) =>
      usersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ email: string; name: string }>;
    }) => usersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

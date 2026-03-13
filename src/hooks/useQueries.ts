import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  customersApi,
  projectsApi,
  materialsApi,
  servicesApi,
  vehiclesApi,
  workersApi,
  deliveryNotesApi,
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
  deliveryNotes: (params?: Record<string, string>) => ["delivery-notes", params] as const,
  deliveryNote: (id: string) => ["delivery-notes", id] as const,
  users: (params?: PaginationParams) => ["users", params] as const,
  user: (id: string) => ["users", id] as const,
};

// ─── Customers ─────────────────────────────────────────────
export function useCustomers(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.customers(params),
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

// ─── Delivery Notes ────────────────────────────────────────
export function useDeliveryNotes(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.deliveryNotes(params),
    queryFn: () => deliveryNotesApi.getAll(params),
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

// ─── Users ─────────────────────────────────────────────────
export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.users(params),
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

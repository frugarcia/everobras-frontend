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

// ─── Query Keys ────────────────────────────────────────────
export const queryKeys = {
  customers: ["customers"] as const,
  customer: (id: string) => ["customers", id] as const,
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
  materials: ["materials"] as const,
  material: (id: string) => ["materials", id] as const,
  services: ["services"] as const,
  service: (id: string) => ["services", id] as const,
  vehicles: ["vehicles"] as const,
  vehicle: (id: string) => ["vehicles", id] as const,
  workers: ["workers"] as const,
  worker: (id: string) => ["workers", id] as const,
  deliveryNotes: (params?: Record<string, string>) => ["delivery-notes", params] as const,
  deliveryNote: (id: string) => ["delivery-notes", id] as const,
  users: ["users"] as const,
  user: (id: string) => ["users", id] as const,
};

// ─── Customers ─────────────────────────────────────────────
export function useCustomers() {
  return useQuery({ queryKey: queryKeys.customers, queryFn: customersApi.getAll });
}

export function useCustomer(id: string) {
  return useQuery({ queryKey: queryKeys.customer(id), queryFn: () => customersApi.getById(id), enabled: !!id });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; cif: string }) => customersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.customers }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; cif: string }> }) =>
      customersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.customers }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.customers }),
  });
}

// ─── Projects ──────────────────────────────────────────────
export function useProjects() {
  return useQuery({ queryKey: queryKeys.projects, queryFn: projectsApi.getAll });
}

export function useProject(id: string) {
  return useQuery({ queryKey: queryKeys.project(id), queryFn: () => projectsApi.getById(id), enabled: !!id });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; customerId: string }) => projectsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; customerId: string }> }) =>
      projectsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

// ─── Materials ─────────────────────────────────────────────
export function useMaterials() {
  return useQuery({ queryKey: queryKeys.materials, queryFn: materialsApi.getAll });
}

export function useCreateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => materialsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.materials }),
  });
}

export function useUpdateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) => materialsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.materials }),
  });
}

export function useDeleteMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => materialsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.materials }),
  });
}

// ─── Services ──────────────────────────────────────────────
export function useServices() {
  return useQuery({ queryKey: queryKeys.services, queryFn: servicesApi.getAll });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => servicesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.services }),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) => servicesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.services }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.services }),
  });
}

// ─── Vehicles ──────────────────────────────────────────────
export function useVehicles() {
  return useQuery({ queryKey: queryKeys.vehicles, queryFn: vehiclesApi.getAll });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; plate: string }) => vehiclesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.vehicles }),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; plate: string }> }) =>
      vehiclesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.vehicles }),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiclesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.vehicles }),
  });
}

// ─── Workers ───────────────────────────────────────────────
export function useWorkers() {
  return useQuery({ queryKey: queryKeys.workers, queryFn: workersApi.getAll });
}

export function useCreateWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { firstName: string; lastName: string; dni: string; email: string }) =>
      workersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.workers }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.workers }),
  });
}

export function useDeleteWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.workers }),
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
export function useUsers() {
  return useQuery({ queryKey: queryKeys.users, queryFn: usersApi.getAll });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; name: string }) =>
      usersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  });
}

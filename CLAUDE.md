# Everobras Frontend

SPA para gestionar **albaranes** de obras y sus maestros. Backend en `../everobras-backend` (ver su CLAUDE.md: modelo de datos, endpoints, auth). UI y rutas en **español**.

## Stack
- React 19 + Vite 7 + TypeScript · Tailwind v4 (tokens en `src/index.css` `@theme`, tema claro)
- **shadcn** (`components.json` igual que `finanfor-backoffice`: estilo `base-nova`, sobre **Base UI** `@base-ui/react`, no Radix). Añadir componentes con `pnpm dlx shadcn@4.23.0 add <x>`. Varios componentes de `src/components/ui/` están copiados de finanfor porque allí están retocados (dialog, card, sidebar, dropdown-menu, field, sheet, tooltip, spinner, sonner): **no regenerarlos con `--overwrite`**. Badge tiene variantes extra `success`/`warning`. Wrappers estilo finanfor: `app-input.tsx` (`Field`, `AppInput`), `app-button.tsx`, `app-tooltip.tsx`, `app-select.tsx` (propio: Select con items + Field).
- Tema copiado de finanfor en `src/index.css` (primary `#434e7e`, accent `#e8f8fb`, tokens `main-blue`/`secondary-blue`, fuente Geist, `html {font-size: 14px}`, radius 0.625rem). Iconos de páginas con `@tabler/icons-react` (como finanfor); lucide solo dentro de `components/ui`. Toasts con `sonner` (`toast.error(...)`, `<Toaster>` en App).
- TanStack Query (datos), TanStack Table (tablas), TanStack Form + zod (formularios de mantenimiento), axios, react-router-dom 7, lucide-react
- Alias `@/*` → `src/*` (también en `tsconfig.json` raíz: lo necesita el CLI de shadcn). **pnpm**.

## Comandos
`pnpm dev` (proxy `/api` → `localhost:3000`), `pnpm build` (tsc -b + vite), `pnpm typecheck`, `pnpm lint` (0 warnings permitidos), `pnpm lint:fix`.
ESLint copiado de `finanfor-backoffice`: react, react-hooks, react-refresh, unused-imports y **better-tailwindcss** (orden de clases, clases canónicas como `size-4`, duplicados). Diferencia: `rootFontSize: 14` (coincide con `html {font-size: 14px}`). Los hooks de contexto van en `src/hooks/` (p. ej. `useAuth.ts`) para no mezclar exports con componentes.
Producción: Dockerfile multi-stage → nginx (SPA fallback). `VITE_API_URL` como build arg (default `/api`).

## Estructura
```
src/App.tsx                    # rutas + QueryClient (staleTime 30s, retry 1) + ProtectedRoute/PublicRoute
src/lib/api.ts                 # axios, tokens en localStorage, interceptor 401→refresh con cola, *Api por recurso
src/hooks/useQueries.ts        # queryKeys + hooks useX / useCreateX / useUpdateX / useDeleteX (invalida por prefijo)
src/contexts/AuthContext.tsx   # user, login, logout; al montar llama /auth/me
src/config/routes.ts           # entradas del sidebar (path, label, icono tabler, grupo) — también las usa TitleSegment
src/layouts/MainLayout.tsx     # SidebarProvider + Sidebar (collapsible="icon") + header con SidebarTrigger + <Outlet/>
src/components/
  Sidebar.tsx, UserInfo.tsx    # nav desde config/routes; usuario con iniciales y "Cerrar sesión" en dropdown
  CrudPage.tsx                 # listado de mantenimiento estilo finanfor: TitleSegment, ButtonBordered "Añadir…", AppInput buscar (debounce 300ms), "Total…", Table; acciones (editar/eliminar) primera columna; form en Modal; borrado vía ConfirmDialog
  FormModal.tsx                # <form> dentro de Modal: ModalHeader/Body/Footer con Cancelar (rojo) / Guardar (verde)
  Table.tsx + PaginationTable  # tabla de finanfor: cabecera degradado main-blue, vacío, overlay de carga (meta.isLoading), paginación numerada; meta.headerClassName/rowClassName por columna (tipado en src/types/react-table.d.ts)
  ConfirmDialog.tsx            # diálogo global; lanzar con useModalStore().handleLaunchModal({title, text, description, subText, type:"delete", promise})
  Modal, ButtonBordered, ButtonTable, LinkTable, GoBackTitle, TitleSegment, ItemCard, Loader, RenderWhenLoad, AuthShell (login/recuperar/reset)
src/store/useModalStore.ts     # zustand, estado del ConfirmDialog
src/lib/errors.ts              # getErrorMessage(err, fallback) → `{error}` de la API
src/lib/form.ts                # fieldErrorProps(field) → {isInvalid, errorMessage} para AppInput/AppSelect con TanStack Form
src/pages/
  Dashboard.tsx, LoginPage, ForgotPasswordPage, ResetPasswordPage (?token=)
  delivery-notes/ DeliveryNotesListPage, DeliveryNoteDetailPage, DeliveryNoteFormPage
  maintenance/<X>Page/ index.tsx (+ validations.ts con zod)
```

## Rutas
`/`, `/albaranes`, `/albaranes/nuevo`, `/albaranes/:id`, `/albaranes/:id/editar`, `/mantenimiento/{clientes,obras,materiales,servicios,vehiculos,operarios,usuarios}`, `/login`, `/forgot-password`, `/reset-password`.

## Patrón para una página de mantenimiento
1. Añadir métodos en `api.ts` y hooks en `useQueries.ts`.
2. `pages/maintenance/XPage/validations.ts` con schema zod.
3. `index.tsx`: interfaz local del tipo, `columns: ColumnDef[]`, componente `XForm` con `useForm` (validators.onSubmit = schema) renderizando `<FormModal>` con `form.Field` → `<AppInput … {...fieldErrorProps(field)} />` (try/catch con `toast`), y `XPage` con `useState` page/search pasando todo a `<CrudPage>` (path, addLabel, totalLabel, entityName[, entityFeminine], getLabel).
4. Registrar ruta en `App.tsx` y entrada en `src/config/routes.ts`.
Para selects de entidades relacionadas se usa `useX({limit: 9999})`.

## Albaranes
- **Listado**: el endpoint no pagina → se trae todo y TanStack Table filtra (globalFilter sobre accessorFn), ordena (clic en cabecera) y pagina (15) en cliente. Filtros server-side: cliente y firmado.
- **Formulario**: usa `useState` manual (no TanStack Form ni zod), líneas dinámicas (material/servicio/unidad/cantidad/precio), vehículo de lista o manual (`__manual__` → `vehicleText`). Errores de guardado por toast.
- **Detalle**: GoBackTitle + ItemCards + Table de líneas; total = Σ quantity × price; auditoría createdBy/updatedBy.

## Gotchas
- Las queries paginadas usan `placeholderData: keepPreviousData`: sin eso `total` cae a 0 mientras carga y `PaginationTable` (que corrige página > total) devuelve a la página 1.
- `AppSelect` trata `""` como sin valor (placeholder) y el alto se fuerza con `data-[size=default]:h-9` para igualar a los inputs.
- **Select de Base UI**: pasar `items` (`[{value,label}]`) al `<Select>` para que `SelectValue` muestre la etiqueta y no el id; usar `value={x || null}` para que salga el placeholder; `onValueChange` recibe `(value | null, details)`. `SelectTrigger` es `w-fit` por defecto → `className="w-full"` en formularios.
- Base UI no tiene `asChild`: se usa la prop `render`.
- `limit: 9999` en selects, pero **el backend clampa a 100** → con >100 registros los desplegables se quedan cortos.
- Tipos definidos ad-hoc en cada página (no hay `types/` compartido); muchos `any`-ish inline en `.map((x: {id; name}) => ...)`.
- Dashboard descarga todos los albaranes para contar firmados/pendientes.
- No hay roles; único `canDelete` es en Usuarios (no borrarse a sí mismo).
- No hay tests.

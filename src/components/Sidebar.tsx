import {NavLink, useLocation} from "react-router-dom";
import {ROUTES, type TNavRoute} from "@/config/routes";
import {useAuth} from "@/hooks/useAuth";
import Logo from "@/components/Logo";
import UserInfo from "@/components/UserInfo";
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

export default function Sidebar() {
  const {pathname} = useLocation();
  const {user, logout} = useAuth();

  function isActive(path: string) {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  function renderNav(items: TNavRoute[]) {
    return items.map((item) => (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton
          isActive={isActive(item.path)}
          tooltip={item.label}
          render={<NavLink to={item.path} />}
        >
          <item.icon size={18} stroke={2} />
          <span>{item.label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  }

  return (
    <SidebarRoot collapsible="icon">
      <SidebarHeader className="group-data-[collapsible=icon]:hidden">
        <NavLink to="/" className="flex justify-center px-2 py-1">
          <Logo className="h-14 w-auto" />
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 group-data-[collapsible=icon]:gap-1">
              {renderNav(ROUTES.filter((item) => item.group === "main"))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Mantenimiento</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 group-data-[collapsible=icon]:gap-1">
              {renderNav(ROUTES.filter((item) => item.group === "maintenance"))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserInfo user={user} onLogout={logout} />
      </SidebarFooter>
      <SidebarRail />
    </SidebarRoot>
  );
}

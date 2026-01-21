
import { Link } from 'react-router-dom';
import {
  Calendar,
  Home,
  MessageSquare,
  User,
  Users,
  Settings,
  Code,
  Book,
  Award
} from 'lucide-react';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const navigation = [
  {
    title: "Main",
    items: [
      {
        title: "Home",
        icon: Home,
        href: "/",
      },
      {
        title: "Forums",
        icon: MessageSquare,
        href: "/forums",
      },
      {
        title: "Projects",
        icon: Code,
        href: "/projects",
      },
      {
        title: "Competitions",
        icon: Calendar,
        href: "/competitions",
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        title: "Mentorship",
        icon: Users,
        href: "/mentorship",
      },
      {
        title: "Learning",
        icon: Book,
        href: "/learning",
      },
      {
        title: "Achievements",
        icon: Award,
        href: "/achievements",
      },
    ],
  },
];

const Sidebar = () => {
  return (
    <SidebarComponent>
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-xl">CoderSphere</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link to={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/profile">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/settings">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarComponent>
  );
};

export default Sidebar;

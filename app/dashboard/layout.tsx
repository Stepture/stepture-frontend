import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import Navbar from "./components/navbar";
import { UserProvider } from "./components/providers/userProvider";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <Navbar />
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </UserProvider>
  );
}

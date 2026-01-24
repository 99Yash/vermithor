import { SidebarProvider } from '~/components/ui/sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="app-shell-outer h-svh relative lg:p-2 w-full flex flex-col overflow-hidden">
        <div className="app-shell lg:border lg:rounded-lg flex flex-col bg-background w-full h-full">
          <div className="app-shell-scroll flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}

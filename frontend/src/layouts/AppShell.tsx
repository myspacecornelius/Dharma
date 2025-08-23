import { Outlet } from 'react-router-dom';
import { BottomTabNav } from './_components/BottomTabNav';
import { TopNav } from './_components/TopNav';

const AppShell = () => {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <TopNav />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Outlet />
        </div>
      </main>
      <BottomTabNav />
    </div>
  );
};

export default AppShell;

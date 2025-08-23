import { Switch, Route } from 'react-router-dom';
import { BottomTabNav } from './_components/BottomTabNav';
import { TopNav } from './_components/TopNav';
import { FeedPage } from '../pages/FeedPage';
import { HeatCheckPage } from '../pages/HeatCheckPage';
import { DropZonesPage } from '../pages/DropZonesPage';
import { ProfilePage } from '../pages/ProfilePage';
import NotFound from '../pages/NotFound';

const AppShell = () => {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <TopNav />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Switch>
            <Route exact path="/" component={FeedPage} />
            <Route path="/feed" component={FeedPage} />
            <Route path="/zones" component={DropZonesPage} />
            <Route path="/heat" component={HeatCheckPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
      <BottomTabNav />
    </div>
  );
};

export default AppShell;

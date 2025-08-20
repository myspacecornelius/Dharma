import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/app/_layout";
import { ThemeProvider } from "@/components/theme-provider";
import Dashboard from "@/app/routes/dashboard";
import Heatmap from "@/app/routes/heatmap";
import Dropzones from "@/app/routes/dropzones";
import ThriftRoutes from "@/app/routes/thriftroutes";
import Laces from "@/app/routes/laces";
import Leaderboard from "@/app/routes/leaderboard";
import Profile from "@/app/routes/profile";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="heatmap" element={<Heatmap />} />
            <Route path="dropzones" element={<Dropzones />} />
            <Route path="thriftroutes" element={<ThriftRoutes />} />
            <Route path="laces" element={<Laces />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

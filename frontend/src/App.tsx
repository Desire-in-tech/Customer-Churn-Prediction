import type { ReactNode } from "react";
import {
  Switch,
  Route,
  Router as WouterRouter,
  Link,
  useLocation,
} from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutDashboard, BrainCircuit, Activity } from "lucide-react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Predict from "@/pages/Predict";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Nav() {
  const [location] = useLocation();

  return (
    <div className="w-64 border-r border-border bg-card h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
          <Activity size={20} strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-lg tracking-tight text-foreground">
          ChurnFlow
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location === "/" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
        <Link
          href="/predict"
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location === "/predict" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
        >
          <BrainCircuit size={18} />
          Predict Risk
        </Link>
      </div>
    </div>
  );
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      <Nav />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/predict" component={Predict} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

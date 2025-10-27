import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Link } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Report from "./pages/Report";
import Reports from "./pages/Reports";
import ReportDetail from "./pages/ReportDetail";
import PropertySearch from "./pages/PropertySearch";
import SearchResults from "./pages/SearchResults";
import { FileSpreadsheet, Upload as UploadIcon, BarChart3, Search } from "lucide-react";
import { APP_TITLE } from "./const";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2 mr-8">
            <FileSpreadsheet className="h-6 w-6" />
            <span className="font-bold text-lg">{APP_TITLE}</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/upload" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1">
              <UploadIcon className="h-4 w-4" />
              Upload
            </Link>
            <Link href="/reports" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Reports
            </Link>
            <Link href="/property-search" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1">
              <Search className="h-4 w-4" />
              Property Search
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/upload" component={Upload} />
          <Route path="/reports" component={Reports} />
          <Route path="/report/:id" component={ReportDetail} />
          <Route path="/report" component={Report} />
          <Route path="/property-search" component={PropertySearch} />
          <Route path="/search/:id" component={SearchResults} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

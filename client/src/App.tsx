import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import { PrivacyPage, TermsPage } from "./pages/LegalPage";
import { AboutPage, FaqPage, HowItWorksPage, LiveDemoPage, PricingPage } from "./pages/PublicPages";
import Workspace from "./pages/Workspace";
import CampaignMicrosite from "./pages/CampaignMicrosite";

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster richColors position="top-right" />
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={AboutPage} />
          <Route path="/how-it-works" component={HowItWorksPage} />
          <Route path="/live-demo" component={LiveDemoPage} />
          <Route path="/pricing" component={PricingPage} />
          <Route path="/faq" component={FaqPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/workspace" component={Workspace} />
          <Route path="/c/:slug" component={CampaignMicrosite} />
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;

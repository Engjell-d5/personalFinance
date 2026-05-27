import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { AppShell } from "@/components/layout/AppShell";

const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const AccountsPage = lazy(() =>
  import("@/pages/AccountsPage").then((m) => ({ default: m.AccountsPage }))
);
const ExpensesPage = lazy(() =>
  import("@/pages/ExpensesPage").then((m) => ({ default: m.ExpensesPage }))
);
const IncomePage = lazy(() =>
  import("@/pages/IncomePage").then((m) => ({ default: m.IncomePage }))
);
const RecurringPage = lazy(() =>
  import("@/pages/RecurringPage").then((m) => ({ default: m.RecurringPage }))
);
const BudgetsPage = lazy(() =>
  import("@/pages/BudgetsPage").then((m) => ({ default: m.BudgetsPage }))
);
const AssetsPage = lazy(() =>
  import("@/pages/AssetsPage").then((m) => ({ default: m.AssetsPage }))
);
const AssetDetailPage = lazy(() =>
  import("@/pages/AssetDetailPage").then((m) => ({
    default: m.AssetDetailPage,
  }))
);
const ReportsPage = lazy(() =>
  import("@/pages/ReportsPage").then((m) => ({ default: m.ReportsPage }))
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function lazyPage(Page: React.LazyExoticComponent<React.ComponentType>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Page />
    </Suspense>
  );
}

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AppShell />,
      children: [
        { index: true, element: lazyPage(DashboardPage) },
        { path: "accounts", element: lazyPage(AccountsPage) },
        { path: "expenses", element: lazyPage(ExpensesPage) },
        { path: "income", element: lazyPage(IncomePage) },
        { path: "recurring", element: lazyPage(RecurringPage) },
        { path: "budgets", element: lazyPage(BudgetsPage) },
        { path: "assets", element: lazyPage(AssetsPage) },
        { path: "assets/:id", element: lazyPage(AssetDetailPage) },
        { path: "reports", element: lazyPage(ReportsPage) },
        { path: "settings", element: lazyPage(SettingsPage) },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL }
);

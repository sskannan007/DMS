import { createBrowserRouter } from "react-router";
import { DashboardPage } from "./pages/DashboardPage";
import { SearchResultsPage } from "./pages/SearchResultsPage";
import { DocumentPreviewPage } from "./pages/DocumentPreviewPage";
import { UploadPage } from "./pages/UploadPage";
import { AdminIndexingPage } from "./pages/AdminIndexingPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardPage,
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
  },
  {
    path: "/search",
    Component: SearchResultsPage,
  },
  {
    path: "/document/:id",
    Component: DocumentPreviewPage,
  },
  {
    path: "/upload",
    Component: UploadPage,
  },
  {
    path: "/admin",
    Component: AdminIndexingPage,
  },
]);

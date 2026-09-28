import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./index.css";
import queryClient from "./lib/queryClient";
import { AuthProvider } from "./contexts";
import { Toaster } from "./components/ui/Toaster";
import { ErrorBoundary } from "./components/ErrorBoundary";
import AppRouter from "./routes/AppRouter";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <AppRouter />
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
        {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

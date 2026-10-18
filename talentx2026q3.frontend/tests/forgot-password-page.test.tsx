import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ForgotPasswordPage from "@/app/(public)/(auth)/forgot-password/page";

function renderWithProviders(uiElement: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {uiElement}
    </QueryClientProvider>
  );
}

describe("ForgotPasswordPage", () => {
  it("renders brand panel and forgot password form", () => {
    renderWithProviders(<ForgotPasswordPage />);

    expect(screen.getByRole("heading", { name: "Forgot password" })).toBeInTheDocument();
    expect(screen.getByLabelText("Work Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send reset instructions" })).toBeInTheDocument();
    expect(screen.getByText(/Reduce hiring effort/i)).toBeInTheDocument();
  });
});

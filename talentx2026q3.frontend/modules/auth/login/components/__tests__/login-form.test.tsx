import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginForm } from "../login-form";
import { useLoginForm } from "../../hooks/use-login-form";

jest.mock("../../hooks/use-login-form", () => ({
  useLoginForm: jest.fn(),
}));

const mockedUseLoginForm = useLoginForm as jest.MockedFunction<typeof useLoginForm>;

function renderWithProviders(uiElement: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{uiElement}</QueryClientProvider>
  );
}

function stubLoginForm(overrides: Partial<ReturnType<typeof useLoginForm>> = {}) {
  mockedUseLoginForm.mockReturnValue({
    form: {
      register: jest.fn(),
      handleSubmit: (fn: () => void) => (event?: React.BaseSyntheticEvent) => {
        event?.preventDefault?.();
        return fn();
      },
      formState: { errors: {} },
    } as unknown as ReturnType<typeof useLoginForm>["form"],
    onSubmit: jest.fn(),
    serverError: null,
    isSubmitting: false,
    ...overrides,
  });
}

describe("LoginForm", () => {
  afterEach(() => jest.clearAllMocks());

  it("renders the deactivatedMessage in the alert box when provided", () => {
    stubLoginForm();
    renderWithProviders(
      <LoginForm deactivatedMessage="Your account has been deactivated. Please contact TalentX support for more information." />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your account has been deactivated. Please contact TalentX support for more information."
    );
  });

  it("does not render the alert box when deactivatedMessage is absent", () => {
    stubLoginForm();
    renderWithProviders(<LoginForm />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("prefers an active serverError over the static deactivatedMessage", () => {
    stubLoginForm({ serverError: "Invalid email or password." });
    renderWithProviders(<LoginForm deactivatedMessage="Your account has been deactivated." />);

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password.");
  });
});

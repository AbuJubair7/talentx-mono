import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper";
import { AiConfigForm } from "../components/AiConfigForm";
import {
  getAiConfiguration,
  updateAiConfiguration,
} from "../services/ai-config.service";
import type { AiConfiguration } from "../types/ai-config";

jest.mock("../services/ai-config.service");
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedGetAiConfiguration = getAiConfiguration as jest.MockedFunction<
  typeof getAiConfiguration
>;
const mockedUpdateAiConfiguration = updateAiConfiguration as jest.MockedFunction<
  typeof updateAiConfiguration
>;

const mockConfig: AiConfiguration = {
  modelName: "gemini-3.7-flash",
  maskedApiKey: "••••••••",
  hasCustomKey: true,
  updatedAt: "2026-10-05T10:00:00.000Z",
};

describe("AiConfigForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading indicator while fetching configuration", () => {
    mockedGetAiConfiguration.mockReturnValue(new Promise(() => {}));

    render(<AiConfigForm />, { wrapper: createQueryWrapper() });

    expect(screen.getByTestId("ai-config-loading")).toBeInTheDocument();
  });

  it("renders form with current model and masked key", async () => {
    mockedGetAiConfiguration.mockResolvedValueOnce(mockConfig);

    render(<AiConfigForm />, { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(screen.queryByTestId("ai-config-loading")).not.toBeInTheDocument();
    });

    const modelSelect = screen.getByLabelText("Model Name");
    expect(modelSelect).toHaveValue("gemini-3.7-flash");
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByText("••••••••")).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
  });

  it("allows selecting model and updating", async () => {
    mockedGetAiConfiguration.mockResolvedValueOnce(mockConfig);
    mockedUpdateAiConfiguration.mockResolvedValueOnce({
      ...mockConfig,
      modelName: "gemini-2.5-pro",
    });

    render(<AiConfigForm />, { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(screen.queryByTestId("ai-config-loading")).not.toBeInTheDocument();
    });

    const modelSelect = screen.getByLabelText("Model Name");
    fireEvent.change(modelSelect, { target: { value: "gemini-2.5-pro" } });
    expect(modelSelect).toHaveValue("gemini-2.5-pro");

    const submitButton = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedUpdateAiConfiguration).toHaveBeenCalledWith({
        modelName: "gemini-2.5-pro",
      });
      expect(toast.success).toHaveBeenCalledWith("AI configuration updated successfully");
    });
  });

  it("allows selecting custom model and submitting custom model name", async () => {
    mockedGetAiConfiguration.mockResolvedValueOnce(mockConfig);
    mockedUpdateAiConfiguration.mockResolvedValueOnce({
      ...mockConfig,
      modelName: "gemini-1.5-pro",
    });

    render(<AiConfigForm />, { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(screen.queryByTestId("ai-config-loading")).not.toBeInTheDocument();
    });

    const modelSelect = screen.getByLabelText("Model Name");
    fireEvent.change(modelSelect, { target: { value: "custom" } });

    const customInput = screen.getByLabelText("Custom Model Name");
    expect(customInput).toBeInTheDocument();

    fireEvent.change(customInput, { target: { value: "gemini-1.5-pro" } });

    const submitButton = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedUpdateAiConfiguration).toHaveBeenCalledWith({
        modelName: "gemini-1.5-pro",
      });
    });
  });

  it("submits update mutation with new API key when entered", async () => {
    mockedGetAiConfiguration.mockResolvedValueOnce(mockConfig);
    mockedUpdateAiConfiguration.mockResolvedValueOnce({
      ...mockConfig,
      hasCustomKey: true,
    });

    render(<AiConfigForm />, { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(screen.queryByTestId("ai-config-loading")).not.toBeInTheDocument();
    });

    const apiKeyInput = screen.getByPlaceholderText("••••••••");
    fireEvent.change(apiKeyInput, { target: { value: "AIzaSyNewSecretKey123" } });

    const submitButton = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedUpdateAiConfiguration).toHaveBeenCalledWith({
        modelName: "gemini-3.7-flash",
        apiKey: "AIzaSyNewSecretKey123",
      });
    });

    await waitFor(() => {
      expect(apiKeyInput).toHaveValue("");
    });
  });

  it("toggles password masking when eye button is clicked", async () => {
    mockedGetAiConfiguration.mockResolvedValueOnce(mockConfig);

    render(<AiConfigForm />, { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(screen.queryByTestId("ai-config-loading")).not.toBeInTheDocument();
    });

    const apiKeyInput = screen.getByPlaceholderText("••••••••");
    expect(apiKeyInput).toHaveAttribute("type", "password");

    const toggleButton = screen.getByRole("button", { name: "Show API key" });
    fireEvent.click(toggleButton);

    expect(apiKeyInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide API key" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Hide API key" }));
    expect(apiKeyInput).toHaveAttribute("type", "password");
  });
});

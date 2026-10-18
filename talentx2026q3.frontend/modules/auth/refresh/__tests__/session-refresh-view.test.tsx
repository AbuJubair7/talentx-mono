import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { SessionRefreshView } from "../components/session-refresh-view";
import { refreshSession } from "../services/refresh.service";

jest.mock("../services/refresh.service", () => ({
  refreshSession: jest.fn(),
}));

const mockedRefreshSession = refreshSession as jest.MockedFunction<typeof refreshSession>;

const mockedReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockedReplace }),
}));

describe("SessionRefreshView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("routes to target when refresh succeeds", async () => {
    mockedRefreshSession.mockResolvedValueOnce(true);
    render(<SessionRefreshView target="/dashboard" />);

    expect(screen.getByText("Restoring your session…")).toBeInTheDocument();
    await waitFor(() => expect(mockedReplace).toHaveBeenCalledWith("/dashboard"));
    expect(mockedRefreshSession).toHaveBeenCalledTimes(1);
  });

  it("routes to /login when refresh fails", async () => {
    mockedRefreshSession.mockResolvedValueOnce(false);
    render(<SessionRefreshView target="/dashboard" />);

    await waitFor(() => expect(mockedReplace).toHaveBeenCalledWith("/login"));
  });

  it("routes to /login when refresh throws", async () => {
    mockedRefreshSession.mockRejectedValueOnce(new Error("network"));
    render(<SessionRefreshView target="/dashboard" />);

    await waitFor(() => expect(mockedReplace).toHaveBeenCalledWith("/login"));
  });

  it("routes to /dashboard when refresh succeeds without target prop", async () => {
    mockedRefreshSession.mockResolvedValueOnce(true);
    render(<SessionRefreshView />);

    expect(screen.getByText("Restoring your session…")).toBeInTheDocument();
    await waitFor(() => expect(mockedReplace).toHaveBeenCalledWith("/dashboard"));
    expect(mockedRefreshSession).toHaveBeenCalledTimes(1);
  });

  it("routes to specific custom target when provided", async () => {
    mockedRefreshSession.mockResolvedValueOnce(true);
    render(<SessionRefreshView target="/candidates/42?tab=overview" />);

    await waitFor(() => expect(mockedReplace).toHaveBeenCalledWith("/candidates/42?tab=overview"));
  });
});

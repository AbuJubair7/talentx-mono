import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { ExportMenu } from "../components/ExportMenu";
import { buildDashboard } from "../test-utils/dashboard-fixtures";
import { downloadCsv } from "../utils/export-report";

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("../utils/export-report", () => ({ downloadCsv: jest.fn() }));

const mockedDownloadCsv = jest.mocked(downloadCsv);

// Opens the menu and waits for its items.
async function openMenu() {
  fireEvent.click(screen.getByRole("button", { name: /Export/ }));
  await screen.findByRole("menuitem", { name: /Download CSV/ });
}

afterEach(() => jest.clearAllMocks());

// Checks the disabled states, the CSV download with its toasts, and printing.
describe("ExportMenu", () => {
  it("is disabled while there is no data", () => {
    render(<ExportMenu data={null} range="30d" disabled={false} />);

    expect(screen.getByRole("button", { name: /Export/ })).toBeDisabled();
  });

  it("is disabled while a request is running", () => {
    render(<ExportMenu data={buildDashboard()} range="30d" disabled />);

    expect(screen.getByRole("button", { name: /Export/ })).toBeDisabled();
  });

  it("downloads the CSV for the selected range and confirms with the file name", async () => {
    mockedDownloadCsv.mockReturnValue("talentx-platform-report_7d_2026-09-24.csv");
    const data = buildDashboard();
    render(<ExportMenu data={data} range="7d" disabled={false} />);

    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Download CSV/ }));

    expect(mockedDownloadCsv).toHaveBeenCalledWith(data, "7d");
    expect(toast.success).toHaveBeenCalledWith("Report exported", {
      description: "talentx-platform-report_7d_2026-09-24.csv",
    });
  });

  it("reports an error when the download fails", async () => {
    mockedDownloadCsv.mockImplementation(() => {
      throw new Error("Blob not supported");
    });
    render(<ExportMenu data={buildDashboard()} range="30d" disabled={false} />);

    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Download CSV/ }));

    expect(toast.error).toHaveBeenCalledWith("Couldn't export the report", { description: "Please try again." });
  });

  it("opens the print dialog", async () => {
    const print = jest.spyOn(window, "print").mockImplementation(() => undefined);
    render(<ExportMenu data={buildDashboard()} range="30d" disabled={false} />);

    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Print or save as PDF/ }));

    await waitFor(() => expect(print).toHaveBeenCalledTimes(1));
    print.mockRestore();
  });
});

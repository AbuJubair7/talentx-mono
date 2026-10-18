import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ModerationActions } from "../components/ModerationActions";
import { useDeactivateJob } from "../hooks/useDeactivateJob";
import { useReactivateJob } from "../hooks/useReactivateJob";
import type { AdminJobDetails, ModerationStatus } from "../types/job-moderation";

jest.mock("../hooks/useDeactivateJob");
jest.mock("../hooks/useReactivateJob");

const mockedUseDeactivateJob = useDeactivateJob as jest.MockedFunction<typeof useDeactivateJob>;
const mockedUseReactivateJob = useReactivateJob as jest.MockedFunction<typeof useReactivateJob>;

function mutationState(partial: Record<string, unknown> = {}) {
  return { mutateAsync: jest.fn().mockResolvedValue({}), isPending: false, ...partial } as never;
}

function buildJob(overrides: Partial<AdminJobDetails> = {}): AdminJobDetails {
  return {
    id: "job-1",
    title: "Senior Backend Engineer",
    status: "Published",
    isExpired: false,
    expireAt: "2027-10-01T00:00:00Z",
    ...overrides,
  } as AdminJobDetails;
}

const VALID_DETAILS = "The salary in the title doesn't match the posting.";

function submitDeactivation() {
  fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "Spam" } });
  fireEvent.change(screen.getByLabelText("Details"), { target: { value: VALID_DETAILS } });
  fireEvent.click(screen.getByRole("button", { name: "Deactivate job" }));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseDeactivateJob.mockReturnValue(mutationState());
  mockedUseReactivateJob.mockReturnValue(mutationState());
});

describe("ModerationActions", () => {
  it.each([
    ["Published", ["Deactivate"], ["Reactivate", "Approve & reactivate", "Deactivate again"]],
    ["Deactivated", ["Reactivate"], ["Deactivate", "Deactivate again", "Approve & reactivate"]],
    ["PendingReview", ["Deactivate again", "Approve & reactivate"], ["Deactivate", "Reactivate"]],
  ] as const)("shows the right buttons for a %s job", (status, expected, notExpected) => {
    render(<ModerationActions job={buildJob({ status: status as ModerationStatus })} />);

    for (const name of expected) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    for (const name of notExpected) {
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
    }
  });

  it("sends the deactivation and closes the dialog on success", async () => {
    const mutateAsync = jest.fn().mockResolvedValue({});
    mockedUseDeactivateJob.mockReturnValue(mutationState({ mutateAsync }));
    render(<ModerationActions job={buildJob()} />);

    fireEvent.click(screen.getByRole("button", { name: "Deactivate" }));
    submitDeactivation();

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        id: "job-1",
        payload: { reason: "Spam", details: VALID_DETAILS },
      })
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("keeps the dialog open when the deactivation fails", async () => {
    const mutateAsync = jest.fn().mockRejectedValue({ message: "Job is not published." });
    mockedUseDeactivateJob.mockReturnValue(mutationState({ mutateAsync }));
    render(<ModerationActions job={buildJob()} />);

    fireEvent.click(screen.getByRole("button", { name: "Deactivate" }));
    submitDeactivation();

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    // The admin's typed details survive, so a retry needs no retyping.
    expect(screen.getByLabelText("Details")).toHaveValue(VALID_DETAILS);
  });

  it("sends the reactivation with just the job id", async () => {
    const mutateAsync = jest.fn().mockResolvedValue({});
    mockedUseReactivateJob.mockReturnValue(mutationState({ mutateAsync }));
    render(<ModerationActions job={buildJob({ status: "Deactivated" })} />);

    fireEvent.click(screen.getByRole("button", { name: "Reactivate" }));
    fireEvent.click(screen.getByRole("button", { name: "Reactivate job" }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith("job-1"));
  });

  describe("onActionSuccess", () => {
    it("fires once after a successful deactivation", async () => {
      const onActionSuccess = jest.fn();
      render(<ModerationActions job={buildJob()} onActionSuccess={onActionSuccess} />);

      fireEvent.click(screen.getByRole("button", { name: "Deactivate" }));
      submitDeactivation();

      await waitFor(() => expect(onActionSuccess).toHaveBeenCalledTimes(1));
    });

    it("does not fire when the deactivation fails", async () => {
      const mutateAsync = jest.fn().mockRejectedValue({ message: "Job is not published." });
      mockedUseDeactivateJob.mockReturnValue(mutationState({ mutateAsync }));
      const onActionSuccess = jest.fn();
      render(<ModerationActions job={buildJob()} onActionSuccess={onActionSuccess} />);

      fireEvent.click(screen.getByRole("button", { name: "Deactivate" }));
      submitDeactivation();

      await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
      expect(onActionSuccess).not.toHaveBeenCalled();
    });

    it("fires once after a successful reactivation", async () => {
      const onActionSuccess = jest.fn();
      render(
        <ModerationActions job={buildJob({ status: "Deactivated" })} onActionSuccess={onActionSuccess} />
      );

      fireEvent.click(screen.getByRole("button", { name: "Reactivate" }));
      fireEvent.click(screen.getByRole("button", { name: "Reactivate job" }));

      await waitFor(() => expect(onActionSuccess).toHaveBeenCalledTimes(1));
    });

    it("does not fire when the reactivation fails", async () => {
      const mutateAsync = jest.fn().mockRejectedValue({ message: "Deadline has passed." });
      mockedUseReactivateJob.mockReturnValue(mutationState({ mutateAsync }));
      const onActionSuccess = jest.fn();
      render(
        <ModerationActions job={buildJob({ status: "Deactivated" })} onActionSuccess={onActionSuccess} />
      );

      fireEvent.click(screen.getByRole("button", { name: "Reactivate" }));
      fireEvent.click(screen.getByRole("button", { name: "Reactivate job" }));

      await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
      expect(onActionSuccess).not.toHaveBeenCalled();
    });

    it("is optional", async () => {
      render(<ModerationActions job={buildJob({ status: "Deactivated" })} />);

      fireEvent.click(screen.getByRole("button", { name: "Reactivate" }));
      fireEvent.click(screen.getByRole("button", { name: "Reactivate job" }));

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });
  });

  it("blocks reactivating a job whose deadline has passed", () => {
    render(<ModerationActions job={buildJob({ status: "Deactivated", isExpired: true })} />);

    fireEvent.click(screen.getByRole("button", { name: "Reactivate" }));

    expect(screen.getByRole("button", { name: "Reactivate job" })).toBeDisabled();
  });
});

import { serverApiClient } from "@/lib/api/server-axios";
import { changePassword } from "../services/change-password.service";

jest.mock("@/lib/api/server-axios", () => ({
  serverApiClient: {
    post: jest.fn(),
  },
}));

const mockedServerApiClient = jest.mocked(serverApiClient);

describe("changePassword service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("posts old and new passwords and returns success", async () => {
    mockedServerApiClient.post.mockResolvedValueOnce({ data: {} });

    const result = await changePassword({
      currentPassword: "OldPassword123!",
      newPassword: "NewPassword123!",
      confirmPassword: "NewPassword123!",
    });

    expect(mockedServerApiClient.post).toHaveBeenCalledWith("/auth/change-password", {
      oldPassword: "OldPassword123!",
      newPassword: "NewPassword123!",
    });
    expect(result).toEqual({ success: true });
  });

  it("returns validation error without calling the API when the form is invalid", async () => {
    const result = await changePassword({
      currentPassword: "OldPassword123!",
      newPassword: "short",
      confirmPassword: "short",
    });

    expect(result).toEqual({
      success: false,
      error: "Please check the form and try again.",
    });
    expect(mockedServerApiClient.post).not.toHaveBeenCalled();
  });

  it("returns validation error when new password matches current password", async () => {
    const result = await changePassword({
      currentPassword: "SamePassword123!",
      newPassword: "SamePassword123!",
      confirmPassword: "SamePassword123!",
    });

    expect(result).toEqual({
      success: false,
      error: "Please check the form and try again.",
    });
    expect(mockedServerApiClient.post).not.toHaveBeenCalled();
  });

  it("returns network error message when server is unreachable", async () => {
    mockedServerApiClient.post.mockRejectedValueOnce({
      status: null,
      message: "Network Error",
    });

    const result = await changePassword({
      currentPassword: "OldPassword123!",
      newPassword: "NewPassword123!",
      confirmPassword: "NewPassword123!",
    });

    expect(result).toEqual({
      success: false,
      error: "Unable to reach the server. Please try again.",
    });
  });

  it("returns api error message when backend rejects the request", async () => {
    mockedServerApiClient.post.mockRejectedValueOnce({
      status: 400,
      message: "Current password is incorrect.",
    });

    const result = await changePassword({
      currentPassword: "WrongPassword123!",
      newPassword: "NewPassword123!",
      confirmPassword: "NewPassword123!",
    });

    expect(result).toEqual({
      success: false,
      error: "Current password is incorrect.",
    });
  });
});

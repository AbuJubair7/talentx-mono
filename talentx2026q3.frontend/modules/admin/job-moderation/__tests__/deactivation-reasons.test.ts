import {
  DEACTIVATION_DETAILS_MAX_LENGTH,
  DEACTIVATION_DETAILS_MIN_LENGTH,
  DEACTIVATION_REASON_OPTIONS,
} from "../constants/deactivation-reasons";

describe("DEACTIVATION_REASON_OPTIONS", () => {
  it("offers the seven reasons the backend accepts, each once", () => {
    const values = DEACTIVATION_REASON_OPTIONS.map((option) => option.value);

    expect(values).toEqual([
      "Spam",
      "InappropriateContent",
      "MisleadingInformation",
      "Discriminatory",
      "DuplicatePosting",
      "Outdated",
      "Other",
    ]);
    expect(new Set(values).size).toBe(values.length);
  });

  it("uses the same wording as the backend's reason labels", () => {
    // These must match DeactivationReasonLabels.ToLabel on the backend, which is what the
    // employer reads in their email and on their job page.
    const labels = Object.fromEntries(
      DEACTIVATION_REASON_OPTIONS.map((option) => [option.value, option.label])
    );

    expect(labels).toEqual({
      Spam: "Spam",
      InappropriateContent: "Inappropriate content",
      MisleadingInformation: "Misleading or invalid information",
      Discriminatory: "Discriminatory content",
      DuplicatePosting: "Duplicate posting",
      Outdated: "Outdated job",
      Other: "Other",
    });
  });
});

describe("deactivation details length limits", () => {
  it("mirror the backend validator's 10-1000 character range", () => {
    expect(DEACTIVATION_DETAILS_MIN_LENGTH).toBe(10);
    expect(DEACTIVATION_DETAILS_MAX_LENGTH).toBe(1000);
  });
});

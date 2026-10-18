// First query-key factory in this codebase — the pattern other modules can
// adopt. `.prefill()` is defined for completeness but has no hook yet;
// GetTalentApplicationPrefill is a later phase's scope.
export const talentProfileKeys = {
  all: ["talent-profile"] as const,
  detail: () => [...talentProfileKeys.all, "detail"] as const,
  prefill: () => [...talentProfileKeys.all, "prefill"] as const,
}

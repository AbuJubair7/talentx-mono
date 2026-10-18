import { apiClient, type ApiError } from "@/lib/api/axios";
import type {
  ApplicationStatusHistoryEvent,
  PaginatedResult,
  TalentApplication,
  TalentInvitation,
  TalentMatch,
  TalentApplicationCounts,
  GetApplicationsParams,
  GetInvitationsParams,
  GetMatchesParams,
} from "../types";

export async function getTalentApplications(
  params: GetApplicationsParams
): Promise<PaginatedResult<TalentApplication>> {
  try {
    const search = params.search?.trim();
    const statusParam =
      !params.status || params.status === "All" ? undefined : params.status;

    const { data } = await apiClient.get<PaginatedResult<TalentApplication>>(
      "/talent/dashboard/applications",
      {
        params: {
          status: statusParam,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 10,
        },
      }
    );

    // NOTE: the backend has no `search` query param yet, so search is a
    // client-side filter over the current page only. The caller hides
    // pagination while a search is active to avoid misleading totals.
    // Once the API supports `?search=`, pass it through above and drop
    // this block.
    if (!search) {
      return data;
    }

    const query = search.toLowerCase();
    const filtered = (data.items || []).filter(
      (app) =>
        app.company.toLowerCase().includes(query) ||
        app.jobTitle.toLowerCase().includes(query)
    );

    return {
      items: filtered,
      page: data.page,
      pageSize: data.pageSize,
      totalCount: filtered.length,
    };
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getTalentApplicationCounts(): Promise<TalentApplicationCounts> {
  // NOTE: the backend has no dedicated counts/stats endpoint yet, so we
  // derive counts from lightweight pageSize:1 queries (totalCount only,
  // no row payload). Once `GET /talent/dashboard/stats` exists, replace
  // this with a single call.
  const [allRes, appliedRes, interviewRes, hiredRes, rejectedRes] = await Promise.all([
    apiClient.get<PaginatedResult<TalentApplication>>(
      "/talent/dashboard/applications",
      {
        params: { page: 1, pageSize: 1 },
      }
    ),
    apiClient.get<PaginatedResult<TalentApplication>>(
      "/talent/dashboard/applications",
      {
        params: { status: "Applied", page: 1, pageSize: 1 },
      }
    ),
    apiClient.get<PaginatedResult<TalentApplication>>(
      "/talent/dashboard/applications",
      {
        params: { status: "Interview", page: 1, pageSize: 1 },
      }
    ),
    apiClient.get<PaginatedResult<TalentApplication>>(
      "/talent/dashboard/applications",
      {
        params: { status: "Hired", page: 1, pageSize: 1 },
      }
    ),
    apiClient.get<PaginatedResult<TalentApplication>>(
      "/talent/dashboard/applications",
      {
        params: { status: "Rejected", page: 1, pageSize: 1 },
      }
    ),
  ]);

  return {
    total: allRes.data.totalCount ?? 0,
    applied: appliedRes.data.totalCount ?? 0,
    interviews: interviewRes.data.totalCount ?? 0,
    offers: hiredRes.data.totalCount ?? 0,
    rejected: rejectedRes.data.totalCount ?? 0,
  };
}

export async function getApplicationStatusHistory(
  applicationId: string,
  signal?: AbortSignal
): Promise<ApplicationStatusHistoryEvent[]> {
  try {
    const { data } = await apiClient.get<
      ApplicationStatusHistoryEvent[] | { items?: unknown } | { data?: unknown } | null
    >(
      `/talent/dashboard/applications/${applicationId}/status-history`,
      { signal }
    );
    return normalizeStatusHistory(data);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getTalentInvitations(
  params: GetInvitationsParams
): Promise<PaginatedResult<TalentInvitation>> {
  try {
    const { data } = await apiClient.get<PaginatedResult<TalentInvitation>>(
      "/talent/dashboard/invitations",
      {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 10,
        },
      }
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getTalentMatches(
  params: GetMatchesParams
): Promise<PaginatedResult<TalentMatch>> {
  try {
    const { data } = await apiClient.get<PaginatedResult<TalentMatch>>(
      "/talent/dashboard/matches",
      {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 10,
          minScore: params.minScore ?? 50,
        },
      }
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

function normalizeStatusHistory(
  raw: unknown
): ApplicationStatusHistoryEvent[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { items?: unknown } | null)?.items)
      ? ((raw as { items: unknown[] }).items)
      : Array.isArray((raw as { data?: unknown } | null)?.data)
        ? ((raw as { data: unknown[] }).data)
        : [];

  return list
    .map((event) => {
      const record = event as Record<string, unknown>;
      const fromStatus =
        (record.fromStatus as ApplicationStatusHistoryEvent['fromStatus']) ??
        (record.FromStatus as ApplicationStatusHistoryEvent['fromStatus']) ??
        null;
      const toStatus =
        (record.toStatus as ApplicationStatusHistoryEvent['toStatus']) ??
        (record.ToStatus as ApplicationStatusHistoryEvent['toStatus']);
      const changedAt =
        (record.changedAt as string) ?? (record.ChangedAt as string);
      if (!toStatus || typeof changedAt !== 'string') {
        return null;
      }
      return { fromStatus, toStatus, changedAt };
    })
    .filter(
      (event): event is ApplicationStatusHistoryEvent => event !== null
    );
}

function normalizeError(error: unknown): Error {
  const apiError = error as ApiError;
  const message = apiError?.message || "Something went wrong. Please try again.";
  
  const err = new Error(message);
  (err as Error & ApiError).status = apiError?.status ?? null;
  (err as Error & ApiError).errors = apiError?.errors;
  return err;
}
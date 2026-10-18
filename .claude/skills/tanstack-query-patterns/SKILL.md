---
name: tanstack-query-patterns
description: >-
  Enforces TanStack React Query architecture standards for asynchronous server state, structured query key
  factories, optimistic UI mutations, cache invalidation strategies, and robust Axios error handling in TalentX.
---

# TanStack Query & Server State Management Skill

This skill enforces enterprise async state management patterns using TanStack React Query (`@tanstack/react-query`) and Axios in the TalentX Next.js frontend.

---

## 🔑 1. Structured Query Key Factories

Query keys must be structured hierarchically as array tuples. Never use loose string keys (e.g. `'jobs'`, `'employer'`).

### Query Key Factory Pattern:
```ts
// modules/jobs/keys/job.keys.ts
export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: JobFilters) => [...jobKeys.lists(), filters] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  applicants: (jobId: string) => [...jobKeys.detail(jobId), 'applicants'] as const,
};
```

### Usage in Custom Hooks:
```ts
// modules/jobs/hooks/use-jobs.ts
export function useJobs(filters: JobFilters) {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: () => jobService.getJobs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 30,    // 30 minutes in garbage collection cache
  });
}
```

---

## ⚡ 2. Mutation & Cache Invalidation Patterns

Always encapsulate mutations in custom hooks under `modules/[feature]/hooks/`.

### Rules:
1. **Invalidate Related Queries on Success**: When mutating state (e.g. publishing a job, verifying email, creating an employer profile), explicitly invalidate the affected query keys.
2. **Handle Loading & Error States Cleanly**: Return `isPending`, `error`, and `mutateAsync` or `mutate` from custom hooks.

```ts
// modules/jobs/hooks/use-create-job.ts
export function useCreateJob() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateJobRequest) => jobService.createJob(data),
    onSuccess: (newJob) => {
      // Invalidate job list so fresh data is fetched on return
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      router.push(`/employer/jobs/${newJob.id}`);
    },
  });
}
```

---

## 🚀 3. Optimistic UI Updates with Rollback

For instant user feedback (e.g. saving a job, favoriting a candidate, updating status):

```ts
export function useSaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => jobService.saveJob(jobId),
    onMutate: async (jobId) => {
      // 1. Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: jobKeys.detail(jobId) });

      // 2. Snapshot previous cache state
      const previousJob = queryClient.getQueryData<JobDetails>(jobKeys.detail(jobId));

      // 3. Optimistically update query cache
      if (previousJob) {
        queryClient.setQueryData<JobDetails>(jobKeys.detail(jobId), {
          ...previousJob,
          isSaved: true,
        });
      }

      // Return context with snapshot for rollback
      return { previousJob };
    },
    onError: (err, jobId, context) => {
      // Rollback cache if mutation fails
      if (context?.previousJob) {
        queryClient.setQueryData(jobKeys.detail(jobId), context.previousJob);
      }
    },
    onSettled: (data, error, jobId) => {
      // Always sync with server after error or success
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
    },
  });
}
```

---

## 🛡️ 4. Axios Interceptors & Error Standardization

All services in `modules/[feature]/services/` must use the centralized `apiClient` (`@/lib/api-client`):

1. **Authentication Headers**: Attach JWT `Authorization: Bearer <accessToken>` automatically via request interceptor.
2. **Standard Error Extraction**: Response interceptors must extract the backend error contract into clean `Error` instances. The API returns `{ Message }` (plus `Errors[]` on validation failures), NOT RFC 7807 — `lib/axios.ts` `parseApiError` already handles this casing-tolerantly and yields the custom `ApiError`. Consumers catch `ApiError`, never `AxiosError`.
3. **Auto Refresh Token Flow**: Intercept `401 Unauthorized` responses to seamlessly invoke `/api/v1/auth/refresh` and retry the original request.

---

## 📋 TanStack Query Checklist for PRs
- [ ] Query keys use hierarchical factory objects (`jobKeys.list(filters)`).
- [ ] Explicit `staleTime` and `gcTime` are defined for queries.
- [ ] Mutations invalidate appropriate query cache keys on success.
- [ ] Optimistic updates include full error rollback handlers (`onError` with previous state context).
- [ ] API service methods are typed with explicit request & response interfaces.

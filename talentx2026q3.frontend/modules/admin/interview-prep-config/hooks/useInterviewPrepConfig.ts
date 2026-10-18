import { useQuery } from "@tanstack/react-query";
import { fetchInterviewPrepConfig } from "../services/config.service";

export const interviewPrepConfigKeys = {
  all: ["admin", "interview-prep-config"] as const,
};

export function useInterviewPrepConfig() {
  return useQuery({
    queryKey: interviewPrepConfigKeys.all,
    queryFn: fetchInterviewPrepConfig,
  });
}

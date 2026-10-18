
export const protectedRoutes = [
  "/debug",
  "/jobs/jobpost",
  "/job-alerts",
];

export function isProtectedRoute(pathname: string) {
  return protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}
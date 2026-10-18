import { QueryProvider } from "./query-provider"
import { GetStartedProvider } from "./get-started-provider"
import { SignInProvider } from "./sign-in-provider"

// Single composition root for every client-side context provider the app
// needs. app/layout.tsx only ever imports this one component — adding a new
// provider (theme, auth, etc.) means adding a file here and nesting it below,
// never touching the layout itself.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <GetStartedProvider>
        <SignInProvider>{children}</SignInProvider>
      </GetStartedProvider>
    </QueryProvider>
  )
}

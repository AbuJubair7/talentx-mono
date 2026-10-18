const fs = require('fs');
const path = require('path');

const files = [
  'components/layout/__tests__/app-sidebar.test.tsx',
  'components/layout/__tests__/app-shell.test.tsx',
  'tests/portal-layout.test.tsx',
  'tests/admin-routes.test.tsx',
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(
    /import\s+\{([^}]*)\brender\b([^}]*)\}\s+from\s+["']@testing-library\/react["']/g,
    'import { $1 render as rtlRender $2 } from "@testing-library/react"'
  );

  const customRenderCode = `
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const customRender = (ui: any, options = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return rtlRender(ui, { wrapper: ({ children }: any) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>, ...options });
};
`;
  if (!content.includes('const customRender')) {
    content = content.replace(/(describe\s*\()/i, customRenderCode + '\n$1');
  }

  content = content.replace(/\brender\(/g, 'customRender(');

  const currentEmployerMock = `
jest.mock("@/modules/jobposting/hooks/useCurrentEmployer", () => ({
  useCurrentEmployer: jest.fn(() => ({ data: undefined })),
}));
`;
  if (!content.includes('useCurrentEmployer')) {
    content = content.replace(/(jest\.mock\("@\/modules\/talent-profile\/hooks\/useTalentProfile".*?\n\}\)\);)/s, `$1\n${currentEmployerMock}`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}

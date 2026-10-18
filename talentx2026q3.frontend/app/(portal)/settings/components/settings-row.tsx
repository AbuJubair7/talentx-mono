export interface SettingsRowProps {
  title: string;
  description: string;
  badge?: React.ReactNode;
  control: React.ReactNode;
}

export function SettingsRow({ title, description, badge, control }: SettingsRowProps) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {badge}
        </div>
        <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

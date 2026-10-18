'use client';

interface TopicsSectionProps {
  topics: string[];
  reviseAreas: string[];
}

export function TopicsSection({ topics, reviseAreas }: TopicsSectionProps) {
  if (!topics.length && !reviseAreas.length) {
    return (
      <p className="rounded-md border border-dashed border-line-strong bg-surface px-5 py-8 text-center text-sm text-ink-muted">
        No topics were included in this preparation. Try regenerating to get fresh guidance.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {topics.length > 0 && (
        <section aria-labelledby="topics-heading">
          <h3 id="topics-heading" className="text-base font-semibold text-ink">
            Key topics to prepare
          </h3>
          <p className="text-sm text-ink-subtle">Ordered by how likely they are to come up.</p>
          <ul className="mt-4 divide-y divide-line rounded-md border border-line bg-surface shadow-card">
            {topics.map((topic, idx) => (
              <li key={`${idx}-${topic}`} className="px-5 py-4">
                <p className="text-[15px] font-medium leading-6 text-ink">{topic}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {reviseAreas.length > 0 && (
        <section aria-labelledby="revise-heading">
          <h3 id="revise-heading" className="text-base font-semibold text-ink">
            Suggested areas to revise
          </h3>
          <p className="text-sm text-ink-subtle">Gaps worth closing before the interview.</p>
          <ul className="mt-4 space-y-5 border-l-2 border-line pl-5">
            {reviseAreas.map((area, idx) => (
              <li key={`${idx}-${area}`}>
                <p className="text-[15px] font-medium leading-6 text-ink">{area}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

import { Reveal } from './reveal'

type SectionHeadingProps = {
  id?: string
  eyebrow?: string
  title: string
  body?: string
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  body,
  align = 'left',
  tone = 'light',
}: SectionHeadingProps) {
  const dark = tone === 'dark'
  return (
    <Reveal className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <p
          className={`text-xs font-bold uppercase tracking-widest ${
            dark ? 'text-emerald-400' : 'text-emerald-600'
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={`mt-3 text-3xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-4xl ${
          dark ? 'text-white' : 'text-slate-900'
        }`}
      >
        {title}
      </h2>
      {body && (
        <p
          className={`mt-5 text-base leading-relaxed sm:text-lg ${
            dark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {body}
        </p>
      )}
    </Reveal>
  )
}

import { SkillsField as CommonSkillsField } from "@/components/common/form/SkillsField"

interface SkillsFieldProps {
  value: string[]
  onChange: (skills: string[]) => void
  error?: string
}

// Job skills input: the shared tag field with job-specific copy and no preset suggestions.
export function SkillsField({ value, onChange, error }: SkillsFieldProps) {
  return (
    <CommonSkillsField
      value={value}
      onChange={onChange}
      error={error}
      label="Required skills"
      hint="Skills drive candidate matching — the first three show on the job card."
      placeholder="Type a skill…"
      inputId="skills-field-input"
    />
  )
}

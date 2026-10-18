export const ALLOWED_PHOTO_CONTENT_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
]

export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024

export const PROFILE_PRINT_STYLES = `
@media print {
  .profile-no-print {
    display: none !important;
  }
  #profile-print-target {
    border: 1px solid #cbd5e1 !important;
    box-shadow: none !important;
  }
  .profile-banner {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
`

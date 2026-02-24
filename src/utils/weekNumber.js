// Returns the current ISO week number and year.
// Every recipe is tagged with these so we know which weekly competition it belongs to.
// Example: { week_number: 8, year: 2026 }
export function getCurrentWeek() {
  const now = new Date()
  const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  const day = date.getUTCDay() || 7 // treat Sunday as 7 instead of 0
  date.setUTCDate(date.getUTCDate() + 4 - day) // shift to nearest Thursday
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week_number = Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
  return { week_number, year: date.getUTCFullYear() }
}

// Keys match JS Date.getDay() (0 = Sunday, 1 = Monday, …)
export const HEARTS_BY_DAY = {
  1: 3, // Monday
  2: 3, // Tuesday
  3: 3, // Wednesday
  4: 4, // Thursday
  5: 4, // Friday
  6: 5, // Saturday
  0: 5, // Sunday
}

export function getSuccessMessage(remaining, total) {
  if (remaining === 0) return 'Next time!'
  if (remaining === 1) return 'Got it!'
  if (remaining === total) return 'Perfect!'
  if (total - remaining === 1) return 'Awesome!'
  if (total - remaining === 2) return 'Great!'
  return 'Good!'
}

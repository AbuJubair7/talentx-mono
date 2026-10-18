export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type TimeOfDayIconType = 'sun' | 'sun-medium' | 'moon';

export function getTimeOfDay(referenceDate: Date = new Date()): TimeOfDay {
  const currentHour = referenceDate.getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return 'morning';
  }

  if (currentHour >= 12 && currentHour < 17) {
    return 'afternoon';
  }

  if (currentHour >= 17 && currentHour < 22) {
    return 'evening';
  }

  return 'night';
}

export function getTimeOfDayIconType(timeOfDay: TimeOfDay): TimeOfDayIconType {
  switch (timeOfDay) {
    case 'morning':
      return 'sun';
    case 'afternoon':
      return 'sun-medium';
    case 'evening':
    case 'night':
      return 'moon';
  }
}

export function getGreetingPrefix(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case 'morning':
      return 'Good morning';
    case 'afternoon':
      return 'Good afternoon';
    case 'evening':
    case 'night':
      return 'Good evening';
  }
}

export function resolveGreetingRecipient(
  userName?: string | null,
  userEmail?: string | null
): string | null {
  const trimmedName = userName?.trim();
  const trimmedEmail = userEmail?.trim();

  if (trimmedName && trimmedName.length > 0) {
    if (trimmedName.includes('@')) {
      const atSignIndex = trimmedName.indexOf('@');
      const emailUsername = trimmedName.slice(0, atSignIndex).trim();
      return emailUsername.length > 0 ? emailUsername : trimmedName;
    }
    const [firstName] = trimmedName.split(/\s+/);
    return firstName;
  }

  if (trimmedEmail && trimmedEmail.length > 0) {
    const atSignIndex = trimmedEmail.indexOf('@');
    if (atSignIndex !== -1) {
      const emailUsername = trimmedEmail.slice(0, atSignIndex).trim();
      return emailUsername.length > 0 ? emailUsername : trimmedEmail;
    }
    return trimmedEmail;
  }

  return null;
}

export function formatGreetingDate(referenceDate: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(referenceDate);
}

export function formatGreeting(
  userName?: string | null,
  userEmail?: string | null,
  referenceDate: Date = new Date()
): string {
  const timeOfDay = getTimeOfDay(referenceDate);
  const greetingPrefix = getGreetingPrefix(timeOfDay);
  const resolvedRecipient = resolveGreetingRecipient(userName, userEmail);

  if (resolvedRecipient) {
    return `${greetingPrefix}, ${resolvedRecipient}`;
  }

  return greetingPrefix;
}

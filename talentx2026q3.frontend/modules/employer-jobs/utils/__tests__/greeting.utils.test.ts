import {
  formatGreeting,
  formatGreetingDate,
  getGreetingPrefix,
  getTimeOfDay,
  getTimeOfDayIconType,
  resolveGreetingRecipient,
  type TimeOfDay,
} from '../greeting.utils';

function createDateAtHour(hour: number, minute: number = 0): Date {
  const testDate = new Date(2026, 8, 14, hour, minute, 0);
  return testDate;
}

describe('greeting.utils', () => {
  describe('getTimeOfDay', () => {
    it('returns morning for times between 05:00 and 11:59', () => {
      expect(getTimeOfDay(createDateAtHour(5, 0))).toBe('morning');
      expect(getTimeOfDay(createDateAtHour(8, 30))).toBe('morning');
      expect(getTimeOfDay(createDateAtHour(11, 59))).toBe('morning');
    });

    it('returns afternoon for times between 12:00 and 16:59', () => {
      expect(getTimeOfDay(createDateAtHour(12, 0))).toBe('afternoon');
      expect(getTimeOfDay(createDateAtHour(14, 15))).toBe('afternoon');
      expect(getTimeOfDay(createDateAtHour(16, 59))).toBe('afternoon');
    });

    it('returns evening for times between 17:00 and 21:59', () => {
      expect(getTimeOfDay(createDateAtHour(17, 0))).toBe('evening');
      expect(getTimeOfDay(createDateAtHour(19, 45))).toBe('evening');
      expect(getTimeOfDay(createDateAtHour(21, 59))).toBe('evening');
    });

    it('returns night for times between 22:00 and 04:59', () => {
      expect(getTimeOfDay(createDateAtHour(22, 0))).toBe('night');
      expect(getTimeOfDay(createDateAtHour(23, 59))).toBe('night');
      expect(getTimeOfDay(createDateAtHour(0, 0))).toBe('night');
      expect(getTimeOfDay(createDateAtHour(3, 30))).toBe('night');
      expect(getTimeOfDay(createDateAtHour(4, 59))).toBe('night');
    });

    it('uses current date when no argument is provided', () => {
      const resultTimeOfDay = getTimeOfDay();
      const validTimes: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night'];
      expect(validTimes).toContain(resultTimeOfDay);
    });
  });

  describe('getGreetingPrefix', () => {
    it('returns "Good morning" for morning', () => {
      expect(getGreetingPrefix('morning')).toBe('Good morning');
    });

    it('returns "Good afternoon" for afternoon', () => {
      expect(getGreetingPrefix('afternoon')).toBe('Good afternoon');
    });

    it('returns "Good evening" for evening', () => {
      expect(getGreetingPrefix('evening')).toBe('Good evening');
    });

    it('returns "Good evening" for night', () => {
      expect(getGreetingPrefix('night')).toBe('Good evening');
    });
  });

  describe('formatGreeting', () => {
    const morningDate = createDateAtHour(9, 0);
    const afternoonDate = createDateAtHour(14, 0);
    const eveningDate = createDateAtHour(19, 0);
    const nightDate = createDateAtHour(23, 0);

    it('formats greeting with extracted first name when full name is provided', () => {
      expect(formatGreeting('Alex Smith', null, morningDate)).toBe('Good morning, Alex');
      expect(formatGreeting('Sarah Connor', 'sarah@example.com', afternoonDate)).toBe('Good afternoon, Sarah');
      expect(formatGreeting('  Jane   Doe  ', null, eveningDate)).toBe('Good evening, Jane');
    });

    it('formats greeting with single name when provided', () => {
      expect(formatGreeting('Alex', null, morningDate)).toBe('Good morning, Alex');
      expect(formatGreeting('Jordan', null, nightDate)).toBe('Good evening, Jordan');
    });

    it('falls back to stripped email username when name is null, undefined, or empty', () => {
      expect(formatGreeting(null, 'alex@company.com', morningDate)).toBe('Good morning, alex');
      expect(formatGreeting(undefined, 'alex@company.com', afternoonDate)).toBe('Good afternoon, alex');
      expect(formatGreeting('', 'alex@company.com', eveningDate)).toBe('Good evening, alex');
      expect(formatGreeting('   ', 'alex@company.com', nightDate)).toBe('Good evening, alex');
    });

    it('falls back to standalone greeting prefix when neither name nor email is provided', () => {
      expect(formatGreeting(null, null, morningDate)).toBe('Good morning');
      expect(formatGreeting(undefined, undefined, afternoonDate)).toBe('Good afternoon');
      expect(formatGreeting('', '', eveningDate)).toBe('Good evening');
      expect(formatGreeting('   ', '   ', nightDate)).toBe('Good evening');
    });

    it('works with default date parameter', () => {
      const formattedGreeting = formatGreeting('Alex');
      expect(formattedGreeting).toMatch(/^Good (morning|afternoon|evening), Alex$/);
    });
  });

  describe('resolveGreetingRecipient', () => {
    it('extracts first name from full name', () => {
      expect(resolveGreetingRecipient('Alex Smith')).toBe('Alex');
      expect(resolveGreetingRecipient('  Alex   Smith  ')).toBe('Alex');
    });

    it('returns single name as is', () => {
      expect(resolveGreetingRecipient('Alex')).toBe('Alex');
    });

    it('falls back to stripped email username when name is null, undefined, or empty', () => {
      expect(resolveGreetingRecipient(null, 'alex@company.com')).toBe('alex');
      expect(resolveGreetingRecipient(undefined, 'alex@company.com')).toBe('alex');
      expect(resolveGreetingRecipient('', 'alex@company.com')).toBe('alex');
      expect(resolveGreetingRecipient('   ', 'alex@company.com')).toBe('alex');
    });

    it('strips username before @ for email addresses', () => {
      expect(resolveGreetingRecipient(null, 'abir@gmail.com')).toBe('abir');
      expect(resolveGreetingRecipient(null, 'alex@company.com')).toBe('alex');
      expect(resolveGreetingRecipient('abir13813@gmail.com')).toBe('abir13813');
      expect(resolveGreetingRecipient('abir13813@gmail.com', 'abir13813@gmail.com')).toBe('abir13813');
    });

    it('returns trimmed email when email contains no @', () => {
      expect(resolveGreetingRecipient(null, 'alex')).toBe('alex');
      expect(resolveGreetingRecipient(null, '  alex  ')).toBe('alex');
    });

    it('returns null when neither name nor email is provided', () => {
      expect(resolveGreetingRecipient(null, null)).toBeNull();
      expect(resolveGreetingRecipient(undefined, undefined)).toBeNull();
      expect(resolveGreetingRecipient('', '')).toBeNull();
      expect(resolveGreetingRecipient('   ', '   ')).toBeNull();
    });
  });

  describe('formatGreetingDate', () => {
    it('formats date to English weekday, short month, and numeric day', () => {
      const fixedDate = new Date(2026, 8, 16, 12, 0, 0);
      expect(formatGreetingDate(fixedDate)).toBe('Wednesday, Sep 16');
    });

    it('works with default date parameter', () => {
      const formattedDate = formatGreetingDate();
      expect(typeof formattedDate).toBe('string');
      expect(formattedDate.length).toBeGreaterThan(0);
    });
  });

  describe('getTimeOfDayIconType', () => {
    it('returns "sun" for morning', () => {
      expect(getTimeOfDayIconType('morning')).toBe('sun');
    });

    it('returns "sun-medium" for afternoon', () => {
      expect(getTimeOfDayIconType('afternoon')).toBe('sun-medium');
    });

    it('returns "moon" for evening', () => {
      expect(getTimeOfDayIconType('evening')).toBe('moon');
    });

    it('returns "moon" for night', () => {
      expect(getTimeOfDayIconType('night')).toBe('moon');
    });
  });
});

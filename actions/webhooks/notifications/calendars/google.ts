type GoogleCalendarEvent = {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string; // ISO 8601 format
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: { email: string }[];
  reminders?: {
    useDefault: boolean;
    overrides?: { method: string; minutes: number }[];
  };
};


async function formatForGoogleCalendarEvent(
  title: string,
  start: Date,
  end: Date,
  timeZone: string = "UTC",
  description?: string,
  location?: string,
): Promise<GoogleCalendarEvent> {
  const event: GoogleCalendarEvent = {
    summary: title,
    description: description,
    location: location,
    start: {
      dateTime: start.toISOString(),
      timeZone,
    },
    end: {
      dateTime: end.toISOString(),
      timeZone,
    },
  };

  return event;
}

export { formatForGoogleCalendarEvent };
export type { GoogleCalendarEvent };

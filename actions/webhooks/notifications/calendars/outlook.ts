type OutlookCalendarEvent = {
  subject: string;
  body?: {
    contentType: "HTML" | "Text";
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
  attendees?: {
    emailAddress: {
      address: string;
      name?: string;
    };
    type?: "required" | "optional";
  }[];
};


async function formatForOutlookCalendarEvent(
  title: string,
  start: Date,
  end: Date,
  timeZone: string = "UTC",
  description?: string,
  location?: string,
): Promise<OutlookCalendarEvent> {
  const event: OutlookCalendarEvent = {
    subject: title,
    body: description
      ? {
          contentType: "Text",
          content: description,
        }
      : undefined,
    start: {
      dateTime: start.toISOString(),
      timeZone,
    },
    end: {
      dateTime: end.toISOString(),
      timeZone,
    },
    location: location ? { displayName: location } : undefined,
  };

  return event;
}

export { formatForOutlookCalendarEvent };
export type { OutlookCalendarEvent };

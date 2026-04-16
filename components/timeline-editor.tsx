"use client";

import type { TimelineEvent } from "@/lib/types";

interface TimelineEditorProps {
  events: TimelineEvent[];
  onChange: (events: TimelineEvent[]) => void;
}

const emptyTimelineEvent: TimelineEvent = {
  date: "",
  title: "",
  details: "",
  source: "Victim statement"
};

export function TimelineEditor({ events, onChange }: TimelineEditorProps) {
  function updateEvent(index: number, field: keyof TimelineEvent, value: string) {
    const nextEvents = [...events];
    nextEvents[index] = {
      ...nextEvents[index],
      [field]: value
    };
    onChange(nextEvents);
  }

  function addEvent() {
    onChange([...events, { ...emptyTimelineEvent }]);
  }

  function removeEvent(index: number) {
    onChange(events.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="space-y-3">
      {events.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          No timeline events added yet.
        </div>
      ) : null}

      {events.map((event, index) => (
        <div key={`${event.date}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label htmlFor={`timeline-date-${index}`}>Date</label>
              <input
                id={`timeline-date-${index}`}
                type="date"
                value={event.date}
                onChange={(currentEvent) => updateEvent(index, "date", currentEvent.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`timeline-source-${index}`}>Source</label>
              <input
                id={`timeline-source-${index}`}
                value={event.source}
                onChange={(currentEvent) => updateEvent(index, "source", currentEvent.target.value)}
              />
            </div>
          </div>

          <div className="mt-3">
            <label htmlFor={`timeline-title-${index}`}>Event title</label>
            <input
              id={`timeline-title-${index}`}
              value={event.title}
              onChange={(currentEvent) => updateEvent(index, "title", currentEvent.target.value)}
            />
          </div>

          <div className="mt-3">
            <label htmlFor={`timeline-details-${index}`}>Details</label>
            <textarea
              id={`timeline-details-${index}`}
              rows={3}
              value={event.details}
              onChange={(currentEvent) => updateEvent(index, "details", currentEvent.target.value)}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => removeEvent(index)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-white"
            >
              Remove Event
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEvent}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
      >
        Add Timeline Event
      </button>
    </div>
  );
}

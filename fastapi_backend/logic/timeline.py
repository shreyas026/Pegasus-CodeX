from models import TimelineEvent


def summarize_timeline(events: list[TimelineEvent], prior_complaints_count: int) -> str:
    if not events:
        if prior_complaints_count > 0:
            return (
                f"No dated timeline entries were provided, but the case notes "
                f"{prior_complaints_count} prior complaint(s)."
            )
        return "No structured incident timeline was provided."

    sorted_events = sorted(events, key=lambda event: event.date)
    first_event = sorted_events[0]
    last_event = sorted_events[-1]

    return (
        f"{len(sorted_events)} timeline event(s) were recorded from {first_event.date} "
        f"to {last_event.date}, with {prior_complaints_count} prior complaint(s) noted."
    )

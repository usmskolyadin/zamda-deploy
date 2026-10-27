from datetime import timedelta

from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime

PERIOD_CHOICES = (
    "today", "yesterday", "7d", "30d", "90d", "this_month", "last_month", "custom",
)


def _start_of_day(dt):
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)


def _parse_bound(value):
    if not value:
        return None
    dt = parse_datetime(value)
    if dt is not None:
        return timezone.make_aware(dt) if timezone.is_naive(dt) else dt
    date = parse_date(value)
    if date is not None:
        return timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.min.time()))
    return None


def parse_period(request):
    """Resolve the ?period=... (+from/to for custom) query params into a
    (start, end, prev_start, prev_end) tuple of UTC-aware datetimes, where
    prev_* is the immediately preceding window of the same length.

    All comparisons in this file run in UTC, matching settings.TIME_ZONE;
    the frontend labels values accordingly rather than assuming the
    browser's local zone.
    """
    now = timezone.now()
    period = request.query_params.get("period", "7d")

    if period == "custom":
        start = _parse_bound(request.query_params.get("from")) or (now - timedelta(days=7))
        end = _parse_bound(request.query_params.get("to")) or now
    elif period == "today":
        start, end = _start_of_day(now), now
    elif period == "yesterday":
        today_start = _start_of_day(now)
        start, end = today_start - timedelta(days=1), today_start
    elif period == "30d":
        start, end = now - timedelta(days=30), now
    elif period == "90d":
        start, end = now - timedelta(days=90), now
    elif period == "this_month":
        start, end = _start_of_day(now).replace(day=1), now
    elif period == "last_month":
        first_of_this_month = _start_of_day(now).replace(day=1)
        end = first_of_this_month
        start = (first_of_this_month - timedelta(days=1)).replace(day=1)
    else:  # "7d" and fallback
        start, end = now - timedelta(days=7), now

    if end <= start:
        end = start + timedelta(seconds=1)

    duration = end - start
    prev_end = start
    prev_start = start - duration

    return start, end, prev_start, prev_end


def pct_change(current, previous):
    """None when there's nothing to meaningfully compare against, instead
    of NaN/Infinity."""
    if previous in (0, None):
        return None
    return round((current - previous) / previous * 100, 1)


def trunc_kind_for_range(start, end):
    """Daily buckets up to 90 days, weekly beyond that — avoids inventing
    hourly granularity the underlying events don't reliably support anyway
    (everything here is backed by created_at on real rows, see the plan)."""
    days = (end - start).days
    return "day" if days <= 90 else "week"

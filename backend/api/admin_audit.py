from django.contrib.admin.models import LogEntry, CHANGE
from django.contrib.contenttypes.models import ContentType


def log_admin_action(request, obj, message):
    """Write one entry to Django's own admin action history (LogEntry).

    Reused on purpose instead of a new audit model: it's already installed,
    already populated by stock Django Admin edits, and shows up for free on
    each object's "History" link there too.
    """
    LogEntry.objects.log_action(
        user_id=request.user.id,
        content_type_id=ContentType.objects.get_for_model(obj).pk,
        object_id=obj.pk,
        object_repr=str(obj),
        action_flag=CHANGE,
        change_message=message,
    )

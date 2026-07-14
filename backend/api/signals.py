import json
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.template.loader import render_to_string

from .utlis import send_sms

from .models import Message, Chat, PushSubscription
from .models import UserProfile, UserVerification
from utils.email import send_email


from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User



@receiver(post_save, sender=User)
def create_user_data(sender, instance, created, **kwargs):
    print("CREATE VERIFICATION SIGNAL FIRED")
    if created:
        UserProfile.objects.get_or_create(user=instance)
        UserVerification.objects.get_or_create(user=instance)

@receiver(post_save, sender=Message)
def notify_new_message(sender, instance, created, **kwargs):
    print("MESSAGE SIGNAL FIRED")
    if not created:
        return
    chat = instance.chat
    sender_user = instance.sender

    recipient = chat.buyer if chat.seller == sender_user else chat.seller

    if not recipient:
        return

    html_content = render_to_string("emails/new_message.html", {
        "recipient_name": getattr(recipient, "username", "User"),
        "sender_name": getattr(sender_user, "username", "User"),
        "ad_title": chat.ad.title,
        "message_text": instance.text,
    })

    text_content = f"""
        New message from {sender_user.username}
        Regarding: {chat.ad.title}

        Message:
        {instance.text}
        """

    profile = getattr(recipient, "profile", None)
    print("SENDING EMAIL")

    if profile and profile.email_notifications:
        try:
            send_email(
                to_email=recipient.email,
                subject=f"New message about {chat.ad.title}",
                html_content=html_content,
                text_content=text_content
            )
        except Exception as e:
            print(f"Email sending failed: {e}")

    verification = getattr(
        recipient,
        "verification",
        None
    )

    if (
        profile
        and profile.sms_notifications
        and verification
        and verification.phone_verified
        and verification.phone_number
    ):
        try:
            print("SENDING SMS")
            msg = send_sms(
                verification.phone_number,
                (
                    f"New message from {sender_user.username}\n"
                    f"Regarding: {chat.ad.title}\n\n"
                    f"{instance.text[:120]}"
                )
            )

            print("SID:", msg.sid)
            print("STATUS:", msg.status)
            print("ERROR_CODE:", msg.error_code)
            print("ERROR_MESSAGE:", msg.error_message)
            print("SMS SENT")
        except Exception as e:
            print(f"SMS sending failed: {e}")

    try:
        send_push_notification(
            recipient=recipient,
            title=f"New message from {sender_user.username}",
            body=instance.text[:200],
            chat_id=chat.id,
        )
    except Exception as e:
        print(f"Push notification sending failed: {e}")


def send_push_notification(recipient, title, body, chat_id):
    from django.conf import settings
    from pywebpush import webpush

    subscriptions = PushSubscription.objects.filter(user=recipient)
    if not subscriptions.exists():
        return

    payload = json.dumps({
        "title": title,
        "body": body,
        "data": {
            "chatId": chat_id,
            "url": f"/messages/{chat_id}",
        },
        "icon": "/icons/favicon.ico",
    })

    vapid_private_key = settings.WEBPUSH_VAPID_PRIVATE_KEY
    vapid_claims = {
        "sub": f"mailto:{settings.WEBPUSH_VAPID_CLAIMS_EMAIL}",
    }

    for sub in subscriptions:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {
                        "p256dh": sub.p256dh_key,
                        "auth": sub.auth_key,
                    },
                },
                data=payload,
                vapid_private_key=vapid_private_key,
                vapid_claims=vapid_claims,
            )
        except Exception as e:
            if hasattr(e, "response") and e.response.status_code in (410, 404):
                sub.delete()
                print(f"Removed expired push subscription for {recipient.username}")
            else:
                print(f"Push send failed for {recipient.username}: {e}")
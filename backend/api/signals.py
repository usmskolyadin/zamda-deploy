from django.db.models.signals import post_save
from django.dispatch import receiver
from django.template.loader import render_to_string

from .models import Message, Chat
from .models import UserProfile, UserVerification
from utils.email import send_email


from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User



@receiver(post_save, sender=User)
def create_user_data(sender, instance, created, **kwargs):
    print("🔥 CREATE VERIFICATION SIGNAL FIRED")
    if created:
        UserProfile.objects.get_or_create(user=instance)
        UserVerification.objects.get_or_create(user=instance)

@receiver(post_save, sender=Message)
def notify_new_message(sender, instance, created, **kwargs):
    print("🔥 MESSAGE SIGNAL FIRED")
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

    send_email(
        to_email=recipient.email,
        subject=f"New message about {chat.ad.title}",
        html_content=html_content,
        text_content=text_content
    )
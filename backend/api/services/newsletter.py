import markdown
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from utils.email import send_email

def render_markdown_to_html(content: str) -> str:
    return markdown.markdown(content)


def send_newsletter_email(user, subject: str, markdown_content: str):
    html_body = render_markdown_to_html(markdown_content)
    text_content = strip_tags(html_body)
    html_content = render_to_string(
        "emails/newsletter.html",
        {
            "user": user,
            "content": html_body,
            "subject": subject
        },
    )

    send_email(
        to_email=user.email,
        subject=subject,
        html_content=html_content,
        text_content=text_content, 
    )


def send_newsletter_to_users(users, subject: str, content: str):
    for user in users:
        send_newsletter_email(user, subject, content)
import uuid

from django.db import models
from django.conf import settings


class ChatSession(models.Model):
    id = models.UUIDField(default=uuid.uuid4, unique=True, 
                          primary_key=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'ChatSession {self.id} with user {self.user}'


class ChatSource(models.Model):
    chat_session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='sources')
    title = models.CharField(max_length=255)
    url = models.URLField()
    content = models.TextField()

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if self.chat_session.sources.count() >= 10:
            raise ValueError("Can't add more than 10 sources to a chat session.")
        super().save(*args, **kwargs)


class ChatMessage(models.Model):
    ROLE_TYPES = [
        ('system', 'System'),
        ('assistant', 'Assistant'),
        ('user', 'User'),
    ]

    chat_session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_TYPES)
    content = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.role}: {self.content[:50]}'

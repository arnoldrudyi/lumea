import uuid

from django.db import models
from django.forms import ValidationError
from django.conf import settings

from chat_session.models import ChatSession


class Plan(models.Model):
    id = models.UUIDField(default=uuid.uuid4, unique=True, 
                          primary_key=True, editable=False)
    chat_session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='plans')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    topic = models.CharField(max_length=255)
    total_hours = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.topic} by {self.user}'


class PlanItem(models.Model):
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name='items')
    theme = models.CharField(max_length=255)
    hours = models.FloatField()

    def save(self, *args, **kwargs):
        total_plan_item_hours = sum(item.hours for item in self.plan.items.all())
        projected_total_hours = total_plan_item_hours + self.hours

        if projected_total_hours > self.plan.total_hours:
            raise ValidationError(f'Adding {self.hours} hours will exceed the total allowed hours '
                                  f'for this plan ({self.plan.total_hours} hours).')

        super().save(*args, **kwargs)
    
    def __str__(self):
        return f'{self.theme} plan item for {self.plan}'


class PlanItemSubtopic(models.Model):
    id = models.UUIDField(default=uuid.uuid4, unique=True, 
                          primary_key=True, editable=False)
    plan_item = models.ForeignKey(PlanItem, on_delete=models.CASCADE, related_name='subtopics')
    name = models.CharField(max_length=255)
    preview = models.TextField()
    content = models.TextField(null=True, blank=True)

    def __str__(self):
        return f'{self.name} subtopic for {self.plan_item}'


class SubtopicQuestion(models.Model):
    subtopic = models.ForeignKey(PlanItemSubtopic, on_delete=models.CASCADE, related_name='questions')
    question = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question
    

class QuestionAnswer(models.Model):
    question = models.ForeignKey(SubtopicQuestion, on_delete=models.CASCADE, related_name='answers')
    content = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.content} ({"Correct" if self.is_correct else "Incorrect"})'


class UserAnswer(models.Model):
    question = models.OneToOneField(SubtopicQuestion, on_delete=models.CASCADE, related_name='user_answer')
    selected_answer = models.ForeignKey(QuestionAnswer, on_delete=models.CASCADE)
    answered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'{self.selected_answer} selected by user for {self.question}'

from rest_framework import serializers
from django.db import transaction

from plan.models import PlanItem, PlanItemSubtopic, Plan, SubtopicQuestion, QuestionAnswer, UserAnswer


class UserAnswerSerializer(serializers.ModelSerializer):
    subtopic = serializers.PrimaryKeyRelatedField(queryset=PlanItemSubtopic.objects.all(), write_only=True)

    class Meta:
        model = UserAnswer
        fields = ['subtopic', 'question', 'selected_answer']
        extra_kwargs = {
            'subtopic': {'write_only': True},
            'question': {'write_only': True}
        }
    
    def validate(self, data):
        subtopic = data.get('subtopic')
        question = data.get('question')
        selected_answer = data.get('selected_answer')

        if subtopic and question not in subtopic.questions.all():
            raise serializers.ValidationError('Question does not belong to the specified subtopic.')

        if selected_answer and selected_answer.question != question:
            raise serializers.ValidationError('Selected answer does not belong to the specified question.')
        
        return data

    def create(self, validated_data):
        question = validated_data['question']
        selected_answer = validated_data['selected_answer']

        UserAnswer.objects.update_or_create(
            question=question,
            defaults={'selected_answer': selected_answer}
        )

        return {
            'question': question.id,
            'correct': selected_answer.is_correct,
            'correct_answers': question.answers.filter(is_correct=True).values_list('id', flat=True)
        }


class QuestionAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionAnswer
        fields = ['id', 'content', 'is_correct']
        read_only_fields = ['id']
        extra_kwargs = {
            'is_correct': {'write_only': True}
        }


class SubtopicQuestionSerializer(serializers.ModelSerializer):
    answers = QuestionAnswerSerializer(many=True)
    user_answer = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SubtopicQuestion
        fields = ['id', 'subtopic', 'question', 'answers', 'user_answer']
        extra_kwargs = {
            'id': {'read_only': True},
            'subtopic': {'write_only': True}
        }
    
    def create(self, validated_data):
        with transaction.atomic():
            answers_data = validated_data.pop('answers', [])
            subtopic_question = SubtopicQuestion.objects.create(**validated_data)

            for answer in answers_data:
                QuestionAnswer.objects.create(question=subtopic_question, **answer)
            
            return subtopic_question

    def get_user_answer(self, obj):
        try:
            user_answer = obj.user_answer
            return user_answer.selected_answer_id
        except UserAnswer.DoesNotExist:
            return None
    
    def to_representation(self, instance):
        representation =  super().to_representation(instance)
        if representation.get('user_answer') is not None:
            return None
        return representation


class PlanItemSubtopicSerializer(serializers.ModelSerializer):
    questions = SubtopicQuestionSerializer(many=True, read_only=True)
    plan = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PlanItemSubtopic
        fields = ['plan', 'id', 'name', 'preview', 'content', 'questions']
        read_only_fields = ['id', 'content', 'questions']

    def get_plan(self, obj):
        return {
            'id': obj.plan_item.plan.id,
            'topic': obj.plan_item.plan.topic
        }
    
    def to_representation(self, instance):
        representation =  super().to_representation(instance)
        representation['questions'] = list(filter(None, representation.get('questions', [])))
        
        return representation


class PlanItemSerializer(serializers.ModelSerializer):
    subtopics = PlanItemSubtopicSerializer(many=True)

    class Meta:
        model = PlanItem
        fields = ['theme', 'hours', 'subtopics']
    
    def create(self, validated_data):
        with transaction.atomic():
            subtopics_data = validated_data.pop('subtopics', [])
            plan_item = PlanItem.objects.create(**validated_data)

            for subtopic in subtopics_data:
                PlanItemSubtopic.objects.create(plan_item=plan_item, **subtopic)
            
            return plan_item


class PlanSerializer(serializers.ModelSerializer):
    items = PlanItemSerializer(many=True)
    sources = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Plan
        fields = ['id', 'chat_session', 'user', 'sources', 'topic', 'total_hours', 'items']
        extra_kwargs = {
            'id': {'read_only': True},
            'user': {'write_only': True}
        }
    
    def create(self, validated_data):
        with transaction.atomic():
            items_data = validated_data.pop('items', [])
            plan = Plan.objects.create(**validated_data)

            for plan_item in items_data:
                plan_item['plan'] = plan
                PlanItemSerializer().create(plan_item)
            
            return plan

    def get_sources(self, obj):
        return [{
            'title': source.get('title'),
            'url': source.get('url')
        } for source in obj.chat_session.sources.values('title', 'url')]

from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from plan.services import get_llama_response, generate_subtopic_content, generate_questions
from plan.serializers import PlanSerializer, PlanItemSubtopicSerializer, SubtopicQuestionSerializer, UserAnswerSerializer
from plan.models import PlanItemSubtopic
from chat_session.models import ChatSession
from account.permissions import IsAuthenticated


class PlanViewSet(ViewSet):
    serializer_class = PlanSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        return self.request.user.plan_set.filter(chat_session__is_active = True)

    def get_object(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)

    def list(self, request, *args, **kwargs):
        """
        Get a list of all the Plans that belong to the current user.
        """
        serializer = self.serializer_class(self.get_queryset(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None, *args, **kwargs):
        """
        Retrieve the Plan instance identified by its primary key.
        """
        plan = self.get_object(pk)
        serializer = self.serializer_class(plan)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def generate(self, request, *args, **kwargs):
        """
        Create a new Plan instance based on a ChatSession.
        """
        chat_session = get_object_or_404(ChatSession, pk=request.data.get('session', ''))
        existing_plan = chat_session.plans.first()

        if existing_plan:
            serializer = self.serializer_class(existing_plan)
            return Response(serializer.data, status=status.HTTP_200_OK)

        try:
            new_plan_data = get_llama_response(chat_session=chat_session, is_json=True)
        except Exception as e:
            chat_session.delete()
            return Response({'details': f'An unexpected error occurred while generating plan: {str(e)}'}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        serializer = self.serializer_class(data={
            'chat_session': chat_session.id,
            'user': request.user.id,
            'topic': new_plan_data.get('topic'),
            'total_hours': new_plan_data.get('total_hours'),
            'items': new_plan_data.get('study_plan')
        })
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SubtopicViewSet(ViewSet):
    queryset = PlanItemSubtopic.objects.select_related('plan_item__plan__chat_session')
    serializer_class = PlanItemSubtopicSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        return self.queryset.filter(plan_item__plan__user = self.request.user, 
                                    plan_item__plan__chat_session__is_active = True)
    
    def get_object(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)

    def retrieve(self, request, pk=None, *args, **kwargs):
        """
        Retrieve a Subtopic instance identified by its primary key.
        """
        subtopic = self.get_object(pk)
        serializer = self.serializer_class(subtopic)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def generate_content(self, request, pk=None, *args, **kwargs):
        """
        Generate content for a subtopic identified by its primary key.
        """
        subtopic = self.get_object(pk)

        if subtopic.content:
            return Response({'data': subtopic.content}, status=status.HTTP_200_OK)

        try:
            subtopic.content = generate_subtopic_content(subtopic.plan_item.plan.chat_session, subtopic.name)
            subtopic.save()
        except Exception as e:
            return Response({'details': f'An unexpected error occurred while generating content: {str(e)}'}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'data': subtopic.content}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def generate_questions(self, request, pk=None, *args, **kwargs):
        """
        Generate questions for a subtopic identified by its primary key.
        """
        subtopic = self.get_object(pk)

        if subtopic.questions.count() >= 20:
            return Response({'details': 'The maximum number of questions (20) has already been generated for this subtopic.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        try:
            questions = generate_questions(subtopic.plan_item.plan.chat_session, subtopic.name)
            questions_data = questions.get('questions', [])
        except Exception as e:
            return Response({'details': f'An unexpected error occurred while generating questions: {str(e)}'}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        serializer = SubtopicQuestionSerializer(data=[{
            'subtopic': subtopic.id,
            **question
        } for question in questions_data], many=True)

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def submit_answers(self, request, pk=None, *args, **kwargs):
        """
        Submit answers for a batch of questions.
        """
        subtopic = self.get_object(pk)
        answers = request.data.get('answers', [])

        if not answers:
            return Response({'details': 'No answers provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not isinstance(answers, list):
            return Response({'details': ('Invalid format for answers field. '
                                         f'Expected a list of answer objects, but got type {type(answers).__name__}.')},
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = UserAnswerSerializer(data=[{
            'subtopic': subtopic.pk,
            **answer_data
        } for answer_data in answers], many=True)

        serializer.is_valid(raise_exception=True)
        result = serializer.save()

        return Response(result, status=status.HTTP_200_OK)

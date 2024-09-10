from django.shortcuts import get_object_or_404
from django.http import StreamingHttpResponse
from django.db import transaction
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action

from account.permissions import IsAuthenticated
from chat_session.services import fetch_sources_parsed, get_system_prompt
from chat_session.models import ChatMessage
from chat_session.serializers import ChatSessionSerializer
from chat_session.services import get_llama_response_stream


class ChatSessionViewSet(ViewSet):
    serializer_class = ChatSessionSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        return self.request.user.chatsession_set.filter(is_active=True)

    def get_object(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)
    
    def retrieve(self, request, pk=None, *args, **kwargs):
        """
        Retrieve a ChatSession instance identified by its primary key.
        """
        chat_session = self.get_object(pk)
        serializer = self.serializer_class(chat_session)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        """
        Get a list of all the ChatSessions that belong to the current user.
        """
        serializer = self.serializer_class(self.get_queryset(), many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        """
        Create a new ChatSession instance.
        """
        user_query = request.data.get('query')
        hours = request.data.get('hours')

        if self.get_queryset().count() >= 5:
            return Response({'details': ('You have reached the maximum allowed limit of 5 plans.')}, 
                            status=status.HTTP_403_FORBIDDEN)

        if not user_query or not hours:
            missing_param = 'query' if not user_query else 'hours'
            return Response({'details': f'The {missing_param} value is required but was not provided.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        if len(user_query) > 120:
            return Response({'details': 'The query length exceeds the allowed limit. Please ensure the query is 120 characters or fewer.'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            hours = int(hours)
            if not (1 <= hours <= 15):
                return Response({'details': f'The hours value must be between 1 and 15.'}, 
                    status=status.HTTP_400_BAD_REQUEST)
        except ValueError as e:
            return Response({'details': 'The hours value must be an integer.'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            sources_data = fetch_sources_parsed(user_query)
            if not sources_data:
                return Response({'details': 'No relevant sources were found for your query. Please refine your theme and try again.'}, 
                status=status.HTTP_400_BAD_REQUEST)
            
            message_data = get_system_prompt(sources_data, hours, user_query)
        except Exception as e:
            return Response({'details': f'An unexpected error occurred while creating ChatSession: {str(e)}'}, 
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        serializer = self.serializer_class(data={
            'user': request.user.id,
            'sources': sources_data,
            'messages': [{'role': 'system', 'content': message_data}]
        })

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None, *args, **kwargs):
        """
        Deactivate a ChatSession instance identified by its primary key.
        """
        chat_session = self.get_object(pk)
        chat_session.is_active = False
        chat_session.save()

        return Response({
            'status': 'ok'
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None, *args, **kwargs):
        """
        Send a message to the Llama and receive a response.
        """
        chat_session = self.get_object(pk)
        message = request.data.get('message')

        if not message:
            return Response({'details': f"The message parameter is required but was not provided."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        if chat_session.messages.filter(role = "user").count() >= 20:
            return Response({'details': ('You have reached the maximum allowed limit of 20 messages per session.')}, 
                            status=status.HTTP_403_FORBIDDEN)

        try:
            with transaction.atomic():
                ChatMessage.objects.create(chat_session=chat_session, role='user', content=message)
                response = StreamingHttpResponse(get_llama_response_stream(chat_session=chat_session))
                response['Content-Type'] = 'text/event-stream'

        except Exception as e:
            return Response({'details': f'An unexpected error occurred while fetching response: {str(e)}'}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return response

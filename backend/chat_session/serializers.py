from rest_framework import serializers
from django.db import transaction

from .models import ChatSession, ChatSource, ChatMessage


class ChatSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSource
        fields = ['title', 'url', 'content']


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['role', 'content']


class ChatSessionSerializer(serializers.ModelSerializer):
    sources = ChatSourceSerializer(many=True, write_only=True)
    messages = ChatMessageSerializer(many=True)

    class Meta:
        model = ChatSession
        fields = ['id', 'user', 'sources', 'messages']
        extra_kwargs = {
            'user': {'write_only': True}
        }
    
    def create(self, validated_data):
        with transaction.atomic():
            sources_data = validated_data.pop('sources', [])
            messages_data = validated_data.pop('messages', [])
            chat_session = ChatSession.objects.create(**validated_data)

            for source in sources_data:
                ChatSource.objects.create(chat_session=chat_session, **source)
            
            for message in messages_data:
                ChatMessage.objects.create(chat_session=chat_session, **message)
        
        return chat_session

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        messages = self.instance.messages.order_by('timestamp').all()

        filtered_messages = []
        for i, message in enumerate(messages):
            if message.role == 'user':
                filtered_messages.append(ChatMessageSerializer(message).data)
                if i + 1 < len(messages):
                    if messages[i + 1].role == 'assistant':
                        filtered_messages.append(ChatMessageSerializer(messages[i + 1]).data)
        
        representation['messages'] = filtered_messages
        return representation

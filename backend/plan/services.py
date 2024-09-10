from typing import Dict, Any

from django.db import transaction

from chat_session.models import ChatSession, ChatMessage
from chat_session.services import get_llama_response


def generate_subtopic_content(chat_session: ChatSession, topic: str) -> Dict[str, Any] | None:
    with transaction.atomic():
        ChatMessage.objects.create(chat_session=chat_session, role='system',
                                content=('[Output only Markdown] '
                                        f'Generate a detailed description for the topic "{topic}", including examples as needed. '
                                        'Ensure the response is well-formatted using Markdown. '
                                        'Do not include any greetings or extra content.'
                                        ))
        
        return get_llama_response(chat_session=chat_session, is_json=False)


def generate_questions(chat_session: ChatSession, topic: str) -> Dict[str, Any] | None:
    with transaction.atomic():
        ChatMessage.objects.create(chat_session=chat_session, role='system',
                                content=('[Output only JSON] '
                                        f'Generate exactly 5 unique questions on the topic "{topic}". '
                                        'Each question must have at least 3 distinct answer options, with only one correct answer. '
                                        'Randomize the position of the correct answer within the list of options. '
                                        'Ensure that all questions are unique and have not been used before. '
                                        'Return the results in pure JSON format as follows: '
                                        '{ "questions": [ { "question": "string representing the question itself", '
                                        '"answers": [ { "content": "string representing the answer", '
                                        '"is_correct": boolean value indicating if the answer is correct (true or false) } ] } ] }. '
                                        'The JSON must be valid with all brackets and parentheses properly closed. '
                                        'Do not include line breaks ("\\n") or extra formatting. Ensure there are exactly 5 questions.'))
        
        return get_llama_response(chat_session=chat_session, is_json=True)

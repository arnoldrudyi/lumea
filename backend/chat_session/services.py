import os
import re
import json
from typing import Dict, Any, Generator, Union

import requests
from fix_busted_json import repair_json
from bs4 import BeautifulSoup

from chat_session.models import ChatSession, ChatMessage


def get_llama_response_stream(chat_session: ChatSession) -> Generator[str, None, None]:
    url = f'{os.environ["HELICONE_URL"]}/v1/chat/completions'
    messages = chat_session.messages.all()
    payload = {
        'model': 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        'stream': True,
        'messages': [{
            'role': message.role,
            'content': message.content
        } for message in messages]
    }
    headers = {
        'Content-Type': 'application/json',
        'Helicone-Auth': f'Bearer {os.environ["HELICONE_API_KEY"]}',
        'Authorization': f'Bearer {os.environ["TOGETHER_API_KEY"]}'
    }

    response = requests.post(url, headers=headers, json=payload, stream=True)
    if response.status_code == 200:
        accumulated_data = []

        for line in response.iter_lines():
            if line:
                decoded_line = line.decode('utf-8')

                if decoded_line.startswith('data: '):
                    decoded_line = decoded_line[len('data: '):]

                try:
                    data = json.loads(decoded_line).get('choices', [])[0].get('text')
                    accumulated_data.append(data)

                    processed_data = data.replace('\n', '\\n')
                    yield f'data: {processed_data}\n\n'

                except json.JSONDecodeError:
                    break

        response_content = ''.join(accumulated_data)
        ChatMessage.objects.create(chat_session=chat_session, role='assistant', content=response_content)
        return

def get_llama_response(chat_session: ChatSession, is_json: bool) -> Union[Dict[str, Any], None]:
    url = f'{os.environ["HELICONE_URL"]}/v1/chat/completions'
    messages = chat_session.messages.all()
    payload = {
        'model': 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        'stream': False,
        'messages': [{
            'role': message.role,
            'content': message.content
        } for message in messages]
    }
    headers = {
        'Content-Type': 'application/json',
        'Helicone-Auth': f'Bearer {os.environ["HELICONE_API_KEY"]}',
        'Authorization': f'Bearer {os.environ["TOGETHER_API_KEY"]}'
    }

    response = requests.post(url, headers=headers, json=payload, stream=False)
    if response.status_code == 200:
        response_json = response.json()
        response_content = response_json.get('choices', [])[0].get('message', {}).get('content', '')

        if is_json:
            repaired_json = repair_json(response_content)
            response_content = json.loads(repaired_json)

        ChatMessage.objects.create(chat_session=chat_session, role='assistant', content=response_content)
        return response_content
    
    return None


def fetch_sources(query: str) -> Dict[str, str]:
    url = f'{os.environ["SERPER_URL"]}/search'

    payload = json.dumps({
        'q': f'what is {query} -site:youtube.com'
    })
    headers = {
        'X-API-KEY': os.environ['SERPER_API_KEY'],
        'Content-Type': 'application/json'
    }

    response = requests.post(url, headers=headers, data=payload)

    if response.status_code == 200:
        return response.json()['organic'][:5]
    return None


def filter_text(text_content: str) -> str:
    non_empty_lines = [line for line in text_content.splitlines() if line.strip()]
    filtered_text = '\n'.join(non_empty_lines)
    filtered_text = re.sub(r'(\n){4,}', '\n\n\n', filtered_text)
    filtered_text = re.sub(r'\n\n', ' ', filtered_text)
    filtered_text = re.sub(r' {3,}', '  ', filtered_text)
    filtered_text = filtered_text.replace('\t', '')
    filtered_text = re.sub(r'\n+(\s*\n)*', '\n', filtered_text)
    filtered_text = filtered_text.replace('"', "'")

    return filtered_text[:100000]


def fetch_sources_parsed(query: str) -> Dict[str, str]:
    sources = fetch_sources(query)
    sources_data = []

    if sources:
        for source in sources:
            response = requests.get(source.get('link'))
            if response.status_code == 200:
                text_content = BeautifulSoup(response.text, 'html.parser').get_text()
                filtered_text = filter_text(text_content)

                sources_data.append({
                    'title': source.get('title'),
                    'url': source.get('link'),
                    'content': filtered_text
                })
        
        if sources_data:
            return sources_data
            
    return None


def get_system_prompt(sources_data: Dict[str, str], hours: int, topic: str) -> str:
    prompt_base = (
        '[no prose] [Output only JSON] '
        'You are tasked with creating a comprehensive study plan for a specified topic. '
        'Based on the given topic and the number of hours the user wants to dedicate to studying, '
        'your task is to create a detailed study plan that covers the general theme. '
        'Divide the total number of hours among various subthemes and provide a thorough explanation '
        'for each subtheme using the information provided. You cannot add any line breaks ("\\n") or '
        'additional formatting to the response; it must return pure JSON without any formatting. '
        'All names and topics should start from the uppercase letter. Ensure your response is in JSON format, structured as follows: '
        '{ "topic": "string representing the topic", "total_hours": "integer representing the total number of hours", '
        '"study_plan": [ { "theme": "string representing a specific theme", "hours": "integer representing the hours '
        'allocated to this theme", "subtopics": [ { "name": "string representing the name of the subtopic", '
        '"preview": "string providing a detailed explanation of the subtopic using the teaching information" } ] } ] }. '
        'You are not allowed to add any examples into the preview field of a subtopics object. '
        'It is crucial that you adhere strictly to these instructions as they are essential for my career development.'
    )

    teaching_info = '\n\n<teaching_info>\n'
    for index, source in enumerate(sources_data):
        teaching_info += f"## Webpage #{index}: \n{source.get('content')}\n\n"
    
    teaching_info += '</teaching_info>'

    prompt_details = f'The number of hours to study this theme is specified as: <hours>{hours}</hours>.\n\n'
    prompt_details += f'The topic to study is: {topic}'

    return f'{prompt_base}{teaching_info}{prompt_details}'.replace('"', "'")

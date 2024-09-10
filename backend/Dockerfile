FROM python:3.11.9-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=100 \
    PROJECT_DIR="/lumea-backend"

RUN mkdir -p ${PROJECT_DIR}
WORKDIR ${PROJECT_DIR}

COPY ./requirements.txt ./
RUN pip install --upgrade pip setuptools && \
    pip install -r requirements.txt

COPY start.sh ./start
RUN chmod +x ./start
COPY . .

CMD ["./start"]

FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
COPY app.py .
ENV APP_ENV=production
ENV PYTHONUNBUFFERED=1
EXPOSE 5000
RUN useradd -u 10001 app
USER app
CMD ["python", "app.py"]

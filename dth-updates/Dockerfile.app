FROM python:3.11-slim
WORKDIR /app
RUN pip install fastapi uvicorn[standard] httpx
COPY app_main.py /app/main.py
# Expect HTML file to be mounted or copied next to /app/main.py
EXPOSE 5000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]

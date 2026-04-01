FROM python:3.13-alpine

WORKDIR /app

# Install dependencies first — Docker caches this layer
# so if requirements.txt doesn't change, pip install is skipped
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

CMD ["python", "seeder.py"]
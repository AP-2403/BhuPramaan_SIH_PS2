FROM python:3.11-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-hin \
    tesseract-ocr-eng \
    tesseract-ocr-mar \
    tesseract-ocr-guj \
    tesseract-ocr-ben \
    tesseract-ocr-pan \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    fonts-noto \
    fonts-noto-cjk \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir uv && \
    uv pip install --system --no-cache -e ".[all]"

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/data/fonts /app/data/synthetic /app/data/ground_truth /app/data/master \
             /app/data/seeds /app/data/raw /app/data/demo

# Non-root user for security
RUN useradd -m -u 1000 bhulekh && chown -R bhulekh:bhulekh /app
USER bhulekh

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

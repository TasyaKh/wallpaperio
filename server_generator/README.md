# Image Generator Service

A FastAPI service that uses gpt4free to generate images from text prompts.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the service:
```bash
python main.py
```

The service will start on port 5000 by default. You can change this by setting the `PORT` environment variable.

## API Usage

### Generate Image

**Endpoint:** `POST /generate`

**Request Body:**
```json
{
  "prompt": "a beautiful sunset over mountains",
  "negative_prompt": "blurry, low quality",
  "width": 512,
  "height": 512,
  "steps": 20,
  "cfg_scale": 7.0
}
```

**Response:**
```json
{
  "images": ["https://example.com/generated-image.jpg"],
  "error": null
}
```

## Environment Variables

- `PORT`: The port to run the service on (default: 5000) 
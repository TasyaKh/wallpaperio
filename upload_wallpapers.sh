#!/bin/bash

# Base URL for the API
BASE_URL="http://localhost:3000"

# Authorization token - REPLACE WITH YOUR ACTUAL TOKEN
AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFraXRhc3BhbUBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3NDk4MTg1OTEsImlhdCI6MTc0OTczMjE5MX0.ZLsxExhgGiI34pSBgvZM1bPJFYYIeZWNOUvz5kJAavE"

# Get all image files from the static/images directory
IMAGE_NAMES=($(ls server_generator/static/images/*.{jpg,jpeg} 2>/dev/null))

# Loop through each image name and send a POST request
for IMAGE_PATH in "${IMAGE_NAMES[@]}"; do
    # Extract just the filename from the full path
    IMAGE_NAME=$(basename "$IMAGE_PATH")
    IMAGE_URL="static/images/${IMAGE_NAME}"
    
    # Construct the JSON payload
    JSON_PAYLOAD=$(cat <<EOF
{
    "image_url": "${IMAGE_URL}",
    "title": "Generated Wallpaper - ${IMAGE_NAME}",
    "category": "generated",
    "tags": ["generated", "script"]
}
EOF
)

    echo "Uploading ${IMAGE_NAME}..."
    curl -X POST "${BASE_URL}/api/wallpapers" \
         -H "Content-Type: application/json" \
         -H "Authorization: Bearer ${AUTH_TOKEN}" \
         -d "${JSON_PAYLOAD}"
    echo -e "\n" # Add a newline for better readability
done

echo "All wallpapers processed." 
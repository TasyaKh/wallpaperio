#!/bin/bash

# Base URL for the API
BASE_URL="http://localhost:3000"

# Authorization token - REPLACE WITH YOUR ACTUAL TOKEN
AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFraXRhc3BhbUBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3NDk3MzIwNTMsImlhdCI6MTc0OTY0NTY1M30.cNg21YHdKFk3DIyYzR8Niix2jqFxswUv6dxhffB5K2g"

# Array of image file names
IMAGE_NAMES=(
    "0f4b4fc7-4ed4-46c3-be51-48a3588d5ff3.jpg"
    "0f189535-a24e-4fc2-8f62-65fea7c7bc19.jpg"
    "1_1749391534.jpg"
    "1_1749391775.jpg"
    "1_1749391637.jpg"
    "1_1749391886.jpg"
    "1_1749396522.jpg"
    "1_1749396604.jpg"
    "1_1749396741.jpg"
    "1_1749396554.jpg"
    "1_1749396690.jpg"
    "1_1749400295.jpg"
    "01dee8df-3673-4e03-91be-759afff15262.jpg"
    "1e7c9d7d-700c-46e9-8ca6-6829e6c75bfd.jpg"
    "02bcbb8b-fe9e-49d0-96d1-47b4f733f819.jpeg"
    "2bd99ee2-df69-4f84-9713-78d5c53b5946.jpg"
    "2e673405-e3cb-4d36-b3f9-a4030f2544cb.jpg"
    "5c8e4a61-8ad2-4f40-ab3e-18f056622f41.jpg"
    "6b064de9-0109-4112-aca5-af16bc1fa672.jpg"
    "6c6602f5-4c4f-41b3-b90f-ecacd0a80dbb.jpg"
    "43c4df2b-e9ff-49f7-a8bb-09aba7852624.jpg"
    "42ca73b4-506f-4449-859f-242f7a9a873e.jpg"
    "42c3c510-9910-4d7d-8b68-92004befd8e9.jpg"
    "34c0e8bf-4c29-478b-9f4e-0559d5784833.jpg"
    "25b4777a-5de1-4d21-a86d-49b409d7e127.jpeg"
    "59f86751-dcbb-4420-bba1-7607a37d9f0a.jpg"
    "73df9aad-ca5d-40c3-ada5-af7a8ae728b9.jpg"
    "78f62b1b-0cce-4f25-acdf-d147074b42ff.jpg"
    "142dba5f-0fe9-4cf7-9de0-48a4818b6e2f.jpeg"
    "1709c15b-5d3c-4795-8fec-d507ab9b4ade.jpg"
    "487fa426-b913-4f70-8c29-0b97492f206c.jpg"
    "301ca852-1a6e-4456-8008-09d03f21ee67.jpeg"
    "846de74d-3ef2-453c-ac7d-b3499c77c487.jpg"
    "792a1b1b-f5dc-4042-bbc4-03e4c6294931.jpg"
    "522b77bc-418d-4452-8792-399dad3cb984.jpg"
)

# Loop through each image name and send a POST request
for IMAGE_NAME in "${IMAGE_NAMES[@]}"; do
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
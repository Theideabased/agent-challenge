r
#!/bin/bash

##############################################
# Aeterna Video Generation Script
# Usage: ./generate_video.sh [json_file]
##############################################

# Default to example_motivation.json if no argument provided
JSON_FILE="${1:-example_motivation.json}"

# Check if JSON file exists
if [ ! -f "$JSON_FILE" ]; then
    echo "❌ Error: JSON file '$JSON_FILE' not found!"
    echo "Usage: ./generate_video.sh [json_file]"
    exit 1
fi

echo "🎬 Generating video using: $JSON_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Send POST request to API
RESPONSE=$(curl -s -X POST "http://127.0.0.1:8080/api/v1/videos" \
  -H "Content-Type: application/json" \
  -d @"$JSON_FILE")

# Check if request was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to API server!"
    echo "Make sure the server is running: ./start_api.sh"
    exit 1
fi

# Extract task_id from response
TASK_ID=$(echo "$RESPONSE" | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TASK_ID" ]; then
    echo "❌ Error: Could not create video task"
    echo "Response: $RESPONSE"
    exit 1
fi

echo "✅ Task created successfully!"
echo "📋 Task ID: $TASK_ID"
echo ""
echo "🔄 Monitoring task progress..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Poll task status
while true; do
    STATUS_RESPONSE=$(curl -s "http://127.0.0.1:8080/api/v1/tasks/$TASK_ID")
    
    STATE=$(echo "$STATUS_RESPONSE" | grep -o '"state":"[^"]*"' | cut -d'"' -f4)
    PROGRESS=$(echo "$STATUS_RESPONSE" | grep -o '"progress":[0-9]*' | cut -d':' -f2)
    
    if [ -z "$PROGRESS" ]; then
        PROGRESS=0
    fi
    
    echo -ne "\r⏳ Status: $STATE | Progress: $PROGRESS%                    "
    
    # Check if completed
    if [ "$STATE" = "complete" ]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🎉 Video generated successfully!"
        
        # Extract video URL
        VIDEO_URL=$(echo "$STATUS_RESPONSE" | grep -o '"videos":\["[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$VIDEO_URL" ]; then
            echo "📹 Video URL: $VIDEO_URL"
            echo ""
            echo "💡 Download command:"
            echo "   wget '$VIDEO_URL' -O my_video.mp4"
        fi
        
        # Show full task details
        echo ""
        echo "📊 Full task details:"
        echo "$STATUS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STATUS_RESPONSE"
        break
    fi
    
    # Check if failed
    if [ "$STATE" = "failed" ]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "❌ Video generation failed!"
        echo "Response: $STATUS_RESPONSE"
        exit 1
    fi
    
    sleep 3
done

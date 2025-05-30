
PROJECT_URL="fororflyhxeircqexslh.supabase.co"
API_KEY="YOUR_SERVICE_ROLE_KEY"   
SRC_BUCKET="user-images"
DST_BUCKET="user-images"


command -v jq >/dev/null 2>&1 || { echo "Please install jq"; exit 1; }

# 1) Get every “folder” name (in this case, every top-level key)
all_json=$(
  curl -s -X POST "https://$PROJECT_URL/storage/v1/object/list/$SRC_BUCKET" \
    -H "apikey: $API_KEY" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"prefix":"","limit":1000}'
)

echo "▶️  Raw list of keys (treating each as a folder name):"
echo "$all_json" | jq -r '.[].name'

# 2) Iterate each key as if it were a folder prefix
echo
echo "➡️  Copying contents under each “folder”…"
echo "$all_json" \
  | jq -r '.[].name' \
  | sort -u \
  | while IFS= read -r folder; do
      echo "📁 Folder: $folder/"
      folder_json=$(
        curl -s -X POST "https://$PROJECT_URL/storage/v1/object/list/$SRC_BUCKET" \
          -H "apikey: $API_KEY" \
          -H "Authorization: Bearer $API_KEY" \
          -H "Content-Type: application/json" \
          -d "{\"prefix\":\"$folder/\",\"limit\":1000}"
      )

      # stream nested names and copy
      echo "$folder_json" \
        | jq -r '.[].name' \
        | while IFS= read -r name; do
            # build the full object key (including the folder)
            full_key="$folder/$name"
            echo "  Copying → $full_key"
            curl -s -X POST "https://$PROJECT_URL/storage/v1/object/copy" \
              -H "apikey: $API_KEY" \
              -H "Authorization: Bearer $API_KEY" \
              -H "Content-Type: application/json" \
              -d '{
                "bucketId":"'"$SRC_BUCKET"'",
                "sourceKey":"'"$full_key"'",
                "destinationBucket":"'"$DST_BUCKET"'",
                "destinationKey":"'"$full_key"'"
              }' \
            | jq -c .
          done
    done

echo
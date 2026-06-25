import os
from supabase import create_client

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

result = (
    supabase
    .table("qualitative_responses")
    .select("*")
    .limit(10)
    .execute()
)

print("NUMBER OF ROWS:", len(result.data))

for i, row in enumerate(result.data):
    print("\n====================")
    print("ROW INDEX:", i)
    print("ROW ID:", row.get("id"))
    print("DOMAIN:", row.get("domain"))
    print("SUBTOPIC lowercase:", row.get("subtopic"))
    print("SUBTOPIC capital:", row.get("Subtopic"))
    print("ANSWER:", row.get("answer"))
    print("====================")
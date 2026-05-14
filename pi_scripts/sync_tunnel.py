import time
import requests
from supabase import create_client

# --- CONFIGURATION AUTOMATIQUE ---
SUPABASE_URL = "https://ndhlesqhhsxvrpcfbbno.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kaGxlc3FoaHN4dnJwY2ZiYm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMjM2MTEsImV4cCI6MjA4Nzc5OTYxMX0.ZZXK3UPqv0c_I6kufB4j6DE65eX2Pd5xQFGtHtLO1Ro"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def update_supabase_url(new_url):
    try:
        supabase.table("app_settings").upsert({
            "key": "camera_url",
            "value": new_url
        }).execute()
        print(f"✅ URL envoyée au Dashboard : {new_url}")
    except Exception as e:
        print(f"❌ Erreur de mise à jour : {e}")

def get_cloudflare_url():
    try:
        response = requests.get("http://localhost:20242/metrics")
        for line in response.text.split('\n'):
            if 'cloudflared_tunnel_user_hostnames_counts{user_hostname="' in line:
                url = line.split('"')[1]
                return f"https://{url}"
    except:
        return None

print("🚀 AMEN_IA: Synchroniseur de Tunnel Actif...")
last_url = ""

while True:
    current_url = get_cloudflare_url()
    if current_url and current_url != last_url:
        update_supabase_url(current_url)
        last_url = current_url
    time.sleep(5)

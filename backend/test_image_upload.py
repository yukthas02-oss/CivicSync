import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'civicsync.settings')
django.setup()

from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from api.models import ChallengeCategory

User = get_user_model()
user = User.objects.get(username='arun_kumar')
category = ChallengeCategory.objects.first()

client = APIClient()
client.force_authenticate(user=user)

# A minimal valid 1x1 JPEG byte stream
tiny_jpeg = (
    b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00'
    b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c'
    b'\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c'
    b'\x1c $.\' \",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01'
    b'\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01'
    b'\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08'
    b'\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9'
)

test_image = SimpleUploadedFile(
    'evidence_pothole.jpg',
    tiny_jpeg,
    content_type='image/jpeg'
)

response = client.post(
    '/api/challenges/',
    {
        'title': 'Flooded Bus Stand Storm Drain with Photographic Evidence',
        'description': 'The storm drain opposite the municipal bus stand is choked with silt causing knee-deep water-logging during every shower.',
        'category': category.id,
        'city': 'Bengaluru',
        'location_description': 'Main Bus Terminal Bay 4',
        'estimated_severity': 'HIGH',
        'image': test_image
    },
    format='multipart'
)

print(f"POST Status: {response.status_code}")
print(f"Challenge Code: {response.data.get('challenge_code')}")
print(f"Image URL: {response.data.get('image')}")
print(f"Status: {response.data.get('status')}")
print(f"AI Analysis Status: {response.data.get('ai_analysis', {}).get('status')}")

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from api.models import (
    UserRole, ChallengeCategory, Challenge, ChallengeStatus,
    ChallengeSeverity, ChallengeAnalysis, SolutionProposal,
    UniversityProfile, Department, Expertise
)
from ai_service.analyzer import analyze_challenge
from ai_service.similarity import calculate_similarity_with_corpus
from ai_service.recommender import match_challenge_with_institutions

User = get_user_model()

class CivicSyncBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin_user = User.objects.create_user(
            username='test_admin',
            email='admin@test.org',
            password='Password123!',
            role=UserRole.ADMIN,
            is_staff=True
        )

        # Citizen user
        self.citizen_user = User.objects.create_user(
            username='test_citizen',
            email='citizen@test.org',
            password='Password123!',
            role=UserRole.CITIZEN
        )

        # University user
        self.uni_user = User.objects.create_user(
            username='test_uni',
            email='uni@test.edu',
            password='Password123!',
            role=UserRole.UNIVERSITY,
            organization_name='National Institute of Technology'
        )
        self.uni_profile = UniversityProfile.objects.create(
            user=self.uni_user,
            institution_name='National Institute of Technology'
        )
        self.dept = Department.objects.create(
            university=self.uni_profile,
            name='Department of Environmental Engineering'
        )
        self.exp = Expertise.objects.create(name='Groundwater Recharge')
        self.dept.expertises.add(self.exp)

        # Category
        self.category = ChallengeCategory.objects.create(
            name='Water & Sanitation',
            slug='water-sanitation',
            description='Water resources and drainage'
        )

    def test_user_registration(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'new_citizen',
            'email': 'new@citizen.org',
            'password': 'SecurePassword123!',
            'password2': 'SecurePassword123!',
            'role': 'CITIZEN'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='new_citizen').exists())

    def test_jwt_login(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'test_citizen',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['role'], 'CITIZEN')

    def test_challenge_submission_and_ai_trigger(self):
        self.client.force_authenticate(user=self.citizen_user)
        response = self.client.post('/api/challenges/', {
            'title': 'Severe drinking water contamination in ward 12',
            'description': 'The borewell extracted water has high toxic fluoride and foul sewage odor affecting hundreds of homes.',
            'category': self.category.id,
            'city': 'Bengaluru',
            'estimated_severity': 'HIGH'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'PENDING')
        
        # Verify AI analysis was generated
        challenge_id = response.data['id']
        analysis = ChallengeAnalysis.objects.filter(challenge_id=challenge_id).first()
        self.assertIsNotNone(analysis)
        self.assertEqual(analysis.status, 'COMPLETED')
        self.assertTrue(len(analysis.keywords) > 0)

    def test_admin_verification(self):
        # Create pending challenge
        challenge = Challenge.objects.create(
            title='Open stormwater trench near school',
            description='Uncovered drain posing safety risk during heavy rains.',
            category=self.category,
            city='Chennai',
            reported_by=self.citizen_user,
            status=ChallengeStatus.PENDING
        )

        # Try to verify as citizen (should fail)
        self.client.force_authenticate(user=self.citizen_user)
        res = self.client.post(f'/api/challenges/{challenge.id}/verify/', {
            'status': 'VERIFIED',
            'admin_notes': 'Reviewed and confirmed.'
        })
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Verify as admin (should succeed)
        self.client.force_authenticate(user=self.admin_user)
        res = self.client.post(f'/api/challenges/{challenge.id}/verify/', {
            'status': 'VERIFIED',
            'admin_notes': 'Verified on-ground report.'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        challenge.refresh_from_db()
        self.assertEqual(challenge.status, 'VERIFIED')

    def test_semantic_similarity_duplicate_detection(self):
        c1 = {
            'id': 1,
            'challenge_code': 'CS-001',
            'title': 'Severe groundwater depletion and borewell failure',
            'description': 'Borewells are drying up and drinking water scarcity is rising.',
            'city': 'Bengaluru',
            'category_name': 'Water & Sanitation',
            'status': 'VERIFIED'
        }
        result = calculate_similarity_with_corpus(
            query_title='Depleting groundwater and dried borewells',
            query_description='Water crisis due to lack of groundwater recharge and borewell dry up.',
            candidates=[c1],
            threshold=0.20
        )
        self.assertIn('matches', result)
        self.assertTrue(len(result['matches']) > 0)
        self.assertGreaterEqual(result['matches'][0]['similarity_score'], 20.0)

    def test_university_recommendations(self):
        uni_data = [{
            'id': self.uni_profile.id,
            'institution_name': 'National Institute of Technology',
            'campus_location': 'Surathkal',
            'departments': [{
                'id': self.dept.id,
                'name': 'Department of Environmental Engineering',
                'expertises': ['Groundwater Recharge', 'Water Treatment']
            }]
        }]
        matches = match_challenge_with_institutions(
            challenge_title='Groundwater recharge and injection wells',
            challenge_description='Need groundwater restoration techniques for drying wells.',
            category_name='Water & Sanitation',
            keywords=['Water', 'Recharge', 'Groundwater'],
            universities=uni_data
        )
        self.assertTrue(len(matches) > 0)
        self.assertEqual(matches[0]['university_id'], self.uni_profile.id)
        self.assertGreater(matches[0]['match_score'], 50)

    def test_platform_stats_endpoint(self):
        response = self.client.get('/api/stats/platform/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_challenges', response.data)
        self.assertIn('verified_challenges', response.data)
        self.assertIn('status_distribution', response.data)

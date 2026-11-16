from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import (
    UserRole, CitizenProfile, UniversityProfile, Department,
    IndustryPartnerProfile, Expertise, ChallengeCategory,
    Challenge, ChallengeAnalysis, ChallengeFollow, ChallengeInterest,
    SolutionProposal, ProjectMilestone, ProgressUpdate, Comment,
    ActivityLog
)

User = get_user_model()

class DepartmentSerializer(serializers.ModelSerializer):
    expertises = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )

    class Meta:
        model = Department
        fields = ['id', 'name', 'head_of_department', 'description', 'expertises']


class UniversityProfileSerializer(serializers.ModelSerializer):
    departments = DepartmentSerializer(many=True, read_only=True)
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = UniversityProfile
        fields = ['id', 'user', 'username', 'institution_name', 'campus_location', 'website', 'accreditation', 'contact_email', 'departments']


class IndustryPartnerProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = IndustryPartnerProfile
        fields = ['id', 'user', 'username', 'company_name', 'industry_sector', 'website', 'csr_focus_areas', 'mentorship_available', 'funding_available']


class CitizenProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = CitizenProfile
        fields = ['id', 'user', 'username', 'city', 'state', 'reputation_score']


class UserSerializer(serializers.ModelSerializer):
    citizen_profile = CitizenProfileSerializer(read_only=True)
    university_profile = UniversityProfileSerializer(read_only=True)
    industry_profile = IndustryPartnerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'organization_name', 'phone_number', 'bio', 'avatar', 'citizen_profile', 'university_profile', 'industry_profile', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.CITIZEN)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'role', 'organization_name', 'phone_number']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        role = validated_data.get('role', UserRole.CITIZEN)
        organization_name = validated_data.get('organization_name', '')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=role,
            organization_name=organization_name,
            phone_number=validated_data.get('phone_number', '')
        )

        # Automatically create the respective role profile
        if role == UserRole.CITIZEN:
            CitizenProfile.objects.create(user=user)
        elif role == UserRole.UNIVERSITY:
            UniversityProfile.objects.create(
                user=user,
                institution_name=organization_name or f"{user.username.title()} University",
                contact_email=user.email
            )
        elif role == UserRole.INDUSTRY:
            IndustryPartnerProfile.objects.create(
                user=user,
                company_name=organization_name or f"{user.username.title()} Solutions"
            )

        return user


class ChallengeCategorySerializer(serializers.ModelSerializer):
    challenge_count = serializers.SerializerMethodField()

    class Meta:
        model = ChallengeCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'challenge_count']

    def get_challenge_count(self, obj):
        return obj.challenges.count()


class ChallengeAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeAnalysis
        fields = [
            'id', 'status', 'summary', 'suggested_category', 'extracted_location',
            'main_problem', 'suggested_outcomes', 'suggested_priority',
            'keywords', 'possible_stakeholders', 'measurable_indicators',
            'model_source', 'created_at'
        ]


class ProjectMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMilestone
        fields = ['id', 'proposal', 'title', 'description', 'target_date', 'is_completed', 'completion_date', 'order']


class ProgressUpdateSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    author_org = serializers.ReadOnlyField(source='author.organization_name')

    class Meta:
        model = ProgressUpdate
        fields = ['id', 'proposal', 'author', 'author_name', 'author_org', 'title', 'content', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class SolutionProposalSerializer(serializers.ModelSerializer):
    proposer_name = serializers.ReadOnlyField(source='proposed_by.username')
    proposer_org = serializers.ReadOnlyField(source='proposed_by.organization_name')
    milestones = ProjectMilestoneSerializer(many=True, read_only=True)
    progress_updates = ProgressUpdateSerializer(many=True, read_only=True)
    challenge_title = serializers.ReadOnlyField(source='challenge.title')
    challenge_code = serializers.ReadOnlyField(source='challenge.challenge_code')

    class Meta:
        model = SolutionProposal
        fields = [
            'id', 'challenge', 'challenge_title', 'challenge_code', 'proposed_by',
            'proposer_name', 'proposer_org', 'title', 'problem_understanding',
            'proposed_solution', 'technical_approach', 'expected_impact',
            'estimated_duration', 'required_resources', 'success_indicators',
            'status', 'admin_review_comments', 'milestones', 'progress_updates',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'proposed_by', 'created_at', 'updated_at']


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    author_role = serializers.ReadOnlyField(source='author.role')
    author_org = serializers.ReadOnlyField(source='author.organization_name')

    class Meta:
        model = Comment
        fields = ['id', 'challenge', 'author', 'author_name', 'author_role', 'author_org', 'content', 'is_flagged', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class ChallengeInterestSerializer(serializers.ModelSerializer):
    organization_name = serializers.ReadOnlyField(source='user.organization_name')
    username = serializers.ReadOnlyField(source='user.username')
    user_role = serializers.ReadOnlyField(source='user.role')

    class Meta:
        model = ChallengeInterest
        fields = ['id', 'challenge', 'user', 'username', 'organization_name', 'user_role', 'interest_type', 'note', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class ChallengeListSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_icon = serializers.ReadOnlyField(source='category.icon')
    reported_by_name = serializers.ReadOnlyField(source='reported_by.username')
    followers_count = serializers.SerializerMethodField()
    proposals_count = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            'id', 'challenge_code', 'title', 'description', 'category', 'category_name',
            'category_icon', 'city', 'location_description', 'estimated_severity',
            'status', 'image', 'views_count', 'reported_by_name', 'followers_count',
            'proposals_count', 'created_at'
        ]

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_proposals_count(self, obj):
        return obj.proposals.count()


class ChallengeDetailSerializer(serializers.ModelSerializer):
    category = ChallengeCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ChallengeCategory.objects.all(), source='category', write_only=True, required=False
    )
    reported_by_name = serializers.ReadOnlyField(source='reported_by.username')
    ai_analysis = ChallengeAnalysisSerializer(read_only=True)
    proposals = SolutionProposalSerializer(many=True, read_only=True)
    interested_parties = ChallengeInterestSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    followers_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            'id', 'challenge_code', 'title', 'description', 'category', 'category_id',
            'city', 'location_description', 'affected_community', 'estimated_severity',
            'desired_outcome', 'additional_context', 'status', 'reported_by',
            'reported_by_name', 'image', 'views_count', 'admin_notes',
            'ai_analysis', 'proposals', 'interested_parties', 'comments',
            'followers_count', 'is_following', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'challenge_code', 'reported_by', 'views_count', 'created_at', 'updated_at']

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.followers.filter(user=request.user).exists()
        return False

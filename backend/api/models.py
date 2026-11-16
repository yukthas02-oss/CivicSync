import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify

class UserRole(models.TextChoices):
    CITIZEN = 'CITIZEN', 'Citizen'
    ADMIN = 'ADMIN', 'Administrator'
    UNIVERSITY = 'UNIVERSITY', 'University'
    INDUSTRY = 'INDUSTRY', 'Industry Partner'

class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CITIZEN
    )
    phone_number = models.CharField(max_length=20, blank=True, default='')
    organization_name = models.CharField(max_length=255, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_citizen(self):
        return self.role == UserRole.CITIZEN

    def is_admin_role(self):
        return self.role == UserRole.ADMIN or self.is_superuser

    def is_university(self):
        return self.role == UserRole.UNIVERSITY

    def is_industry(self):
        return self.role == UserRole.INDUSTRY

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class CitizenProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='citizen_profile')
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    reputation_score = models.IntegerField(default=10)

    def __str__(self):
        return f"Citizen: {self.user.username}"


class UniversityProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='university_profile')
    institution_name = models.CharField(max_length=255)
    campus_location = models.CharField(max_length=255, blank=True, default='')
    website = models.URLField(blank=True, default='')
    accreditation = models.CharField(max_length=100, blank=True, default='NAAC A++ / NIRF')
    contact_email = models.EmailField(blank=True, default='')
    profile_complete = models.BooleanField(default=True)

    def __str__(self):
        return self.institution_name or self.user.username


class Department(models.Model):
    university = models.ForeignKey(UniversityProfile, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=200)
    head_of_department = models.CharField(max_length=150, blank=True, default='')
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.name} - {self.university.institution_name}"


class IndustryPartnerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='industry_profile')
    company_name = models.CharField(max_length=255)
    industry_sector = models.CharField(max_length=150, blank=True, default='Technology / Sustainability')
    website = models.URLField(blank=True, default='')
    csr_focus_areas = models.CharField(max_length=255, blank=True, default='')
    mentorship_available = models.BooleanField(default=True)
    funding_available = models.BooleanField(default=False)

    def __str__(self):
        return self.company_name or self.user.username


class Expertise(models.Model):
    name = models.CharField(max_length=120, unique=True)
    category_tag = models.CharField(max_length=100, blank=True, default='General')
    departments = models.ManyToManyField(Department, related_name='expertises', blank=True)
    industry_partners = models.ManyToManyField(IndustryPartnerProfile, related_name='expertises', blank=True)

    def __str__(self):
        return self.name


class ChallengeCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=50, default='HelpCircle')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Challenge Categories'
        ordering = ['order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ChallengeStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Review'
    VERIFIED = 'VERIFIED', 'Verified'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    RESOLVED = 'RESOLVED', 'Resolved'
    REJECTED = 'REJECTED', 'Rejected'


class ChallengeSeverity(models.TextChoices):
    LOW = 'LOW', 'Low'
    MEDIUM = 'MEDIUM', 'Medium'
    HIGH = 'HIGH', 'High'
    CRITICAL = 'CRITICAL', 'Critical / Urgent'


class Challenge(models.Model):
    challenge_code = models.CharField(max_length=20, unique=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(ChallengeCategory, on_delete=models.SET_NULL, null=True, related_name='challenges')
    city = models.CharField(max_length=120)
    location_description = models.CharField(max_length=255, blank=True, default='')
    affected_community = models.CharField(max_length=255, blank=True, default='')
    estimated_severity = models.CharField(
        max_length=20,
        choices=ChallengeSeverity.choices,
        default=ChallengeSeverity.MEDIUM
    )
    desired_outcome = models.TextField(blank=True, default='')
    additional_context = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=20,
        choices=ChallengeStatus.choices,
        default=ChallengeStatus.PENDING
    )
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_challenges')
    image = models.ImageField(upload_to='challenge_images/', null=True, blank=True)
    views_count = models.PositiveIntegerField(default=0)
    admin_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.challenge_code:
            random_suffix = uuid.uuid4().hex[:6].upper()
            self.challenge_code = f"CS-{random_suffix}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.challenge_code}] {self.title}"


class AnalysisStatus(models.TextChoices):
    PENDING = 'PENDING', 'Analysis Pending'
    COMPLETED = 'COMPLETED', 'Analysis Completed'
    FAILED = 'FAILED', 'Analysis Failed'


class ChallengeAnalysis(models.Model):
    challenge = models.OneToOneField(Challenge, on_delete=models.CASCADE, related_name='ai_analysis')
    status = models.CharField(
        max_length=20,
        choices=AnalysisStatus.choices,
        default=AnalysisStatus.PENDING
    )
    summary = models.TextField(blank=True, default='')
    suggested_category = models.CharField(max_length=100, blank=True, default='')
    extracted_location = models.CharField(max_length=120, blank=True, default='')
    main_problem = models.TextField(blank=True, default='')
    suggested_outcomes = models.TextField(blank=True, default='')
    suggested_priority = models.CharField(max_length=30, blank=True, default='Medium')
    keywords = models.JSONField(default=list, blank=True)
    possible_stakeholders = models.JSONField(default=list, blank=True)
    measurable_indicators = models.JSONField(default=list, blank=True)
    model_source = models.CharField(max_length=120, default='CivicSync Advisory AI Engine (Demo Mode)')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"AI Analysis for {self.challenge.challenge_code}"


class ChallengeFollow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following_challenges')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'challenge')


class InterestType(models.TextChoices):
    RESEARCH = 'RESEARCH', 'Academic / Research Solution'
    FUNDING = 'FUNDING', 'CSR / Grant Funding'
    MENTORSHIP = 'MENTORSHIP', 'Technical Mentorship'
    IMPLEMENTATION = 'IMPLEMENTATION', 'Pilot Implementation'


class ChallengeInterest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expressed_interests')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='interested_parties')
    interest_type = models.CharField(max_length=30, choices=InterestType.choices, default=InterestType.RESEARCH)
    note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'challenge')


class ProposalStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    SUBMITTED = 'SUBMITTED', 'Submitted'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    ACCEPTED = 'ACCEPTED', 'Accepted'
    REJECTED = 'REJECTED', 'Rejected'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    COMPLETED = 'COMPLETED', 'Completed'


class SolutionProposal(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='proposals')
    proposed_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='proposals')
    title = models.CharField(max_length=255)
    problem_understanding = models.TextField()
    proposed_solution = models.TextField()
    technical_approach = models.TextField()
    expected_impact = models.TextField()
    estimated_duration = models.CharField(max_length=100, default='3 to 6 months')
    required_resources = models.TextField(blank=True, default='')
    success_indicators = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=20,
        choices=ProposalStatus.choices,
        default=ProposalStatus.SUBMITTED
    )
    admin_review_comments = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class ProjectMilestone(models.Model):
    proposal = models.ForeignKey(SolutionProposal, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    target_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    completion_date = models.DateField(null=True, blank=True)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order', 'target_date']

    def __str__(self):
        return f"{self.title} - {'Done' if self.is_completed else 'Pending'}"


class ProgressUpdate(models.Model):
    proposal = models.ForeignKey(SolutionProposal, on_delete=models.CASCADE, related_name='progress_updates')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class Comment(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    is_flagged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']


class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action_type = models.CharField(max_length=80)
    description = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

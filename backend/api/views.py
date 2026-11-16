from rest_framework import generics, status, views, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import (
    UserRole, CitizenProfile, UniversityProfile, Department,
    IndustryPartnerProfile, Expertise, ChallengeCategory,
    Challenge, ChallengeStatus, ChallengeAnalysis, ChallengeFollow,
    ChallengeInterest, SolutionProposal, ProjectMilestone,
    ProgressUpdate, Comment, ActivityLog
)
from .serializers import (
    UserSerializer, RegisterSerializer, ChallengeCategorySerializer,
    ChallengeListSerializer, ChallengeDetailSerializer, ChallengeAnalysisSerializer,
    SolutionProposalSerializer, ProjectMilestoneSerializer, ProgressUpdateSerializer,
    CommentSerializer, ChallengeInterestSerializer, UniversityProfileSerializer
)
from .permissions import (
    IsAdminUserRole, IsUniversityUserRole, IsIndustryUserRole, IsOwnerOrAdminOrReadOnly
)
from ai_service.analyzer import analyze_challenge
from ai_service.similarity import calculate_similarity_with_corpus
from ai_service.recommender import match_challenge_with_institutions

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'organization_name': self.user.organization_name
        }
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CurrentUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryListView(generics.ListAPIView):
    queryset = ChallengeCategory.objects.all()
    serializer_class = ChallengeCategorySerializer
    permission_classes = [permissions.AllowAny]


class ChallengeListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        queryset = Challenge.objects.select_related('category', 'reported_by').all()
        
        # Search filter
        search_query = request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(city__icontains=search_query) |
                Q(challenge_code__icontains=search_query)
            )

        # Category filter
        category_slug = request.query_params.get('category')
        if category_slug and category_slug != 'all':
            queryset = queryset.filter(category__slug=category_slug)

        # Status filter
        status_param = request.query_params.get('status')
        if status_param and status_param != 'all':
            queryset = queryset.filter(status=status_param)

        # City filter
        city_param = request.query_params.get('city')
        if city_param:
            queryset = queryset.filter(city__iexact=city_param)

        # Severity filter
        severity_param = request.query_params.get('severity')
        if severity_param and severity_param != 'all':
            queryset = queryset.filter(estimated_severity=severity_param)

        # Sorting
        sort_by = request.query_params.get('sort', 'newest')
        if sort_by == 'oldest':
            queryset = queryset.order_by('created_at')
        elif sort_by == 'most_viewed':
            queryset = queryset.order_by('-views_count')
        elif sort_by == 'most_followed':
            queryset = queryset.annotate(f_count=Count('followers')).order_by('-f_count')
        else:
            queryset = queryset.order_by('-created_at')

        # Pagination
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = 12
        page = paginator.paginate_queryset(queryset, request)
        serializer = ChallengeListSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        title = request.data.get('title', '').strip()
        description = request.data.get('description', '').strip()
        category_id = request.data.get('category')
        city = request.data.get('city', '').strip()
        location_desc = request.data.get('location_description', '')
        affected_community = request.data.get('affected_community', '')
        severity = request.data.get('estimated_severity', 'MEDIUM')
        desired_outcome = request.data.get('desired_outcome', '')
        additional_context = request.data.get('additional_context', '')
        image = request.FILES.get('image')

        if not title or not description or not city:
            return Response(
                {"error": "Title, description, and city are required fields."},
                status=status.HTTP_400_BAD_REQUEST
            )

        category = None
        if category_id:
            try:
                category = ChallengeCategory.objects.get(id=category_id)
            except (ChallengeCategory.DoesNotExist, ValueError):
                pass

        challenge = Challenge.objects.create(
            title=title,
            description=description,
            category=category,
            city=city,
            location_description=location_desc,
            affected_community=affected_community,
            estimated_severity=severity,
            desired_outcome=desired_outcome,
            additional_context=additional_context,
            reported_by=request.user,
            image=image,
            status=ChallengeStatus.PENDING
        )

        # Trigger AI analysis immediately
        try:
            analysis_dict = analyze_challenge(
                title=title,
                description=description,
                category_name=category.name if category else "",
                city=city
            )
            ChallengeAnalysis.objects.create(
                challenge=challenge,
                status='COMPLETED',
                summary=analysis_dict['summary'],
                suggested_category=analysis_dict['suggested_category'],
                extracted_location=analysis_dict['extracted_location'],
                main_problem=analysis_dict['main_problem'],
                suggested_outcomes=analysis_dict['suggested_outcomes'],
                suggested_priority=analysis_dict['suggested_priority'],
                keywords=analysis_dict['keywords'],
                possible_stakeholders=analysis_dict['possible_stakeholders'],
                measurable_indicators=analysis_dict['measurable_indicators'],
                model_source=analysis_dict['model_source']
            )
        except Exception as e:
            ChallengeAnalysis.objects.create(
                challenge=challenge,
                status='FAILED',
                summary=f"Analysis pipeline error: {str(e)}"
            )

        # Log Activity
        ActivityLog.objects.create(
            user=request.user,
            action_type='CHALLENGE_SUBMITTED',
            description=f"Submitted challenge: {challenge.title} [{challenge.challenge_code}]"
        )

        serializer = ChallengeDetailSerializer(challenge, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChallengeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeDetailSerializer
    permission_classes = [IsOwnerOrAdminOrReadOnly]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment views safely
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ChallengeVerifyActionView(views.APIView):
    """Admin action to verify or reject a challenge with review notes."""
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        challenge = get_object_or_404(Challenge, pk=pk)
        new_status = request.data.get('status')
        admin_notes = request.data.get('admin_notes', '')

        if new_status not in [ChallengeStatus.VERIFIED, ChallengeStatus.REJECTED, ChallengeStatus.IN_PROGRESS, ChallengeStatus.RESOLVED]:
            return Response({"error": "Invalid target status."}, status=status.HTTP_400_BAD_REQUEST)

        challenge.status = new_status
        if admin_notes:
            challenge.admin_notes = admin_notes
        challenge.save()

        ActivityLog.objects.create(
            user=request.user,
            action_type=f"CHALLENGE_{new_status}",
            description=f"Admin {request.user.username} set status of {challenge.challenge_code} to {new_status}"
        )

        serializer = ChallengeDetailSerializer(challenge, context={'request': request})
        return Response(serializer.data)


class ChallengeToggleFollowView(views.APIView):
    """Toggle follow/unfollow for a challenge."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        challenge = get_object_or_404(Challenge, pk=pk)
        follow, created = ChallengeFollow.objects.get_or_create(user=request.user, challenge=challenge)
        if not created:
            follow.delete()
            return Response({"following": False, "followers_count": challenge.followers.count()})
        return Response({"following": True, "followers_count": challenge.followers.count()})


class ChallengeCheckSimilarityView(views.APIView):
    """
    Checks semantic similarity against existing database challenges.
    Used during submission or on challenge detail page to find duplicates.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        title = request.data.get('title', '').strip()
        description = request.data.get('description', '').strip()
        exclude_id = request.data.get('exclude_id')

        if not title:
            return Response({"error": "Title is required."}, status=status.HTTP_400_BAD_REQUEST)

        candidates_qs = Challenge.objects.exclude(status=ChallengeStatus.REJECTED)
        if exclude_id:
            candidates_qs = candidates_qs.exclude(id=exclude_id)

        candidates = [
            {
                'id': c.id,
                'challenge_code': c.challenge_code,
                'title': c.title,
                'description': c.description,
                'city': c.city,
                'category_name': c.category.name if c.category else 'General',
                'status': c.status
            }
            for c in candidates_qs[:100]
        ]

        result = calculate_similarity_with_corpus(
            query_title=title,
            query_description=description,
            candidates=candidates,
            threshold=0.25
        )
        return Response(result)


class ChallengeUniversityRecommendationsView(views.APIView):
    """Returns AI recommendations matching universities/departments with this challenge."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        challenge = get_object_or_404(Challenge, pk=pk)
        category_name = challenge.category.name if challenge.category else ""
        keywords = []
        if hasattr(challenge, 'ai_analysis') and challenge.ai_analysis.keywords:
            keywords = challenge.ai_analysis.keywords

        universities = []
        for uni in UniversityProfile.objects.prefetch_related('departments__expertises').all():
            departments_data = []
            for dept in uni.departments.all():
                departments_data.append({
                    'id': dept.id,
                    'name': dept.name,
                    'expertises': [exp.name for exp in dept.expertises.all()]
                })
            universities.append({
                'id': uni.id,
                'institution_name': uni.institution_name,
                'campus_location': uni.campus_location,
                'departments': departments_data
            })

        matches = match_challenge_with_institutions(
            challenge_title=challenge.title,
            challenge_description=challenge.description,
            category_name=category_name,
            keywords=keywords,
            universities=universities
        )
        return Response({"challenge_id": challenge.id, "recommendations": matches})


class ChallengeInterestCreateView(views.APIView):
    """Express interest from University or Industry Partner."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        challenge = get_object_or_404(Challenge, pk=pk)
        interest_type = request.data.get('interest_type', 'RESEARCH')
        note = request.data.get('note', '')

        interest, created = ChallengeInterest.objects.update_or_create(
            user=request.user,
            challenge=challenge,
            defaults={'interest_type': interest_type, 'note': note}
        )
        serializer = ChallengeInterestSerializer(interest)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class SolutionProposalListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        challenge_id = request.query_params.get('challenge_id')
        user_only = request.query_params.get('my_proposals')

        queryset = SolutionProposal.objects.select_related('proposed_by', 'challenge').all()
        if challenge_id:
            queryset = queryset.filter(challenge_id=challenge_id)
        if user_only and request.user.is_authenticated:
            queryset = queryset.filter(proposed_by=request.user)

        serializer = SolutionProposalSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not (request.user.role == UserRole.UNIVERSITY or request.user.is_staff):
            return Response(
                {"error": "Only registered university partners may submit solution proposals."},
                status=status.HTTP_403_FORBIDDEN
            )

        challenge_id = request.data.get('challenge')
        challenge = get_object_or_404(Challenge, pk=challenge_id)

        serializer = SolutionProposalSerializer(data=request.data)
        if serializer.is_valid():
            proposal = serializer.save(proposed_by=request.user, challenge=challenge)

            # Auto create default milestone sequence
            ProjectMilestone.objects.create(
                proposal=proposal,
                title="Phase 1: Field Assessment & Requirement Finalization",
                description="Community interviews, baseline data collection, and preliminary feasibility study.",
                order=1
            )
            ProjectMilestone.objects.create(
                proposal=proposal,
                title="Phase 2: Prototype & Solution Engineering",
                description="Development and controlled lab testing of the proposed technical solution.",
                order=2
            )
            ProjectMilestone.objects.create(
                proposal=proposal,
                title="Phase 3: Field Pilot & Community Handover",
                description="On-ground deployment, impact measurement, and handover to civic stakeholders.",
                order=3
            )

            ActivityLog.objects.create(
                user=request.user,
                action_type="PROPOSAL_SUBMITTED",
                description=f"University {request.user.organization_name or request.user.username} submitted proposal for {challenge.challenge_code}"
            )
            return Response(SolutionProposalSerializer(proposal).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SolutionProposalDetailView(generics.RetrieveUpdateAPIView):
    queryset = SolutionProposal.objects.all()
    serializer_class = SolutionProposalSerializer
    permission_classes = [IsOwnerOrAdminOrReadOnly]


class SolutionProposalStatusUpdateView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        proposal = get_object_or_404(SolutionProposal, pk=pk)
        new_status = request.data.get('status')
        comments = request.data.get('admin_review_comments', '')

        if new_status:
            proposal.status = new_status
            if new_status == 'ACCEPTED':
                # Update challenge status to IN_PROGRESS
                proposal.challenge.status = ChallengeStatus.IN_PROGRESS
                proposal.challenge.save(update_fields=['status'])
            elif new_status == 'COMPLETED':
                # Check if all milestones completed, can mark challenge resolved
                proposal.challenge.status = ChallengeStatus.RESOLVED
                proposal.challenge.save(update_fields=['status'])

        if comments:
            proposal.admin_review_comments = comments
        proposal.save()

        return Response(SolutionProposalSerializer(proposal).data)


class ProjectMilestoneUpdateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        milestone = get_object_or_404(ProjectMilestone, pk=pk)
        # Check permissions: proposal author or admin
        if milestone.proposal.proposed_by != request.user and not request.user.is_staff:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        is_completed = request.data.get('is_completed')
        if is_completed is not None:
            milestone.is_completed = bool(is_completed)
            if milestone.is_completed:
                from django.utils import timezone
                milestone.completion_date = timezone.now().date()
            else:
                milestone.completion_date = None
        milestone.save()
        return Response(ProjectMilestoneSerializer(milestone).data)


class ProgressUpdateCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, proposal_id):
        proposal = get_object_or_404(SolutionProposal, pk=proposal_id)
        if proposal.proposed_by != request.user and not request.user.is_staff:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        title = request.data.get('title', '').strip()
        content = request.data.get('content', '').strip()
        if not title or not content:
            return Response({"error": "Title and content required."}, status=status.HTTP_400_BAD_REQUEST)

        update = ProgressUpdate.objects.create(
            proposal=proposal,
            author=request.user,
            title=title,
            content=content
        )
        return Response(ProgressUpdateSerializer(update).data, status=status.HTTP_201_CREATED)


class CommentListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request, challenge_id):
        challenge = get_object_or_404(Challenge, pk=challenge_id)
        content = request.data.get('content', '').strip()
        if not content:
            return Response({"error": "Comment cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        comment = Comment.objects.create(
            challenge=challenge,
            author=request.user,
            content=content
        )
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class PlatformStatsView(views.APIView):
    """Aggregated platform statistics for landing page and dashboards."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_challenges = Challenge.objects.count()
        verified_challenges = Challenge.objects.filter(status=ChallengeStatus.VERIFIED).count()
        in_progress_challenges = Challenge.objects.filter(status=ChallengeStatus.IN_PROGRESS).count()
        resolved_challenges = Challenge.objects.filter(status=ChallengeStatus.RESOLVED).count()
        pending_challenges = Challenge.objects.filter(status=ChallengeStatus.PENDING).count()

        universities_count = UniversityProfile.objects.count()
        industry_count = IndustryPartnerProfile.objects.count()
        proposals_count = SolutionProposal.objects.count()

        # Category Breakdown
        categories_data = []
        for cat in ChallengeCategory.objects.annotate(c_count=Count('challenges')):
            categories_data.append({
                'name': cat.name,
                'count': cat.c_count
            })

        # Status distribution for charts
        status_distribution = [
            {'name': 'Pending Review', 'value': pending_challenges, 'color': '#E9B44C'},
            {'name': 'Verified', 'value': verified_challenges, 'color': '#287A59'},
            {'name': 'In Progress', 'value': in_progress_challenges, 'color': '#3E7B99'},
            {'name': 'Resolved', 'value': resolved_challenges, 'color': '#0E6835'},
        ]

        # Recent activities
        recent_activities = [
            {'action': log.action_type, 'desc': log.description, 'time': log.timestamp}
            for log in ActivityLog.objects.all()[:6]
        ]

        return Response({
            'total_challenges': total_challenges,
            'verified_challenges': verified_challenges,
            'in_progress_challenges': in_progress_challenges,
            'resolved_challenges': resolved_challenges,
            'pending_challenges': pending_challenges,
            'universities_count': max(universities_count, 1),
            'industry_count': max(industry_count, 1),
            'proposals_count': proposals_count,
            'categories': categories_data,
            'status_distribution': status_distribution,
            'recent_activities': recent_activities
        })


class CitizenDashboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        my_challenges = Challenge.objects.filter(reported_by=request.user)
        following_challenges = Challenge.objects.filter(followers__user=request.user)

        return Response({
            'submitted_count': my_challenges.count(),
            'pending_count': my_challenges.filter(status=ChallengeStatus.PENDING).count(),
            'verified_count': my_challenges.filter(status=ChallengeStatus.VERIFIED).count(),
            'in_progress_count': my_challenges.filter(status=ChallengeStatus.IN_PROGRESS).count(),
            'resolved_count': my_challenges.filter(status=ChallengeStatus.RESOLVED).count(),
            'my_challenges': ChallengeListSerializer(my_challenges[:8], many=True, context={'request': request}).data,
            'following_challenges': ChallengeListSerializer(following_challenges[:6], many=True, context={'request': request}).data
        })


class AdminDashboardView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        pending_queue = Challenge.objects.filter(status=ChallengeStatus.PENDING)
        recent_all = Challenge.objects.all().order_by('-created_at')[:10]
        recent_proposals = SolutionProposal.objects.filter(status='SUBMITTED').order_by('-created_at')[:6]

        return Response({
            'pending_queue_count': pending_queue.count(),
            'pending_challenges': ChallengeListSerializer(pending_queue[:10], many=True, context={'request': request}).data,
            'recent_challenges': ChallengeListSerializer(recent_all, many=True, context={'request': request}).data,
            'pending_proposals': SolutionProposalSerializer(recent_proposals, many=True).data
        })


class UniversityDashboardView(views.APIView):
    permission_classes = [IsUniversityUserRole]

    def get(self, request):
        # Recommended challenges (verified and seeking proposals)
        open_challenges = Challenge.objects.filter(status=ChallengeStatus.VERIFIED)[:8]
        my_proposals = SolutionProposal.objects.filter(proposed_by=request.user)

        return Response({
            'active_proposals_count': my_proposals.filter(status__in=['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'IN_PROGRESS']).count(),
            'accepted_projects_count': my_proposals.filter(status__in=['ACCEPTED', 'IN_PROGRESS', 'COMPLETED']).count(),
            'recommended_challenges': ChallengeListSerializer(open_challenges, many=True, context={'request': request}).data,
            'my_proposals': SolutionProposalSerializer(my_proposals, many=True).data
        })


class IndustryDashboardView(views.APIView):
    permission_classes = [IsIndustryUserRole]

    def get(self, request):
        expressed_interests = ChallengeInterest.objects.filter(user=request.user)
        in_progress_challenges = Challenge.objects.filter(status=ChallengeStatus.IN_PROGRESS)[:6]

        return Response({
            'interests_expressed_count': expressed_interests.count(),
            'collaborations_count': expressed_interests.filter(challenge__status__in=[ChallengeStatus.IN_PROGRESS, ChallengeStatus.RESOLVED]).count(),
            'my_interests': ChallengeInterestSerializer(expressed_interests, many=True).data,
            'active_collaborations': ChallengeListSerializer(in_progress_challenges, many=True, context={'request': request}).data
        })

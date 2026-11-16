from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, CustomTokenObtainPairView, CurrentUserView,
    CategoryListView, ChallengeListCreateView, ChallengeDetailView,
    ChallengeVerifyActionView, ChallengeToggleFollowView,
    ChallengeCheckSimilarityView, ChallengeUniversityRecommendationsView,
    ChallengeInterestCreateView, SolutionProposalListCreateView,
    SolutionProposalDetailView, SolutionProposalStatusUpdateView,
    ProjectMilestoneUpdateView, ProgressUpdateCreateView,
    CommentListCreateView, PlatformStatsView, CitizenDashboardView,
    AdminDashboardView, UniversityDashboardView, IndustryDashboardView
)

urlpatterns = [
    # Authentication
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('auth/me/', CurrentUserView.as_view(), name='auth_me'),

    # Metadata & Categories
    path('categories/', CategoryListView.as_view(), name='category_list'),

    # Challenges
    path('challenges/', ChallengeListCreateView.as_view(), name='challenge_list_create'),
    path('challenges/<int:pk>/', ChallengeDetailView.as_view(), name='challenge_detail'),
    path('challenges/<int:pk>/verify/', ChallengeVerifyActionView.as_view(), name='challenge_verify'),
    path('challenges/<int:pk>/follow/', ChallengeToggleFollowView.as_view(), name='challenge_follow'),
    path('challenges/<int:pk>/recommendations/', ChallengeUniversityRecommendationsView.as_view(), name='challenge_recommendations'),
    path('challenges/<int:pk>/express-interest/', ChallengeInterestCreateView.as_view(), name='challenge_express_interest'),
    path('challenges/<int:challenge_id>/comments/', CommentListCreateView.as_view(), name='challenge_comment_create'),
    path('challenges/check-similarity/', ChallengeCheckSimilarityView.as_view(), name='challenge_check_similarity'),

    # Proposals & Collaboration
    path('proposals/', SolutionProposalListCreateView.as_view(), name='proposal_list_create'),
    path('proposals/<int:pk>/', SolutionProposalDetailView.as_view(), name='proposal_detail'),
    path('proposals/<int:pk>/status/', SolutionProposalStatusUpdateView.as_view(), name='proposal_status_update'),
    path('proposals/<int:proposal_id>/progress/', ProgressUpdateCreateView.as_view(), name='proposal_progress_create'),
    path('milestones/<int:pk>/', ProjectMilestoneUpdateView.as_view(), name='milestone_update'),

    # Dashboards & Stats
    path('stats/platform/', PlatformStatsView.as_view(), name='platform_stats'),
    path('dashboards/citizen/', CitizenDashboardView.as_view(), name='dashboard_citizen'),
    path('dashboards/admin/', AdminDashboardView.as_view(), name='dashboard_admin'),
    path('dashboards/university/', UniversityDashboardView.as_view(), name='dashboard_university'),
    path('dashboards/industry/', IndustryDashboardView.as_view(), name='dashboard_industry'),
]

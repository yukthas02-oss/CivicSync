from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, CitizenProfile, UniversityProfile, Department,
    IndustryPartnerProfile, Expertise, ChallengeCategory,
    Challenge, ChallengeAnalysis, ChallengeFollow, ChallengeInterest,
    SolutionProposal, ProjectMilestone, ProgressUpdate, Comment,
    ActivityLog
)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('CivicSync Details', {'fields': ('role', 'organization_name', 'phone_number', 'bio', 'avatar')}),
    )
    list_display = ('username', 'email', 'role', 'organization_name', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')

admin.site.register(CitizenProfile)
admin.site.register(UniversityProfile)
admin.site.register(Department)
admin.site.register(IndustryPartnerProfile)
admin.site.register(Expertise)
admin.site.register(ChallengeCategory)
admin.site.register(Challenge)
admin.site.register(ChallengeAnalysis)
admin.site.register(ChallengeFollow)
admin.site.register(ChallengeInterest)
admin.site.register(SolutionProposal)
admin.site.register(ProjectMilestone)
admin.site.register(ProgressUpdate)
admin.site.register(Comment)
admin.site.register(ActivityLog)

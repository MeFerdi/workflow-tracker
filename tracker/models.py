from django.db import models
import uuid
from django.utils import timezone


def generate_tracking_number():
    date = timezone.now().strftime("%Y%m%d")
    suffix = uuid.uuid4().hex[:4].upper()
    return f"TRK-{date}-{suffix}"

class Application(models.Model):

    class Status(models.TextChoices):
        DRAFT = "Draft"
        SUBMITTED = "Submitted"
        UNDER_REVIEW = "Under Review"
        NEED_MORE_INFO = "Need More Info"
        APPROVED = "Approved"
        REJECTED = "Rejected"


    class ApplicationType(models.TextChoices):
        RECORDATION = "Recordation"
        RENEWAL = "Renewal"
        CHANGE_OF_OWNERSHIP = "Change of Ownership"
        CHANGE_OF_NAME = "Change of Name"
        DISCONTINUATION = "Discontinuation"

    tracking_number = models.CharField(
            max_length=20, unique=True, default=generate_tracking_number
            )
    applicant_name = models.CharField(max_length=255)
    applicant_email = models.EmailField()
    company_name = models.CharField(max_length=255)
    application_type = models.CharField(
        max_length=50, choices=ApplicationType.choices
    )
    description = models.TextField()
    status = models.CharField(
        max_length=50, choices=Status.choices, default=Status.DRAFT
    )
    reviewer_comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.tracking_number} - {self.applicant_name}"



from django.db import models

class Applicant(models.Model):
    applicantName = models.CharField(max_length=255)
    applicantEmail = models.Charfield(max_length=255)



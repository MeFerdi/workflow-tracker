from ninja import Router
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Application
from .schemas import(
        ApplicationCreateSchema,
        ApplicationUpdateSchema,
        ApplicationOutSchema,
        ReviewerDecisionSchema,
        )
from typing import List

router = Router()


@router.post("/applications", response=ApplicationOutSchema)
def create_draft(request, payload: ApplicationCreateSchema):
    application = Application.objects.create(**payload.dict())
    return application

@router.get("/applications", response=List[ApplicationOutSchema])
def list_applications(request):
    return Application.objects.all()


@router.get("/applications/{id}", response=ApplicationOutSchema)
def get_application(request, id: int):
    return get_object_or_404(Application, id=id)


@router.patch("/applications/{id}", response=ApplicationOutSchema)
def update_draft(request, id: int, payload: ApplicationUpdateSchema):
    application = get_object_or_404(Application, id=id)

    editable_statuses = [
        Application.Status.DRAFT,
        Application.Status.NEED_MORE_INFO
    ]

    if application.status not in editable_statuses:
        return router.create_response(
            request,
            {"detail": "Only Draft or Need More Information applications can be edited."},
            status=400,
        )

    for attr, value in payload.dict(exclude_none=True).items():
        setattr(application, attr, value)

    application.save()
    return application


@router.post("/applications/{id}/submit", response=ApplicationOutSchema)
def submit_application(request, id: int):
    application = get_object_or_404(Application, id=id)

    if application.status not in [
        Application.Status.DRAFT,
        Application.Status.NEED_MORE_INFO
    ]:
        return router.create_response(
            request,
            {"detail": "Only Draft or Need More Information applications can be submitted."},
            status=400,
        )

    application.status = Application.Status.SUBMITTED
    application.submitted_at = timezone.now()
    application.save()
    return application


@router.post("/applications/{id}/review", response=ApplicationOutSchema)
def start_review(request, id: int):
    application = get_object_or_404(Application, id=id)

    if application.status != Application.Status.SUBMITTED:
        return router.create_response(
            request,
            {"detail": "Only Submitted applications can move to Under Review."},
            status=400,
        )

    application.status = Application.Status.UNDER_REVIEW
    application.save()
    return application


@router.post("/applications/{id}/decision", response=ApplicationOutSchema)
def record_decision(request, id: int, payload: ReviewerDecisionSchema):
    application = get_object_or_404(Application, id=id)

    if application.status != Application.Status.UNDER_REVIEW:
        return router.create_response(
            request,
            {"detail": "Only Under Review applications can receive a decision."},
            status=400,
        )

    valid_decisions = [
        Application.Status.APPROVED,
        Application.Status.REJECTED,
        Application.Status.NEED_MORE_INFO,
    ]

    if payload.decision not in valid_decisions:
        return router.create_response(
            request,
            {"detail": f"Invalid decision. Choose from: {valid_decisions}"},
            status=400,
        )

    if payload.decision in [
        Application.Status.REJECTED,
        Application.Status.NEED_MORE_INFO
    ] and not payload.reviewer_comment:
        return router.create_response(
            request,
            {"detail": "A comment is required for Rejected or Need More Information decisions."},
            status=400,
        )

    application.status = payload.decision
    application.reviewer_comment = payload.reviewer_comment
    application.reviewed_at = timezone.now()
    application.save()
    return application

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client, { getApiErrorMessage } from "../api/client";
import type { Application } from "../types/application";

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    client
      .get(`/applications/${id}`)
      .then((res) => setApp(res.data))
      .catch((err: unknown) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const performAction = async (url: string, payload?: unknown) => {
    setActing(true);
    setError(null);
    try {
      const res = await client.post(url, payload);
      setApp(res.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <main className="page-shell" aria-busy="true">
        <div className="page-header">
          <p className="eyebrow">Applications</p>
          <h1>Application Detail</h1>
        </div>
        <div className="data-panel">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
        </div>
      </main>
    );
  }

  if (!app) {
    return (
      <main className="page-shell page-shell--narrow">
        <div className="empty-state">
          <h1>Application not found</h1>
          <p>The requested application could not be loaded.</p>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <button className="button button-primary" type="button" onClick={() => navigate("/applications")}>
            Back to applications
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <button className="button button-link" type="button" onClick={() => navigate("/applications")}>
        Back to applications
      </button>

      <div className="page-header page-header--split">
        <div>
          <p className="eyebrow">Application</p>
          <h1>{app.tracking_number}</h1>
          <p className="page-subtitle">{app.company_name}</p>
        </div>
        <span className="status-pill">{app.status}</span>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <dl className="detail-grid">
        <div><dt>Applicant name</dt><dd>{app.applicant_name}</dd></div>
        <div><dt>Email</dt><dd>{app.applicant_email}</dd></div>
        <div><dt>Company</dt><dd>{app.company_name}</dd></div>
        <div><dt>Type</dt><dd>{app.application_type}</dd></div>
        <div><dt>Created</dt><dd>{new Date(app.created_at).toLocaleDateString()}</dd></div>
        {app.submitted_at && (
          <div><dt>Submitted</dt><dd>{new Date(app.submitted_at).toLocaleDateString()}</dd></div>
        )}
        {app.reviewed_at && (
          <div><dt>Reviewed</dt><dd>{new Date(app.reviewed_at).toLocaleDateString()}</dd></div>
        )}
        <div className="detail-grid__wide"><dt>Description</dt><dd>{app.description}</dd></div>
        {app.reviewer_comment && (
          <div className="detail-grid__wide"><dt>Reviewer comment</dt><dd>{app.reviewer_comment}</dd></div>
        )}
      </dl>

      <div className="action-bar" aria-busy={acting}>
        {app.status === "Draft" && (
          <>
            <button className="button button-secondary" type="button" onClick={() => navigate(`/applications/${id}/edit`)}>
              Edit
            </button>
            <button
              className="button button-primary"
              type="button"
              onClick={() => performAction(`/applications/${id}/submit`)}
              disabled={acting}
            >
              {acting ? "Submitting..." : "Submit"}
            </button>
          </>
        )}

        {app.status === "Submitted" && (
          <button
            className="button button-primary"
            type="button"
            onClick={() => performAction(`/applications/${id}/review`)}
            disabled={acting}
          >
            {acting ? "Starting..." : "Start Review"}
          </button>
        )}

        {app.status === "Under Review" && (
          <>
            <button
              className="button button-primary"
              type="button"
              disabled={acting}
              onClick={() =>
                performAction(`/applications/${id}/decision`, {
                  decision: "Approved",
                  reviewer_comment: "",
                })
              }
            >
              {acting ? "Processing..." : "Approve"}
            </button>
            <button className="button button-secondary" type="button" onClick={() => navigate(`/applications/${id}/review`)}>
              Need More Information
            </button>
            <button className="button button-danger" type="button" onClick={() => navigate(`/applications/${id}/review`)}>
              Reject
            </button>
          </>
        )}

        {app.status === "Need More Info" && (
          <>
            <button className="button button-secondary" type="button" onClick={() => navigate(`/applications/${id}/edit`)}>
              Edit
            </button>
            <button
              className="button button-primary"
              type="button"
              onClick={() => performAction(`/applications/${id}/submit`)}
              disabled={acting}
            >
              {acting ? "Submitting..." : "Resubmit"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

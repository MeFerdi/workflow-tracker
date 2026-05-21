import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
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
      .finally(() => setLoading(false));
  }, [id]);

  const performAction = async (url: string) => {
    setActing(true);
    setError(null);
    try {
      const res = await client.post(url);
      setApp(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setActing(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!app) return <p>Application not found.</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: "700px" }}>
      <button onClick={() => navigate("/applications")}>← Back</button>
      <h1>Application Detail</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border={1} cellPadding={8} style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem" }}>
        <tbody>
          <tr><td><strong>Tracking Number</strong></td><td>{app.tracking_number}</td></tr>
          <tr><td><strong>Applicant Name</strong></td><td>{app.applicant_name}</td></tr>
          <tr><td><strong>Email</strong></td><td>{app.applicant_email}</td></tr>
          <tr><td><strong>Company</strong></td><td>{app.company_name}</td></tr>
          <tr><td><strong>Type</strong></td><td>{app.application_type}</td></tr>
          <tr><td><strong>Description</strong></td><td>{app.description}</td></tr>
          <tr><td><strong>Status</strong></td><td>{app.status}</td></tr>
          <tr><td><strong>Created</strong></td><td>{new Date(app.created_at).toLocaleDateString()}</td></tr>
          {app.submitted_at && <tr><td><strong>Submitted</strong></td><td>{new Date(app.submitted_at).toLocaleDateString()}</td></tr>}
          {app.reviewed_at && <tr><td><strong>Reviewed</strong></td><td>{new Date(app.reviewed_at).toLocaleDateString()}</td></tr>}
          {app.reviewer_comment && <tr><td><strong>Reviewer Comment</strong></td><td>{app.reviewer_comment}</td></tr>}
        </tbody>
      </table>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {app.status === "Draft" && (
          <>
            <button onClick={() => navigate(`/applications/${id}/edit`)}>
              Edit
            </button>
            <button onClick={() => performAction(`/applications/${id}/submit`)}>
              {acting ? "Submitting..." : "Submit"}
            </button>
          </>
        )}

        {app.status === "Submitted" && (
          <button onClick={() => performAction(`/applications/${id}/review`)}>
            {acting ? "Starting..." : "Start Review"}
          </button>
        )}

        {app.status === "Under Review" && (
          <>
            <button onClick={() => performAction(`/applications/${id}/decision`)}>
              {acting ? "Processing..." : "Approve"}
            </button>
            <button onClick={() => navigate(`/applications/${id}/review`)}>
              Need More Information
            </button>
            <button onClick={() => navigate(`/applications/${id}/review`)}>
              Reject
            </button>
          </>
        )}

        {app.status === "Need More Information" && (
          <>
            <button onClick={() => navigate(`/applications/${id}/edit`)}>
              Edit
            </button>
            <button onClick={() => performAction(`/applications/${id}/submit`)}>
              {acting ? "Submitting..." : "Resubmit"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

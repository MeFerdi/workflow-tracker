import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client, { getApiErrorMessage } from "../api/client";
import { type Application } from "../types/application";

export default function ApplicationList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    client
      .get("/applications")
      .then((res) => setApplications(res.data))
      .catch((err: unknown) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="page-shell" aria-busy="true">
        <div className="page-header page-header--split">
          <div>
            <p className="eyebrow">Registry</p>
            <h1>Applications</h1>
          </div>
          <div className="skeleton skeleton-button" />
        </div>
        <div className="data-panel">
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-header page-header--split">
        <div>
          <p className="eyebrow">Registry</p>
          <h1>Applications</h1>
          <p className="page-subtitle">Review draft, submitted, and completed application records.</p>
        </div>
        <button className="button button-primary" type="button" onClick={() => navigate("/applications/new")}>
          New Application
        </button>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="empty-state">
          <h2>No applications yet</h2>
          <p>Create the first draft application to begin tracking records.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tracking Number</th>
                <th>Applicant Name</th>
                <th>Company</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td className="mono">{app.tracking_number}</td>
                  <td>{app.applicant_name}</td>
                  <td>{app.company_name}</td>
                  <td>{app.application_type}</td>
                  <td><span className="status-pill">{app.status}</span></td>
                  <td>{new Date(app.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="button button-small button-secondary"
                      type="button"
                      onClick={() => navigate(`/applications/${app.id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

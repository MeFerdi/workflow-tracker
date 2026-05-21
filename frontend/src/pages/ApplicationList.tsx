import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { type Application } from "../types/application";

export default function ApplicationList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    client
      .get("/applications")
      .then((res) => setApplications(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h1>Applications</h1>
        <button onClick={() => navigate("/applications/new")}>
          + New Application
        </button>
      </div>
      <table border={1} cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
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
              <td>{app.tracking_number}</td>
              <td>{app.applicant_name}</td>
              <td>{app.company_name}</td>
              <td>{app.application_type}</td>
              <td>{app.status}</td>
              <td>{new Date(app.created_at).toLocaleDateString()}</td>
              <td>
                <button onClick={() => navigate(`/applications/${app.id}`)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

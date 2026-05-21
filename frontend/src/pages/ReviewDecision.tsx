import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

export default function ReviewDecision() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [decision, setDecision] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!decision) {
      setError("Please select a decision.");
      return;
    }
    if ((decision === "Rejected" || decision === "Need More Information") && !comment) {
      setError("A comment is required for this decision.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await client.post(`/applications/${id}/decision`, {
        decision,
        reviewer_comment: comment,
      });
      navigate(`/applications/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px" }}>
      <button onClick={() => navigate(`/applications/${id}`)}>← Back</button>
      <h1>Reviewer Decision</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <select value={decision} onChange={(e) => setDecision(e.target.value)}>
          <option value="">Select Decision</option>
          <option value="Approved">Approved</option>
          <option value="Need More Information">Need More Information</option>
          <option value="Rejected">Rejected</option>
        </select>

        <textarea
          placeholder="Reviewer comment (required for Rejected or Need More Information)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />

        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Decision"}
          </button>
          <button onClick={() => navigate(`/applications/${id}`)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

import { type FormEvent, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client, { getApiErrorMessage } from "../api/client";

export default function ReviewDecision() {
  const { id } = useParams();
  const navigate = useNavigate();
  const decisionRef = useRef<HTMLSelectElement | null>(null);
  const commentRef = useRef<HTMLTextAreaElement | null>(null);
  const [decision, setDecision] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const requiresComment = useMemo(
    () => decision === "Rejected" || decision === "Need More Info",
    [decision]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!decision) {
      nextErrors.decision = "Select a decision.";
    }
    if (requiresComment && !comment.trim()) {
      nextErrors.comment = "A reviewer comment is required for this decision.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError("Please correct the highlighted fields.");
      requestAnimationFrame(() => {
        if (nextErrors.decision) decisionRef.current?.focus();
        else commentRef.current?.focus();
      });
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      await client.post(`/applications/${id}/decision`, {
        decision,
        reviewer_comment: comment.trim(),
      });
      navigate(`/applications/${id}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell page-shell--narrow">
      <button className="button button-link" type="button" onClick={() => navigate(`/applications/${id}`)}>
        Back to application
      </button>

      <div className="page-header">
        <p className="eyebrow">Review</p>
        <h1>Reviewer Decision</h1>
        <p className="page-subtitle">
          Record the official outcome and include a clear comment when further action is required.
        </p>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <form className="form-panel" onSubmit={handleSubmit} noValidate aria-busy={loading}>
        <fieldset>
          <legend>Decision</legend>

          <div className="field">
            <label htmlFor="decision">Decision <span>required</span></label>
            <select
              id="decision"
              ref={decisionRef}
              value={decision}
              onChange={(event) => {
                setDecision(event.target.value);
                setFieldErrors((current) => ({ ...current, decision: "" }));
              }}
              aria-invalid={fieldErrors.decision ? "true" : undefined}
              aria-describedby={fieldErrors.decision ? "decision-error" : undefined}
            >
              <option value="">Select decision</option>
              <option value="Approved">Approved</option>
              <option value="Need More Info">Need More Information</option>
              <option value="Rejected">Rejected</option>
            </select>
            {fieldErrors.decision && (
              <p id="decision-error" className="field-error">
                {fieldErrors.decision}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="reviewer_comment">
              Reviewer comment {requiresComment && <span>required</span>}
            </label>
            <textarea
              id="reviewer_comment"
              ref={commentRef}
              value={comment}
              onChange={(event) => {
                setComment(event.target.value);
                setFieldErrors((current) => ({ ...current, comment: "" }));
              }}
              rows={6}
              maxLength={1200}
              placeholder="State the reason for the decision."
              aria-invalid={fieldErrors.comment ? "true" : undefined}
              aria-describedby={fieldErrors.comment ? "reviewer_comment-error" : "reviewer_comment-help"}
            />
            {fieldErrors.comment ? (
              <p id="reviewer_comment-error" className="field-error">
                {fieldErrors.comment}
              </p>
            ) : (
              <p id="reviewer_comment-help" className="field-help">
                Comments are required for rejection or requests for more information.
              </p>
            )}
          </div>
        </fieldset>

        <div className="form-actions">
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Decision"}
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => navigate(`/applications/${id}`)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}

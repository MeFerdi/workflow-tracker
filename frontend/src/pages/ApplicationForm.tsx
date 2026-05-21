import { type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client, { getApiErrorMessage } from "../api/client";
import type { ApplicationType } from "../types/application";

const APPLICATION_TYPES: ApplicationType[] = [
  "Recordation",
  "Renewal",
  "Change of Ownership",
  "Change of Name",
  "Discontinuation",
];

export default function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const applicantNameRef = useRef<HTMLInputElement | null>(null);
  const applicantEmailRef = useRef<HTMLInputElement | null>(null);
  const companyNameRef = useRef<HTMLInputElement | null>(null);
  const applicationTypeRef = useRef<HTMLSelectElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const [form, setForm] = useState({
    applicant_name: "",
    applicant_email: "",
    company_name: "",
    application_type: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit) {
      client
        .get(`/applications/${id}`)
        .then((res) => {
          const { applicant_name, applicant_email, company_name, application_type, description } =
            res.data;
          setForm({ applicant_name, applicant_email, company_name, application_type, description });
        })
        .catch((err: unknown) => setError(getApiErrorMessage(err)))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.applicant_name.trim()) nextErrors.applicant_name = "Applicant name is required.";
    if (!form.applicant_email.trim()) {
      nextErrors.applicant_email = "Applicant email is required.";
    } else if (!emailPattern.test(form.applicant_email.trim())) {
      nextErrors.applicant_email = "Enter a valid email address.";
    }
    if (!form.company_name.trim()) nextErrors.company_name = "Company name is required.";
    if (!form.application_type) nextErrors.application_type = "Select an application type.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError("Please correct the highlighted fields.");
      requestAnimationFrame(() => {
        if (nextErrors.applicant_name) applicantNameRef.current?.focus();
        else if (nextErrors.applicant_email) applicantEmailRef.current?.focus();
        else if (nextErrors.company_name) companyNameRef.current?.focus();
        else if (nextErrors.application_type) applicationTypeRef.current?.focus();
        else descriptionRef.current?.focus();
      });
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      applicant_name: form.applicant_name.trim(),
      applicant_email: form.applicant_email.trim().toLowerCase(),
      company_name: form.company_name.trim(),
      application_type: form.application_type,
      description: form.description.trim(),
    };

    try {
      if (isEdit) {
        await client.patch(`/applications/${id}`, payload);
      } else {
        await client.post("/applications", payload);
      }
      navigate("/applications");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <main className="page-shell page-shell--narrow" aria-busy="true">
        <div className="page-header">
          <p className="eyebrow">Applications</p>
          <h1>Edit Application</h1>
        </div>
        <div className="form-panel">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-field" />
          <div className="skeleton skeleton-field" />
          <div className="skeleton skeleton-field" />
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell page-shell--narrow">
      <div className="page-header">
        <p className="eyebrow">Applications</p>
        <h1>{isEdit ? "Edit Application" : "New Application"}</h1>
        <p className="page-subtitle">
          Provide the applicant and filing details exactly as they should appear in the official
          record.
        </p>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <form className="form-panel" onSubmit={handleSubmit} noValidate aria-busy={loading}>
        <fieldset>
          <legend>Applicant Details</legend>

          <div className="field">
            <label htmlFor="applicant_name">Applicant name <span>required</span></label>
            <input
              id="applicant_name"
              ref={applicantNameRef}
              name="applicant_name"
              type="text"
              autoComplete="name"
              spellCheck={false}
              maxLength={160}
              value={form.applicant_name}
              onChange={handleChange}
              aria-invalid={fieldErrors.applicant_name ? "true" : undefined}
              aria-describedby={fieldErrors.applicant_name ? "applicant_name-error" : undefined}
            />
            {fieldErrors.applicant_name && (
              <p id="applicant_name-error" className="field-error">
                {fieldErrors.applicant_name}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="applicant_email">Applicant email <span>required</span></label>
            <input
              id="applicant_email"
              ref={applicantEmailRef}
              name="applicant_email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              maxLength={254}
              value={form.applicant_email}
              onChange={handleChange}
              aria-invalid={fieldErrors.applicant_email ? "true" : undefined}
              aria-describedby={fieldErrors.applicant_email ? "applicant_email-error" : undefined}
            />
            {fieldErrors.applicant_email && (
              <p id="applicant_email-error" className="field-error">
                {fieldErrors.applicant_email}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="company_name">Company name <span>required</span></label>
            <input
              id="company_name"
              ref={companyNameRef}
              name="company_name"
              type="text"
              autoComplete="organization"
              spellCheck={false}
              maxLength={180}
              value={form.company_name}
              onChange={handleChange}
              aria-invalid={fieldErrors.company_name ? "true" : undefined}
              aria-describedby={fieldErrors.company_name ? "company_name-error" : undefined}
            />
            {fieldErrors.company_name && (
              <p id="company_name-error" className="field-error">
                {fieldErrors.company_name}
              </p>
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend>Application Details</legend>

          <div className="field">
            <label htmlFor="application_type">Application type <span>required</span></label>
            <select
              id="application_type"
              ref={applicationTypeRef}
              name="application_type"
              value={form.application_type}
              onChange={handleChange}
              aria-invalid={fieldErrors.application_type ? "true" : undefined}
              aria-describedby={
                fieldErrors.application_type ? "application_type-error" : "application_type-help"
              }
            >
              <option value="">Select application type</option>
              {APPLICATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {fieldErrors.application_type ? (
              <p id="application_type-error" className="field-error">
                {fieldErrors.application_type}
              </p>
            ) : (
              <p id="application_type-help" className="field-help">
                Choose the filing category that matches the requested action.
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="description">Description <span>required</span></label>
            <textarea
              id="description"
              ref={descriptionRef}
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              maxLength={1200}
              aria-invalid={fieldErrors.description ? "true" : undefined}
              aria-describedby={fieldErrors.description ? "description-error" : "description-help"}
            />
            {fieldErrors.description ? (
              <p id="description-error" className="field-error">
                {fieldErrors.description}
              </p>
            ) : (
              <p id="description-help" className="field-help">
                {form.description.length}/1200 characters
              </p>
            )}
          </div>
        </fieldset>

        <div className="form-actions">
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Draft" : "Save Draft"}
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => navigate("/applications")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}

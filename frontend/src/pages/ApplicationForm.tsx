import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
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

  const [form, setForm] = useState({
    applicant_name: "",
    applicant_email: "",
    company_name: "",
    application_type: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit) {
      client.get(`/applications/${id}`).then((res) => {
        const { applicant_name, applicant_email, company_name, application_type, description } = res.data;
        setForm({ applicant_name, applicant_email, company_name, application_type, description });
      });
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await client.patch(`/applications/${id}`, form);
      } else {
        await client.post("/applications", form);
      }
      navigate("/applications");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px" }}>
      <h1>{isEdit ? "Edit Application" : "New Application"}</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          name="applicant_name"
          placeholder="Applicant Name"
          value={form.applicant_name}
          onChange={handleChange}
        />
        <input
          name="applicant_email"
          placeholder="Applicant Email"
          value={form.applicant_email}
          onChange={handleChange}
        />
        <input
          name="company_name"
          placeholder="Company Name"
          value={form.company_name}
          onChange={handleChange}
        />
        <select
          name="application_type"
          value={form.application_type}
          onChange={handleChange}
        >
          <option value="">Select Application Type</option>
          {APPLICATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          rows={4}
        />
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Draft" : "Save Draft"}
          </button>
          <button onClick={() => navigate("/applications")}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

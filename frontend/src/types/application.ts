export interface Application {
  id: number;
  tracking_number: string;
  applicant_name: string;
  applicant_email: string;
  company_name: string;
  application_type: string;
  description: string;
  status: string;
  reviewer_comment: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
}

export type ApplicationStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Need More Information"
  | "Approved"
  | "Rejected";

export type ApplicationType =
  | "Recordation"
  | "Renewal"
  | "Change of Ownership"
  | "Change of Name"
  | "Discontinuation";

export const STORAGE_KEY = "next-chapter-applications-v1";
export const STATUSES = ["Applied", "Interviewing", "Offer", "Rejected"];

export function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const parsed = new Date(`${value}T12:00:00`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}` ===
      value
  );
}

export function safeUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

export function validateApplication(application) {
  const errors = {};
  if (!application.company.trim()) errors.company = "Enter a company name.";
  if (!application.role.trim()) errors.role = "Enter a job title.";
  if (!validDate(application.date))
    errors.date = "Enter a valid application date.";
  else if (application.date > today())
    errors.date = "Use today or an earlier date.";
  if (application.url.trim() && !safeUrl(application.url.trim()))
    errors.url = "Enter a complete http:// or https:// link.";
  if (!STATUSES.includes(application.status))
    errors.status = "Choose a valid status.";
  return errors;
}

export function filterApplications(applications, query, status, sort) {
  const term = query.trim().toLowerCase();
  return applications
    .filter(
      (application) =>
        (status === "All" || application.status === status) &&
        `${application.company} ${application.role}`
          .toLowerCase()
          .includes(term),
    )
    .sort((a, b) =>
      sort === "company"
        ? a.company.localeCompare(b.company)
        : sort === "oldest"
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date),
    );
}

export function parseApplications(raw) {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Invalid saved data");
  const ids = new Set();
  for (const item of parsed) {
    if (
      !item ||
      typeof item.id !== "string" ||
      ids.has(item.id) ||
      !["company", "role", "date", "status", "url", "notes"].every(
        (key) => typeof item[key] === "string",
      ) ||
      !item.company.trim() ||
      !item.role.trim() ||
      !validDate(item.date) ||
      !STATUSES.includes(item.status)
    ) {
      throw new Error("Invalid saved application");
    }
    ids.add(item.id);
  }
  return parsed;
}

export function makeSamples() {
  const dateAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };
  return [
    {
      company: "Studio North",
      role: "Junior Frontend Developer",
      status: "Interviewing",
      date: dateAgo(3),
      notes: "Sample application: prepare a walkthrough of my React portfolio.",
    },
    {
      company: "Fern & Co.",
      role: "Graduate Software Developer",
      status: "Applied",
      date: dateAgo(1),
      notes:
        "Sample application: a product team focused on sustainable living.",
    },
    {
      company: "Orbit Labs",
      role: "Associate Web Developer",
      status: "Offer",
      date: dateAgo(12),
      notes:
        "Sample application: review the offer details and prepare questions.",
    },
    {
      company: "Common Ground",
      role: "Junior React Developer",
      status: "Applied",
      date: dateAgo(5),
      notes: "Sample application: submitted a portfolio and cover letter.",
    },
    {
      company: "Fieldwork",
      role: "Frontend Developer Intern",
      status: "Rejected",
      date: dateAgo(18),
      notes:
        "Sample application: keep practising JavaScript interview questions.",
    },
  ].map((application) => ({
    ...application,
    id: crypto.randomUUID(),
    url: "",
    sample: true,
  }));
}

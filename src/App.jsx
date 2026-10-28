import { useEffect, useRef, useState } from "react";
import {
  STORAGE_KEY,
  STATUSES,
  today,
  safeUrl,
  validateApplication,
  filterApplications,
  parseApplications,
  makeSamples,
} from "./applications.js";

function Icon({ name, size = 20, ...props }) {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    arrow: <path d="M7 17 17 7M7 7h10v10" />,
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="3" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12a22 22 0 0 0 18 0M12 12v3" />
      </>
    ),
    chat: (
      <path d="M21 11a8 8 0 0 1-8 8H8l-5 3v-6a8 8 0 0 1-1-5 9 9 0 0 1 19 0Z" />
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />
    ),
    edit: (
      <>
        <path d="m14 5 5 5M4 20l5-1L20 8a3.5 3.5 0 0 0-5-5L4 14Z" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    trash: (
      <>
        <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

function readInitialData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return { applications: raw ? parseApplications(raw) : [], error: "" };
  } catch {
    return {
      applications: [],
      error:
        "Saved applications could not be read. Existing browser data has been left untouched. Reload to retry; changes made now may replace it.",
    };
  }
}

function Modal({ children, titleId, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}

function ApplicationForm({ application, onSave, onClose }) {
  const editing = Boolean(application);
  const [form, setForm] = useState(
    application || {
      company: "",
      role: "",
      date: today(),
      status: "Applied",
      url: "",
      notes: "",
    },
  );
  const [errors, setErrors] = useState({});
  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: undefined });
  }
  function submit(event) {
    event.preventDefault();
    const nextErrors = validateApplication(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      event.currentTarget.elements[Object.keys(nextErrors)[0]]?.focus();
      return;
    }
    onSave({
      ...form,
      id: application?.id || crypto.randomUUID(),
      company: form.company.trim(),
      role: form.role.trim(),
      url: form.url.trim(),
      notes: form.notes.trim(),
    });
  }
  function field(name, label, type = "text", extra = {}) {
    return (
      <div className="field">
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          name={name}
          type={type}
          value={form[name]}
          onChange={change}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
          {...extra}
        />
        {errors[name] && (
          <span className="field-error" id={`${name}-error`}>
            {errors[name]}
          </span>
        )}
      </div>
    );
  }
  return (
    <Modal titleId="form-title" onClose={onClose}>
      <div className="modal-heading">
        <div>
          <p className="eyebrow">YOUR NEXT OPPORTUNITY</p>
          <h2 id="form-title">
            {editing ? "Edit application" : "Add an application"}
          </h2>
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close application form"
        >
          <Icon name="close" />
        </button>
      </div>
      <form onSubmit={submit} noValidate>
        {field("company", "Company *", "text", {
          placeholder: "e.g. Studio North",
          maxLength: 100,
          required: true,
          autoFocus: true,
        })}
        {field("role", "Job title *", "text", {
          placeholder: "e.g. Junior Frontend Developer",
          maxLength: 150,
          required: true,
        })}
        <div className="form-grid">
          {field("date", "Application date *", "date", {
            required: true,
            max: today(),
          })}
          <label className="field" htmlFor="status">
            Status
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={change}
            >
              {STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
        {field("url", "Job listing URL (optional)", "url", {
          placeholder: "https://…",
          maxLength: 2000,
        })}
        <label className="field" htmlFor="notes">
          Notes (optional)
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={change}
            rows="4"
            maxLength={3000}
            placeholder="People to contact, interview prep, or things to remember…"
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" type="submit">
            <Icon name="check" size={18} />
            {editing ? "Save changes" : "Add application"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export default function App() {
  const [initial] = useState(readInitialData);
  const [applications, setApplications] = useState(initial.applications);
  const [storageError, setStorageError] = useState(initial.error);
  const [revision, setRevision] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("newest");
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState("");
  const addRef = useRef(null);
  const lastFocus = useRef(null);

  // Only save after a user change, protecting unreadable data on initial load.
  useEffect(() => {
    if (!revision) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
      setStorageError("");
    } catch {
      setStorageError(
        "Changes are visible here but could not be saved in this browser. Keep this tab open and check your browser storage settings.",
      );
    }
  }, [applications, revision]);

  function commit(next, message) {
    setApplications(next);
    setRevision((value) => value + 1);
    setNotice(message);
  }
  function openEditor(application = null) {
    lastFocus.current = document.activeElement;
    setEditor({ application });
  }
  function closeEditor() {
    setEditor(null);
    requestAnimationFrame(() =>
      (lastFocus.current?.isConnected
        ? lastFocus.current
        : addRef.current
      )?.focus(),
    );
  }
  function save(application) {
    const exists = applications.some((item) => item.id === application.id);
    commit(
      exists
        ? applications.map((item) =>
            item.id === application.id ? application : item,
          )
        : [...applications, application],
      exists ? "Application updated." : "Application added.",
    );
    closeEditor();
  }
  function loadSamples() {
    commit(
      [...applications, ...makeSamples()],
      "Five sample applications added. You can edit or delete them.",
    );
    setQuery("");
    setStatus("All");
  }
  const visible = filterApplications(applications, query, status, sort);
  const interviews = applications.filter(
    (item) => item.status === "Interviewing",
  ).length;
  const offers = applications.filter((item) => item.status === "Offer").length;
  const hasSamples = applications.some((item) => item.sample);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to applications
      </a>
      <header className="topbar">
        <a className="brand" href="#main">
          <span className="brand-mark">
            N<span>↗</span>
          </span>
          <span>
            next chapter<span className="brand-dot">.</span>
          </span>
        </a>
        <span className="local-label">
          <span className="saved-dot" />
          Your personal job-search space
        </span>
      </header>
      <main id="main" tabIndex={-1}>
        <div className="page-intro">
          <div>
            <p className="eyebrow">SMALL STEPS. NEW POSSIBILITIES.</p>
            <h1>
              Your next chapter
              <br />
              starts here<span>.</span>
            </h1>
            <p className="intro-copy">
              A little organisation for your next big move.
              <br className="desktop-break" /> Keep every application,
              conversation, and opportunity in view.
            </p>
          </div>
          <div className="intro-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="art-star">✳</span>
            <span className="art-tag">One step closer ↗</span>
          </div>
        </div>
        <section className="stats" aria-label="Application overview">
          {[
            {
              label: "Total applications",
              value: applications.length,
              note: "Opportunities you’ve explored",
              icon: "briefcase",
              type: "total",
            },
            {
              label: "Interviewing",
              value: interviews,
              note: "Conversations in progress",
              icon: "chat",
              type: "interview",
            },
            {
              label: "Offers received",
              value: offers,
              note: "Reasons to celebrate",
              icon: "star",
              type: "offer",
            },
          ].map((stat) => (
            <div className={`stat ${stat.type}`} key={stat.label}>
              <div className="stat-top">
                <span>{stat.label}</span>
                <span className="stat-icon">
                  <Icon name={stat.icon} />
                </span>
              </div>
              <strong>{stat.value.toString().padStart(2, "0")}</strong>
              <p>{stat.note}</p>
            </div>
          ))}
        </section>
        {storageError && (
          <p className="storage-warning" role="alert">
            {storageError}
          </p>
        )}
        <section className="workspace" aria-labelledby="applications-title">
          <div className="workspace-heading">
            <div>
              <h2 id="applications-title">
                Your applications{" "}
                <span className="count-badge">{applications.length}</span>
              </h2>
              <p>Every opportunity, in one place.</p>
            </div>
            <div className="heading-actions">
              {!hasSamples && (
                <button className="button secondary" onClick={loadSamples}>
                  Load sample applications
                </button>
              )}
              <button
                ref={addRef}
                className="button primary"
                onClick={() => openEditor()}
              >
                <Icon name="plus" size={18} />
                Add application
              </button>
            </div>
          </div>
          <div className="toolbar">
            <label className="search">
              <Icon name="search" />
              <span className="sr-only">Search company or job title</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search company or job title…"
                type="search"
              />
            </label>
            <label className="sort">
              <span>Sort by</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="company">Company A–Z</option>
              </select>
            </label>
          </div>
          <div className="filter-row">
            <div
              className="filters"
              role="group"
              aria-label="Filter by application status"
            >
              {["All", ...STATUSES].map((value) => (
                <button
                  key={value}
                  aria-pressed={status === value}
                  onClick={() => setStatus(value)}
                >
                  {value}
                  {value === "All" && <span>{applications.length}</span>}
                </button>
              ))}
            </div>
            <span className="result-count" role="status">
              {visible.length}{" "}
              {visible.length === 1 ? "application" : "applications"}
            </span>
          </div>
          {visible.length > 0 ? (
            <div className="application-list">
              <div className="list-heading" aria-hidden="true">
                <span>COMPANY & ROLE</span>
                <span>DATE APPLIED</span>
                <span>STATUS</span>
                <span>ACTIONS</span>
              </div>
              {visible.map((application) => (
                <article
                  className="application-row"
                  key={application.id}
                  aria-label={`${application.role} at ${application.company}`}
                >
                  <div className="company-cell">
                    <span
                      className={`company-avatar avatar-${application.company.length % 4}`}
                      aria-hidden="true"
                    >
                      {application.company.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="company-info">
                      <h3>
                        {application.company}
                        {application.sample && (
                          <span className="sample-label">Sample</span>
                        )}
                      </h3>
                      <p>{application.role}</p>
                      {application.notes && (
                        <p className="application-notes">{application.notes}</p>
                      )}
                      {safeUrl(application.url) && (
                        <a
                          className="listing-link"
                          href={safeUrl(application.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Job listing <Icon name="arrow" size={13} />
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <time dateTime={application.date}>
                    {formatDate(application.date)}
                  </time>
                  <label
                    className={`status-select status-${application.status.toLowerCase()}`}
                  >
                    <span className="sr-only">
                      Status for {application.role} at {application.company}
                    </span>
                    <select
                      value={application.status}
                      onChange={(event) =>
                        commit(
                          applications.map((item) =>
                            item.id === application.id
                              ? { ...item, status: event.target.value }
                              : item,
                          ),
                          "Application status updated.",
                        )
                      }
                    >
                      {STATUSES.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      onClick={() => openEditor(application)}
                      aria-label={`Edit ${application.role} at ${application.company}`}
                    >
                      <Icon name="edit" size={18} />
                    </button>
                    <button
                      className="icon-button delete-button"
                      onClick={() => {
                        lastFocus.current = document.activeElement;
                        setDeleting(application);
                      }}
                      aria-label={`Delete ${application.role} at ${application.company}`}
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <Icon
                  name={applications.length ? "search" : "briefcase"}
                  size={30}
                />
              </span>
              <h3>
                {applications.length
                  ? "No matching applications"
                  : "A fresh start, full of possibility."}
              </h3>
              <p>
                {applications.length
                  ? "Try a different search or status to find what you’re looking for."
                  : "Add your first application, or explore the dashboard with sample data."}
              </p>
              {applications.length ? (
                <button
                  className="button secondary"
                  onClick={() => {
                    setQuery("");
                    setStatus("All");
                  }}
                >
                  Clear filters
                </button>
              ) : (
                <button className="button secondary" onClick={loadSamples}>
                  Try sample applications <Icon name="arrow" size={16} />
                </button>
              )}
            </div>
          )}
          <div className="workspace-footer">
            <span>
              <span className="saved-dot" />
              {storageError
                ? "Browser storage needs attention"
                : "Stored in this browser · no account needed"}
            </span>
            {hasSamples && (
              <button
                className="text-button"
                onClick={() =>
                  commit(
                    applications.filter((item) => !item.sample),
                    "Sample applications removed. Your own applications were kept.",
                  )
                }
              >
                Remove sample data
              </button>
            )}
          </div>
        </section>
        <aside className="encouragement">
          <span aria-hidden="true">✳</span>
          <p>
            Your next opportunity is out there.{" "}
            <strong>Keep showing up.</strong>
          </p>
        </aside>
        <p className="notice" role="status">
          {notice}
        </p>
      </main>
      <footer className="page-footer">
        <span>next chapter.</span>
        <p>Built with React & Vite. Made for moving forward.</p>
        <p>
          Data stays on this device and browser. Clearing site data removes it.
        </p>
      </footer>
      {editor && (
        <ApplicationForm
          application={editor.application}
          onSave={save}
          onClose={closeEditor}
        />
      )}
      {deleting && (
        <Modal
          titleId="delete-title"
          onClose={() => {
            setDeleting(null);
            requestAnimationFrame(() => lastFocus.current?.focus());
          }}
        >
          <div className="delete-dialog">
            <span className="empty-icon">
              <Icon name="trash" size={28} />
            </span>
            <h2 id="delete-title">Delete this application?</h2>
            <p>
              <strong>{deleting.role}</strong> at {deleting.company} will be
              removed. This cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="button secondary"
                autoFocus
                onClick={() => {
                  setDeleting(null);
                  requestAnimationFrame(() => lastFocus.current?.focus());
                }}
              >
                Keep application
              </button>
              <button
                className="button danger"
                onClick={() => {
                  commit(
                    applications.filter((item) => item.id !== deleting.id),
                    "Application deleted.",
                  );
                  setDeleting(null);
                  requestAnimationFrame(() => addRef.current?.focus());
                }}
              >
                Delete application
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

# Next Chapter — Job Application Tracker

A portfolio project built with React, Vite, JavaScript, and CSS. No backend or account is needed.

## Run in Visual Studio Code

1. Open this folder (the folder containing package.json) in VS Code.
2. Open Terminal → New Terminal.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the Local address printed in the terminal.

Use a current Node.js LTS release (Vite 7 requires Node 20.19+ or 22.12+). If PowerShell blocks npm.ps1, select Command Prompt from the VS Code terminal dropdown, or use `npm.cmd` in place of `npm`.

## Features

- Add, edit, and delete applications with validated company, title, date, and job URL fields.
- Update status directly from each application card.
- Search company and title; filter by status; sort by date or company.
- Automatically calculated totals, interview counts, and offer counts.
- Save applications in localStorage with visible storage failure messages.
- Load and remove clearly marked fictional sample applications without deleting personal entries.
- Responsive mobile cards, keyboard-accessible modal forms, and reduced-motion support.

Data is stored only in the current browser profile for this website address. It does not sync across devices. Clearing browser site data removes applications. Avoid using this first version as your only record of important applications. This version has no login, backend, reminders, or export feature.

## Understand the code

- `src/App.jsx`: components, form interactions, state updates, and persistence.
- `src/applications.js`: validation, searching, sorting, safe links, and sample data.
- `src/App.css`: layout, responsive styling, and component styles.
- `tests/applications.test.js`: tests for validation, filtering, and saved-data parsing.

Start by reading ApplicationForm and following how onSave sends a new application back to App. Then inspect filterApplications to understand how search and status work together. Tailor the visual design and add a feature you can explain in interviews before presenting this as your own portfolio work.

## Check and build

Run `npm test` for the data-logic tests. Run `npm run build` to create a production build in dist. Run `npm run preview` to preview the built app. You can deploy to Vercel using Vite, with build command `npm run build` and output directory `dist`.

## Portfolio description

“A responsive job application dashboard built with React and Vite. Features reusable components, validated forms, application status updates, combined search and filtering, and browser-local persistence.”

Google Fonts are used when available; system font fallbacks work offline. The app itself does not send application records to a backend.

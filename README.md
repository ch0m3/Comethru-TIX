# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.




Only organizers log in. Removed customer accounts entirely — no customer login, register, dashboard, or navbar. The public nav now just shows Browse Events / About / Contact / Organizer Login. Admin still exists but /admin/login is never linked anywhere — you have to know the URL, and every /api/admin/* route stays protected on the backend regardless.

Guest checkout with printed tickets. On an event page, you pick a ticket type, choose a quantity, and enter name/email/phone right there — no account needed. That submits straight to a new public create_booking endpoint, which redirects to /booking/:id: a ticket confirmation page showing those exact details, with a working "Print Ticket" button (backed by a @media print rule that hides the nav/buttons).



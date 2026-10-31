# International Student Hub (React)

A small React/Vite implementation of Task 2: build a personal transition checklist.

## Requirements
- Node.js (LTS recommended) and npm
- Internet connection for the first dependency installation

Having React installed in another project does not automatically install it here. This project includes its own dependencies.

## Run on Windows
1. Extract `transition-hub-react.zip`.
2. Open the extracted `transition-hub-react` folder in VS Code.
3. Open Terminal > New Terminal.
4. Run:

   ```powershell
   npm install
   npm run dev
   ```

5. Open the local address Vite prints (usually http://localhost:5173).

## Build a production version
```powershell
npm run build
```
The generated website files will be in `dist/`.

## Included interactions
- Home page with navigation to checklist creation and help topics
- Select a transition type
- Enter current status, target status, and expected date
- Generate sample tasks
- Mark tasks complete and edit suggested dates
- View completion dashboard and download checklist as text
- Save progress in browser localStorage

## Notes
- Data is saved in the browser on the same computer/browser; it is not shared between teammates.
- The sample tasks and dates are illustrative only, not official immigration instructions or legal advice.
- Confirm individual requirements and deadlines with UTD International Student Services Office (ISSO).
- The prototype uses hardcoded sample task templates and does not use a backend/database.

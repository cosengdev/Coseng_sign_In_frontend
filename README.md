# COSENG Limited — Staff Access & Attendance System (Frontend)

## Tech Stack
- **React 18** with Vite
- **React Router v6** for page navigation
- **Axios** for API calls
- **CSS Modules** for scoped styling

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx       # App shell with header
│   ├── FormCard.jsx     # Consistent page card wrapper
│   ├── Field.jsx        # Input, Select, FieldRow
│   ├── Button.jsx       # Styled button (primary/danger/outline)
│   ├── Alert.jsx        # Info/success/error/warning banners
│   └── ActivityTable.jsx  # Today's sign in/out log
│
├── pages/               # One file per screen
│   ├── Home.jsx         # Landing: Staff / Visitor buttons
│   ├── BadgeLookup.jsx  # Badge number entry
│   ├── SignUp.jsx       # New staff registration
│   ├── ConfirmSignIn.jsx  # Returning staff confirm & sign in
│   ├── SignOut.jsx      # Sign out with phone verification
│   └── Success.jsx      # Confirmation screen
│
├── hooks/
│   └── useClock.js      # Live clock hook
│
└── utils/
    ├── api.js           # All backend API calls (Axios)
    ├── time.js          # Date/time formatting helpers
    └── constants.js     # Staff roles list
```

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the frontend
```bash
npm run dev
```
Opens at **http://localhost:3000**

> The frontend proxies all `/api` requests to your backend at `http://localhost:5000`.
> Make sure your backend is running before testing the full flow.

---

## Backend API Contract

All requests go through `/api`. The proxy is configured in `vite.config.js`.

| Method | Endpoint                    | Body / Params                        | Response                                 |
|--------|-----------------------------|--------------------------------------|------------------------------------------|
| GET    | `/api/staff/:badgeNumber`   | —                                    | Staff object + `isSignedInToday: bool`   |
| POST   | `/api/staff`                | `{ badgeNumber, firstName, lastName, phone, role }` | Created staff object      |
| POST   | `/api/attendance/signin`    | `{ badgeNumber }`                    | `{ success: true }`                      |
| POST   | `/api/attendance/signout`   | `{ badgeNumber, phone }`             | `{ success: true }` or 401 if phone wrong |
| GET    | `/api/attendance/today`     | —                                    | `[{ name, role, signIn, signOut }]`      |

**404** on `GET /api/staff/:badgeNumber` → redirect to registration screen.
**401** on `POST /api/attendance/signout` → wrong phone number error shown to user.

---

## Build for Production
```bash
npm run build
```
Output goes to `/dist`. Serve it with any static file server or deploy to Vercel/Netlify.

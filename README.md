# ERP Sales & Customer Management System

A production-ready full-stack Enterprise Resource Planning (ERP) module focused on Sales, Customer profiles, Inventory catalogs, and order workflows. Built with a React + Vite + TypeScript frontend and Node.js + Express + TypeScript + MongoDB backend.

---

## 🚀 Live Demo & Credentials

The system includes pre-seeded roles with default demo logins:

| User Role | Email Login | Default Password | Permissions |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@erp.com` | `admin123` | Full access, Product CRUD, User roles, Audit logs. |
| **Sales Manager** | `manager@erp.com` | `manager123` | Customer CRUD, Orders CRUD, Read products, reports. |
| **Sales Representative** | `rep@erp.com` | `rep123` | Customer Create/Read/Update, Order Create/Read. |

---

## 🛠️ Technology Stack

### Frontend
- **React 19 & Vite 8**: Modern rendering and fast bundles.
- **Tailwind CSS v4**: Utility-first layouts.
- **React Router v6**: Route guards and layouts.
- **TanStack Query (React Query) v5**: Server state management and caching.
- **React Hook Form & Zod**: Form bindings and validations.
- **Recharts**: Analytical reports visualization.
- **Axios**: Network client.

### Backend
- **Node.js & Express**: API server.
- **TypeScript**: Strict type check compilation.
- **Mongoose & MongoDB**: Object modeling and document database.
- **JWT & bcryptjs**: Authentication and credential hashing.
- **Helmet, CORS, express-rate-limit**: HTTP security and rate limits.

---

## 📐 Architecture & Key Design Decisions

```text
React Component
      ↓
TanStack Query Hook
      ↓
Service Function (e.g. customers.ts)
      ↓
Axios Interceptor Client
      ↓
REST Backend API (Node / Express / MongoDB)
```

1. **Centralized API Client Interceptor**: Raw API calls never exist inside React components. All calls route through `axiosInstance.ts` which automatically attaches tokens and handles server errors.
2. **Transaction-based Inventory Verification**: Creating orders checks product stock. Updating order status to `Confirmed` decrements stock inside a database transaction, avoiding double-deductions. Status cancellation releases stock.
3. **Role-Based Access Control (RBAC)**: Enforced via backend middleware (`role.middleware.ts`) and verified on the frontend routes layer for optimal UX.
4. **Debounced Server Search & Pagination**: All data tables filter, sort, paginate, and search server-side to handle scale.
5. **Zero-Dependency PDF Invoice Printing**: HTML invoice printing opens in a clean window, providing print layouts without heavy library binaries.

---

## 📂 Project Structure

```text
IIB Tech/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection & Zod Env parses
│   │   ├── middleware/      # Auth, Role, Error & Rate Limiters
│   │   ├── models/          # User, Customer, Product, SalesOrder, AuditLog
│   │   ├── modules/         # Modular Routes, Controllers & Services
│   │   ├── types/           # TS Interfaces
│   │   ├── seed.ts          # DB Initializer script
│   │   └── server.ts        # Server entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Router, Providers & QueryClient
│   │   ├── components/      # Reusable UI, Tables, Layouts & Feedback
│   │   ├── features/        # Auth, Customers, Products, Orders & Analytics
│   │   ├── hooks/           # TanStack Query custom wrappers
│   │   ├── services/        # Centralized HTTP request handlers
│   │   └── types/           # Shared API types
│   └── package.json
```

---

## 🔧 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017, or custom URI)

### Setup Instructions

1. **Clone and Install Backend**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file (copied from `.env.example`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/erp-sales-system
   JWT_SECRET=supersecretjwttokenerpsales2026
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```

2. **Compile and Seed the Database**:
   ```bash
   npm run build
   npm run seed
   ```

3. **Start Backend Server**:
   ```bash
   npm run dev
   ```

4. **Install and Run Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Access the web client at `http://localhost:5173`.

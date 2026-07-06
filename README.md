# Amazon Orders Dashboard

A full-stack order management and analytics platform built with **Node.js + Express + MongoDB** backend and a **React (Vite)** admin dashboard frontend. The system processes a real-world Amazon e-commerce dataset of **21,628+ orders** with comprehensive CRUD, search, analytics, and visualization capabilities.

---

## Live Links

| Resource | URL |
|----------|-----|
| Frontend (Vercel) | [https://amazon-orders-patel-manan-nileshbha.vercel.app](https://amazon-orders-patel-manan-nileshbha.vercel.app/login) |
| Backend API (Render) | [https://amazon-orders.onrender.com](https://amazon-orders.onrender.com) |
| API Documentation | [Postman Collection](https://documenter.getpostman.com/view/50840763/2sBXwntsU8#78bc843d-e6ac-48eb-8e5e-4c8c3265ea24) |
| Dataset | [Google Drive (21,628 orders)](https://drive.google.com/file/d/1U5BQP1mxjSau2Z2ni69n-LFw56lXldPf/view) |

---

## Tech Stack

### Backend
| Technology | Version |
|------------|---------|
| Node.js | >=18 |
| Express.js | 5.2.1 |
| MongoDB (Atlas) | via Mongoose 9.6.2 |
| JWT Authentication | jsonwebtoken 9.0.3 |
| Password Hashing | bcryptjs 3.0.3 |
| Validation | express-validator 7.3.2 |
| Pagination | mongoose-paginate-v2 1.8.0 |
| Security | helmet 8.1.0, cors, express-rate-limit |

### Frontend
| Technology | Version |
|------------|---------|
| React | 19.2.6 |
| Vite | 8.0.12 |
| Tailwind CSS | 3.4.19 |
| Material UI (MUI) | 9.1.0 |
| Redux Toolkit | 2.12.0 |
| React Router | 7.17.0 |
| Axios | 1.17.0 |
| Recharts | 3.8.1 |
| Formik + Yup | 2.4.9 / 1.7.1 |
| react-toastify | 11.1.0 |
| react-helmet-async | 3.0.0 |
| react-icons (Feather) | 5.6.0 |

---

## Features

### Backend API (200+ endpoints)
- **Authentication** — Register, login, JWT tokens, session management, password reset, email verification
- **Orders CRUD** — Full lifecycle with pagination, sorting, filtering, search (15+ search modes), bulk operations
- **Analytics** — Revenue totals/trends, order status breakdowns, payment distribution, return rates, discount usage
- **Stats** — Daily/monthly/yearly aggregates for revenue, orders, products, customers, shipping
- **Dashboard** — Pre-composed overview, revenue, orders, customers, and product dashboard endpoints
- **Admin Management** — User management, role changes, ban/unban, system reports, health diagnostics
- **Shipping** — Tracking, status updates, delivery estimates, carrier management
- **Trending** — Top products and categories (30-day window)
- **Recommendations** — Product recommendations by customer
- **Notifications & Activity** — User notifications, system activity logs

### Frontend Dashboard
- **Analytics Dashboard** — 6 KPI stat cards (Revenue, Orders, Avg Order Value, Return Rate, Revenue Velocity, System Health) with 4 interactive charts (Revenue AreaChart, Orders BarChart, Status DonutChart, Payment Distribution BarChart)
- **Order Management** — Full data table with pagination, search, sort, filters, CRUD modal forms
- **User Management** (Admin) — User listing with ban/unban and role-change controls
- **Advanced Search** — Multi-field search with fuzzy, autocomplete, and highlighted results
- **Authentication** — Login/register with JWT, auto-login on refresh, session management
- **Dark/Light Theme** — Persisted to localStorage, toggleable from navbar
- **Responsive Layout** — Mobile hamburger menu, sidebar navigation, adaptive grids
- **Loading States** — Skeleton loaders, global progress bar, toast notifications
- **Route Guards** — Public, authenticated, and admin-only route protection

---

## Architecture

```
amazon_orders_patel_manan_nileshbhai/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express app (middleware, routes)
│   │   ├── server.js               # Entry point (DB connect, HTTP server)
│   │   ├── config/                 # db.js, env.js
│   │   ├── controllers/            # 20 route handlers
│   │   ├── middlewares/            # auth, admin, error middleware
│   │   ├── models/                 # User, Order, Session, Notification, ActivityLog
│   │   ├── routes/                 # 19 route files (health, auth, orders, analytics, etc.)
│   │   ├── services/               # Business logic layer
│   │   ├── validations/            # express-validator schemas
│   │   └── utils/                  # ApiResponse, ApiError, asyncHandler, pagination
│   └── .env                        # Environment configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI (StatCard, DataTable, Modal, Charts, etc.)
│   │   ├── pages/                  # Route-level views (Dashboard, Login, Orders, etc.)
│   │   ├── features/               # Redux slices (auth, orders, analytics, users, ui)
│   │   ├── layouts/                # AuthLayout, DashboardLayout
│   │   ├── routes/                 # AppRoutes + route guards
│   │   ├── services/               # Axios instance + auth service
│   │   └── store/                  # Redux store configuration
│   └── .env                        # VITE_API_URL
│
└── README.md
```

---

## API Endpoint Overview

All endpoints are prefixed with `/api/v1`. See the full [Postman Documentation](https://documenter.getpostman.com/view/50840763/2sBXwntsU8#78bc843d-e6ac-48eb-8e5e-4c8c3265ea24) for complete details.

### Authentication (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new user |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/logout` | Destroy session |
| GET | `/auth/profile` | Get current user |
| PATCH | `/auth/profile` | Update profile |
| POST | `/auth/change-password` | Change password |
| POST | `/auth/forgot-password` | Send reset OTP |
| POST | `/auth/reset-password` | Reset password |
| GET | `/auth/sessions` | Active sessions |
| DELETE | `/auth/sessions/:id` | Terminate session |

### Orders (`/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List (paginated, filtered, sorted) |
| GET | `/orders/paged` | Paginated listing (default 50) |
| GET | `/orders/recent` | Recent orders |
| GET | `/orders/cancelled` | Cancelled orders |
| GET | `/orders/refunded` | Refunded orders |
| GET | `/orders/customer/:id` | By customer |
| GET | `/orders/product/:id` | By product |
| POST | `/orders` | Create order |
| GET | `/orders/:id` | Get by ID |
| PUT | `/orders/:id` | Full update |
| PATCH | `/orders/:id` | Partial update |
| PATCH | `/orders/:id/status` | Update status |
| DELETE | `/orders/:id` | Delete order |
| POST | `/orders/:id/cancel` | Cancel order |
| POST | `/orders/:id/duplicate` | Duplicate order |
| GET | `/orders/:id/invoice` | Generate invoice |
| GET | `/orders/:id/history` | Status history |

### Search (`/orders/search`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders/search` | Full-text search (`q` param) |
| GET | `/orders/search/customer` | By customer name |
| GET | `/orders/search/product` | By product name |
| GET | `/orders/search/category` | By category |
| GET | `/orders/search/brand` | By brand |
| GET | `/orders/search/status` | By status |
| GET | `/orders/search/payment` | By payment method |
| GET | `/orders/search/location` | By city/state/country |
| GET | `/orders/search/date` | By date range |
| GET | `/orders/search/tracking` | By OrderID |
| GET | `/orders/search/fuzzy` | Fuzzy search |
| GET | `/orders/search/autocomplete` | Autocomplete |
| GET | `/orders/search/highlight` | Highlight results |

### Analytics (`/analytics`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/revenue/total` | Total revenue |
| GET | `/analytics/revenue/monthly` | Monthly revenue |
| GET | `/analytics/revenue/yearly` | Yearly revenue |
| GET | `/analytics/orders/average-value` | Avg order value |
| GET | `/analytics/orders/count` | Order status breakdown |
| GET | `/analytics/orders/cancelled` | Cancelled analytics |
| GET | `/analytics/orders/refunded` | Refund analytics |
| GET | `/analytics/customers/top` | Top customers |
| GET | `/analytics/products/top-selling` | Top products |
| GET | `/analytics/products/low-selling` | Low sellers |
| GET | `/analytics/categories/top` | Top categories |
| GET | `/analytics/payments/distribution` | Payment methods |
| GET | `/analytics/locations/top-cities` | Top cities |
| GET | `/analytics/returns/rate` | Return rate |
| GET | `/analytics/discounts/usage` | Discount usage |

### Stats (`/stats`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats/revenue/total` | Total revenue |
| GET | `/stats/revenue/daily` | Daily revenue |
| GET | `/stats/revenue/monthly` | Monthly revenue |
| GET | `/stats/revenue/yearly` | Yearly revenue |
| GET | `/stats/orders/total` | Total orders |
| GET | `/stats/orders/daily` | Daily orders |
| GET | `/stats/orders/monthly` | Monthly orders |
| GET | `/stats/orders/yearly` | Yearly orders |
| GET | `/stats/products/count` | Product count |
| GET | `/stats/customers/count` | Customer count |
| GET | `/stats/categories/count` | Category count |
| GET | `/stats/refunds/count` | Refund count |
| GET | `/stats/cancellations/count` | Cancellation count |
| GET | `/stats/shipping/average-time` | Avg shipping time |
| GET | `/stats/system/performance` | System health |

### Dashboard (`/dashboard`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/overview` | Composed overview |
| GET | `/dashboard/revenue` | Revenue summary |
| GET | `/dashboard/orders` | Orders summary |
| GET | `/dashboard/customers` | Customer summary |
| GET | `/dashboard/products` | Product summary |

### Admin (`/admin`) — JWT + Admin Role Required
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List all users |
| GET | `/admin/users/:id` | Get user |
| PATCH | `/admin/users/:id/role` | Change role |
| PATCH | `/admin/users/:id/ban` | Ban user |
| PATCH | `/admin/users/:id/unban` | Unban user |
| GET | `/admin/orders` | All orders |
| GET | `/admin/reports/sales` | Sales report |
| GET | `/admin/reports/revenue` | Revenue report |
| GET | `/admin/system/health` | Health diagnostics |

---

## Setup & Installation

### Prerequisites
- Node.js **18+**
- MongoDB (local or [Atlas](https://www.mongodb.com/cloud/atlas))
- Git

### 1. Clone the Repository
```bash
git clone <repo-url>
cd amazon_orders_patel_manan_nileshbhai
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
npm run dev
```

Server starts at `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:5000/api/v1
npm run dev
```

Server starts at `http://localhost:5173`.

### Environment Variables

#### Backend (`backend/.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | Environment |
| `MONGODB_URI` | mongodb://localhost:27017/amazon-ecommerce | MongoDB connection |
| `JWT_SECRET` | (change in production) | JWT signing secret |
| `JWT_EXPIRE` | 7d | Token expiry |
| `CORS_ORIGIN` | * | Allowed origins |
| `LOG_LEVEL` | info | Logging level |

#### Frontend (`frontend/.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | http://localhost:5000/api/v1 | Backend API URL |
| `VITE_APP_NAME` | Amazon Orders Dashboard | App display name |

---

## NPM Scripts

### Backend
| Script | Description |
|--------|-------------|
| `npm run dev` | Development with nodemon |
| `npm start` | Production start |
| `npm run health` | Quick health check |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check |

---

## Deployment

- **Backend** — Deployed on [Render](https://amazon-orders.onrender.com). Set environment variables in Render dashboard.
- **Frontend** — Deployed on [Vercel](https://amazon-orders-patel-manan-nileshbha.vercel.app). `vercel.json` includes SPA rewrites. Set `VITE_API_URL` in Vercel project settings.

---

## Dataset

The project uses a real-world Amazon e-commerce dataset containing **21,628 orders** with the following fields:

- Order ID, Customer ID/Name, Product ID/Name
- Category, Brand, Quantity, Unit Price
- Discount, Tax, Shipping Cost, Total Amount
- Order Date, Payment Method, Order Status
- City, State, Country, Seller ID
- Status History (audit trail)

[Download Dataset](https://drive.google.com/file/d/1U5BQP1mxjSau2Z2ni69n-LFw56lXldPf/view)

---

## Dashboard Features

### Analytics Dashboard
- **6 KPI Cards**: Total Revenue (₹1.85Cr), Total Orders (21,628), Avg Order Value, Return Rate, Revenue Velocity, System Health
- **Revenue Trend**: Monthly revenue area chart with gradient fill
- **Monthly Orders**: Bar chart showing order volume over time
- **Order Status**: Donut chart with Pending/Shipped/Delivered/Cancelled/Returned breakdown
- **Payment Distribution**: Horizontal bar chart showing revenue by payment method
- **Recent Orders**: Real-time list with status badges

### Order Management
- Paginated data table with 10+ filterable columns
- Search by customer, product, brand, category, status, payment method, location, date
- Sort by amount, date, quantity, discount
- Full CRUD via modal forms
- Bulk operations (create, update, delete, status change, archive)
- Invoice generation and status history tracking

### User Management (Admin)
- User listing with pagination and search
- Role change (user ↔ admin)
- Ban/unban controls
- System health monitoring

---

## Author

**Patel Manan Nileshbhai** — Full Stack Dashboard Project (2026)

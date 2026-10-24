# Warehouse Management System

A simple React + Node.js + MongoDB warehouse management project.

## Technologies
- Frontend: React, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Authentication: JWT

## Important
This version does **not** use GraphQL, Apollo, REST API architecture, Socket.IO, or seed data.
The frontend keeps the same Admin/User pages and sends simple named actions to the Express server. The server performs all MongoDB operations through Mongoose.

## Folder Structure
```text
warehouse-management/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── layouts/
    │   ├── pages/
    │   │   ├── admin/
    │   │   ├── auth/
    │   │   └── user/
    │   ├── services/
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── tailwind.config.js
```

## MongoDB
The backend uses:
`mongodb://localhost:27017/wms`

Make sure MongoDB is running. No seed command is required. Users and products are created through the application and saved directly in MongoDB.

## Run
### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Features
### Admin
- Dashboard
- Add Product
- Edit/Delete Product
- Stock In
- Stock Out
- Low Stock
- Purchase Request approval/rejection
- User management
- Profile

### User
- Dashboard
- Inventory
- Create Purchase Request
- View Purchase Requests
- Profile

### Fixed in this version
- Admin can add a new product and it is saved in MongoDB.
- User can request a product.
- Admin can approve/reject user requests.
- Stock changes are saved in MongoDB.
- No seed data is required.

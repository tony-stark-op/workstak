# WorkStak 🚀

WorkStak is a modern, full-stack Project Management Platform designed for agile teams. It features a responsive Kanban board, realtime updates, advanced task assignment, and analytics.

![WorkStak Banner](/client/public/globe.svg)

## ✨ Features

- **🔐 Secure Authentication**: Domain-restricted access (`@cloudbyadi.com`), auto-generated passwords, and forced password changes.
- **📊 Analytics Dashboard**: Visual insights into task distribution and team velocity using Chart.js.
- **📋 Kanban Board**: Drag-and-drop task management powered by `@dnd-kit`.
- **👥 Advanced Assignment**: Azure-style user search and assignment interface.
- **📁 File Attachments**: Upload and manage task attachments.
- **🔗 Repository Integration**: Link GitHub/Azure repositories to your projects.
- **📱 Fully Responsive**: Optimized for Mobile, Tablet, and Desktop.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Zustand, React Query
- **Icons**: Lucide React
- **Charts**: Chart.js

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Realtime**: Socket.IO
- **Email**: Nodemailer

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas URI
- SMTP Credentials (for emails)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/tony-stark-op/workstak.git
    cd workstak
    ```

2.  **Install Dependencies:**
    ```bash
    # Root (if using monorepo tools) or separate folders:
    cd server && npm install
    cd ../client && npm install
    ```

3.  **Environment Variables:**

    Create `server/.env`:
    ```env
    PORT=5001
    MONGO_URI=your_mongo_uri
    JWT_SECRET=your_secret
    CLIENT_URL=http://localhost:3000
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your_email
    SMTP_PASS=your_app_password
    ```

    Create `client/.env.local`:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
    ```

4.  **Run Locally:**

    Start Backend:
    ```bash
    cd server
    npm run dev
    ```

    Start Frontend:
    ```bash
    cd client
    npm run dev
    ```

    Visit `http://localhost:3000`.

## 📦 Deployment

### Frontend (Vercel)
Connect your GitHub repo to Vercel. Set `Root Directory` to `client`.
Add `NEXT_PUBLIC_API_URL` environment variable.

### Backend (Render)
Connect your GitHub repo to Render. Set `Root Directory` to `server`.
Add all backend environment variables (`MONGO_URI`, etc.).

## 📝 License

This project is licensed under the MIT License.

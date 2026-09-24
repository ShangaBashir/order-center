# Global Order Center - Full Stack App

This repository contains the complete full-stack application built with:
- **Frontend**: React.js + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express.js + TypeScript + MongoDB + JWT Auth

## Project Structure

- `/frontend` - React application
- `/backend` - Node.js REST API

## Setup Instructions

### 1. Backend Setup

1. Open a terminal and navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Start MongoDB on your machine (default connects to \`mongodb://localhost:27017/global-order\`). You can change the connection string in \`backend/.env\`.
4. Start the backend development server:
   \`\`\`bash
   npm run dev
   \`\`\`
   The API will run on \`http://localhost:5000\`.

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Start the Vite development server:
   \`\`\`bash
   npm run dev
   \`\`\`
   The frontend will run on \`http://localhost:5173\`.

### Features Implemented
- User authentication (JWT Register/Login)
- MongoDB integration with Mongoose schemas
- React Router DOM navigation
- Custom dashboard for logged-in users to place orders
- Tailwind CSS custom brand styling
- TypeScript strict typing across both ends

const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const backendDir = path.join(baseDir, 'backend');
const frontendDir = path.join(baseDir, 'frontend');

// Create directories
const dirs = [
  backendDir,
  path.join(backendDir, 'src'),
  path.join(backendDir, 'src', 'models'),
  path.join(backendDir, 'src', 'routes'),
  path.join(backendDir, 'src', 'middleware'),
  frontendDir,
  path.join(frontendDir, 'src'),
  path.join(frontendDir, 'src', 'components'),
  path.join(frontendDir, 'src', 'pages'),
  path.join(frontendDir, 'src', 'api'),
];

dirs.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ================= BACKEND FILES =================

const backendPackageJson = {
  "name": "shipping-backend",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts",
    "build": "tsc"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/bcryptjs": "^2.4.4",
    "typescript": "^5.2.2",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1"
  }
};
fs.writeFileSync(path.join(backendDir, 'package.json'), JSON.stringify(backendPackageJson, null, 2));

const backendTsConfig = {
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
};
fs.writeFileSync(path.join(backendDir, 'tsconfig.json'), JSON.stringify(backendTsConfig, null, 2));

fs.writeFileSync(path.join(backendDir, '.env'), `PORT=5000\nMONGO_URI=mongodb://localhost:27017/global-order\nJWT_SECRET=supersecretjwtkey\n`);

fs.writeFileSync(path.join(backendDir, 'src', 'index.ts'), `
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/global-order';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
`);

fs.writeFileSync(path.join(backendDir, 'src', 'models', 'User.ts'), `
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
`);

fs.writeFileSync(path.join(backendDir, 'src', 'models', 'Order.ts'), `
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productLink: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Purchased', 'In Transit', 'Delivered'], default: 'Pending' },
  trackingNumber: { type: String },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
`);

fs.writeFileSync(path.join(backendDir, 'src', 'middleware', 'auth.ts'), `
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string, role: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey') as { id: string, role: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
`);

fs.writeFileSync(path.join(backendDir, 'src', 'routes', 'auth.ts'), `
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
`);

fs.writeFileSync(path.join(backendDir, 'src', 'routes', 'orders.ts'), `
import { Router } from 'express';
import Order from '../models/Order';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Create order
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { productLink } = req.body;
    const order = new Order({ userId: req.user?.id, productLink });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
`);

// ================= FRONTEND FILES =================

const frontendPackageJson = {
  "name": "shipping-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.5.0",
    "lucide-react": "^0.279.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.15",
    "postcss": "^8.4.29",
    "tailwindcss": "^3.3.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
};
fs.writeFileSync(path.join(frontendDir, 'package.json'), JSON.stringify(frontendPackageJson, null, 2));

const frontendTsConfig = {
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
};
fs.writeFileSync(path.join(frontendDir, 'tsconfig.json'), JSON.stringify(frontendTsConfig, null, 2));

const frontendTsConfigNode = {
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
};
fs.writeFileSync(path.join(frontendDir, 'tsconfig.node.json'), JSON.stringify(frontendTsConfigNode, null, 2));

fs.writeFileSync(path.join(frontendDir, 'vite.config.ts'), `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`);

fs.writeFileSync(path.join(frontendDir, 'tailwind.config.js'), `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#711612',
        bg: '#EBEAE8',
        accent: '#D4AF37',
        text: '#2C2C2C',
      },
    },
  },
  plugins: [],
}
`);

fs.writeFileSync(path.join(frontendDir, 'postcss.config.js'), `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`);

fs.writeFileSync(path.join(frontendDir, 'index.html'), `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Global Order Center</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

fs.writeFileSync(path.join(frontendDir, 'src', 'index.css'), `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-bg text-text antialiased;
}

.btn-primary {
  @apply bg-accent text-white px-6 py-2 rounded-md font-medium hover:bg-yellow-600 transition;
}
`);

fs.writeFileSync(path.join(frontendDir, 'src', 'main.tsx'), `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
`);

fs.writeFileSync(path.join(frontendDir, 'src', 'api', 'api.ts'), `
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

export default api;
`);

fs.writeFileSync(path.join(frontendDir, 'src', 'components', 'Header.tsx'), `
import React from 'react';
import { Link } from 'react-router-dom';
import { Package, LogOut } from 'lucide-react';

export default function Header({ isAuthenticated, onLogout }: { isAuthenticated: boolean, onLogout: () => void }) {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center">
      <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-brand font-bold text-xl">
          <Package /> Global Order
        </Link>
        <nav className="flex gap-4 items-center">
          <Link to="/" className="hover:text-brand">Home</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-brand">Dashboard</Link>
              <button onClick={onLogout} className="flex items-center gap-1 text-gray-500 hover:text-brand">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
`);

fs.writeFileSync(path.join(frontendDir, 'src', 'pages', 'Home.tsx'), `
import React from 'react';

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-brand mb-4">Shop From Global Websites</h1>
      <p className="text-gray-600 mb-8 max-w-xl mx-auto">
        Order products from your favorite international websites and let us handle the purchasing, shipping, and delivery.
      </p>
    </div>
  );
}
`);

fs.writeFileSync(path.join(frontendDir, 'src', 'pages', 'Login.tsx'), `
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function Login({ setAuth }: { setAuth: (val: boolean) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setAuth(true);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input className="border p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="border p-2 rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit" className="btn-primary">Login</button>
      </form>
    </div>
  );
}
`);

fs.writeFileSync(path.join(frontendDir, 'src', 'pages', 'Dashboard.tsx'), `
import React, { useEffect, useState } from 'react';
import api from '../api/api';

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [link, setLink] = useState('');

  const fetchOrders = async () => {
    const res = await api.get('/orders');
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/orders', { productLink: link });
    setLink('');
    fetchOrders();
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">Your Dashboard</h2>
      
      <form onSubmit={handleOrder} className="flex gap-4 mb-8 bg-white p-4 rounded-lg shadow">
        <input className="border p-2 rounded flex-grow" placeholder="Product Link (e.g. Amazon, SHEIN)" value={link} onChange={e=>setLink(e.target.value)} required />
        <button type="submit" className="btn-primary">Place Order</button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Product Link</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o._id} className="border-b">
                <td className="p-4 truncate max-w-xs">{o.productLink}</td>
                <td className="p-4">
                  <span className="bg-brand text-white text-xs px-2 py-1 rounded">{o.status}</span>
                </td>
                <td className="p-4 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={3} className="p-4 text-center text-gray-500">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`);

fs.writeFileSync(path.join(frontendDir, 'src', 'App.tsx'), `
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) setIsAuthenticated(true);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated={isAuthenticated} onLogout={logout} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
`);

console.log("Full-stack scaffold generated successfully.");

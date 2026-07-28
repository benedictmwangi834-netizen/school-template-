/**
 * ================================================================
 * STRATIFY SCHOOL PORTAL - BACKEND SERVER
 * ================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config({ path: '../config/.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// ================================================================
// MIDDLEWARE
// ================================================================

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.APP_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ================================================================
// SERVE STATIC FILES
// ================================================================

app.use(express.static(path.join(__dirname, '../public')));

// ================================================================
// USER CREDENTIALS - Load from .env
// ================================================================

const users = [];

function loadUsers() {
  const userKeys = Object.keys(process.env).filter(key => key.endsWith('_USERNAME'));

  userKeys.forEach(key => {
    const baseKey = key.replace('_USERNAME', '');
    const username = process.env[key];
    const password = process.env[`${baseKey}_PASSWORD`];
    const role = process.env[`${baseKey}_ROLE`];
    const redirect = process.env[`${baseKey}_REDIRECT`] || `/${role}.html`;

    if (username && password && role) {
      users.push({
        username,
        password,
        role,
        redirect,
        type: baseKey
      });
    }
  });
}

loadUsers();

console.log('👥 Users loaded:', users.map(u => ({ username: u.username, role: u.role })));

// ================================================================
// API ROUTES
// ================================================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '2.0.0'
  });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide username and password'
    });
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }

  // Store user in session
  req.session.user = {
    username: user.username,
    role: user.role,
    redirect: user.redirect
  };

  res.json({
    success: true,
    message: `Welcome ${user.username}! Login successful.`,
    user: {
      username: user.username,
      role: user.role
    },
    redirect: user.redirect
  });
});

// Get current user
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({
      success: true,
      user: req.session.user
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not logged in'
    });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out'
      });
    }
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// Get all users (Admin only)
app.get('/api/users', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }

  res.json({
    success: true,
    users: users.map(u => ({ username: u.username, role: u.role }))
  });
});

// ================================================================
// AUTHENTICATION MIDDLEWARE
// ================================================================

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Middleware to check role
function hasRole(role) {
  return (req, res, next) => {
    if (req.session.user && req.session.user.role === role) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
  };
}

// ================================================================
// PROTECTED ROUTES (with role-based access)
// ================================================================

// Admin dashboard - Admin only
app.get('/admin.html', isAuthenticated, hasRole('admin'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Student dashboard - Student only
app.get('/student.html', isAuthenticated, hasRole('student'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/student.html'));
});

// Teacher dashboard - Teacher only
app.get('/teacher.html', isAuthenticated, hasRole('teacher'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/teacher.html'));
});

// Parent dashboard - Parent only
app.get('/parent.html', isAuthenticated, hasRole('parent'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/parent.html'));
});

// ================================================================
// PUBLIC ROUTES
// ================================================================

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Login page
app.get('/login', (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.session.user) {
    return res.redirect(req.session.user.redirect);
  }
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Login page (alternative route)
app.get('/login.html', (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.session.user) {
    return res.redirect(req.session.user.redirect);
  }
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Public pages (no authentication required)
app.get('/admissions', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admissions.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/gallery.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/contact.html'));
});

// ================================================================
// LOGOUT ROUTE (GET for easy logout)
// ================================================================

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

// ================================================================
// 404 ERROR HANDLING
// ================================================================

app.use((req, res) => {
  // If requesting HTML, show 404 page
  if (req.accepts('html')) {
    res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head><title>404 - Page Not Found</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>404</h1>
                <p>Oops! The page you're looking for doesn't exist.</p>
                <a href="/" style="color: #4F46E5; text-decoration: none;">← Back to Home</a>
            </body>
            </html>
        `);
  } else {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }
});

// ================================================================
// ERROR HANDLING MIDDLEWARE
// ================================================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.APP_ENV === 'development' ? err.message : undefined
  });
});

// ================================================================
// START SERVER
// ================================================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎓 STRATIFY SCHOOL PORTAL                              ║
║   Version: ${process.env.APP_VERSION || '2.0.0'}                          ║
║                                                           ║
║   Server running on: http://${process.env.HOST || 'localhost'}:${PORT}    ║
║   Environment: ${process.env.APP_ENV || 'development'}                     ║
║                                                           ║
║   📚 Available Credentials:                              ║
║   ${users.map(u => `   ${u.username} (${u.role})`).join('\n║   ')}           ║
║                                                           ║
║   🔑 Login at: http://${process.env.HOST || 'localhost'}:${PORT}/login     ║
║                                                           ║
║   🚪 Protected Pages:                                    ║
║      /admin.html (Admin only)                           ║
║      /student.html (Student only)                       ║
║      /teacher.html (Teacher only)                       ║
║      /parent.html (Parent only)                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
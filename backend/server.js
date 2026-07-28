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
const dotenv = require('dotenv');

// Try to load .env from different locations
const envPaths = [
  path.join(__dirname, '../config/.env'),
  path.join(__dirname, '.env'),
  path.join(__dirname, '../.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(`✅ .env loaded from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.log('⚠️ No .env file found, using defaults');
  // Set default values
  process.env.PORT = 3000;
  process.env.ADMIN_USERNAME = 'admin';
  process.env.ADMIN_PASSWORD = 'admin@2026';
  process.env.ADMIN_ROLE = 'admin';
  process.env.ADMIN_REDIRECT = '/admin.html';
  process.env.STUDENT_USERNAME = 'student';
  process.env.STUDENT_PASSWORD = 'student@2026';
  process.env.STUDENT_ROLE = 'student';
  process.env.STUDENT_REDIRECT = '/student.html';
  process.env.TEACHER_USERNAME = 'teacher';
  process.env.TEACHER_PASSWORD = 'teacher@2026';
  process.env.TEACHER_ROLE = 'teacher';
  process.env.TEACHER_REDIRECT = '/teacher.html';
  process.env.PARENT_USERNAME = 'parent';
  process.env.PARENT_PASSWORD = 'parent@2026';
  process.env.PARENT_ROLE = 'parent';
  process.env.PARENT_REDIRECT = '/parent.html';
}

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

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '2.0.0'
  });
});

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

// ================================================================
// SPA ROUTES
// ================================================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/student', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/student.html'));
});

app.get('/teacher', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/teacher.html'));
});

app.get('/parent', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/parent.html'));
});

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
// ERROR HANDLING
// ================================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

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
║   Server running on: http://localhost:${PORT}            ║
║   Environment: ${process.env.APP_ENV || 'development'}                     ║
║                                                           ║
║   📚 Available Credentials:                              ║
║   ${users.map(u => `   ${u.username} (${u.role})`).join('\n║   ')}           ║
║                                                           ║
║   🔑 Use any username/password above to login            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
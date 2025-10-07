// backend/server.js - COMPLETE FIXED VERSION
require('dotenv').config();

console.log('🚀 Starting Campus AI Advisor Server...');
console.log('🔍 Environment Check:');
console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `✅ Loaded (${process.env.OPENAI_API_KEY.length} chars)` : '❌ Missing');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Loaded' : '❌ Missing');
console.log('   SUPABASE_KEY:', process.env.SUPABASE_KEY ? `✅ Loaded (${process.env.SUPABASE_KEY.length} chars)` : '❌ Missing');

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ CRITICAL: Supabase credentials missing!');
  console.error('   SUPABASE_URL:', supabaseUrl ? 'Provided' : 'Missing');
  console.error('   SUPABASE_KEY:', supabaseKey ? 'Provided' : 'Missing');
  process.exit(1);
}

console.log('🔗 Initializing Supabase connection...');
const supabase = createClient(supabaseUrl, supabaseKey);

// Test Supabase connection on startup
async function testSupabaseConnection() {
  try {
    console.log('🔗 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️  Users table doesnt exist yet (this is normal for first run)');
      } else {
        console.error('❌ Supabase connection test failed:', error.message);
      }
    } else {
      console.log('✅ Supabase connection successful!');
    }
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error.message);
  }
}

testSupabaseConnection();

// AI Assistant
const CampusAI = require('./ai/assistant');
const campusAI = new CampusAI();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET missing!');
  process.exit(1);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Campus AI Advisor is running!',
    openai: !!process.env.OPENAI_API_KEY,
    supabase: !!supabaseUrl,
    timestamp: new Date().toISOString()
  });
});

// Debug route to check environment
app.get('/api/debug', (req, res) => {
  res.json({
    openaiKey: process.env.OPENAI_API_KEY ? '✅ Loaded' : '❌ Missing',
    keyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
    jwtSecret: process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing',
    supabaseUrl: process.env.SUPABASE_URL ? '✅ Loaded' : '❌ Missing',
    supabaseKey: process.env.SUPABASE_KEY ? '✅ Loaded' : '❌ Missing',
    serverTime: new Date().toISOString()
  });
});

// User Registration - FIXED VERSION
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name, major, year } = req.body;
    
    console.log('👤 Registration attempt:', { email, name, major, year });
    
    // Basic validation
    if (!email || !password || !name) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Try to create user directly - let Supabase handle duplicate checking
    console.log('💾 Attempting to create user in database...');
    const userData = { 
      email, 
      password: hashedPassword, 
      name, 
      major: major || null, 
      year: year ? parseInt(year) : null 
    };
    
    const { data: user, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    console.log('📊 Database response:', { 
      userCreated: !!user, 
      error: error ? `${error.code}: ${error.message}` : 'None' 
    });

    if (error) {
      console.error('❌ Database error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Handle specific error cases
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ error: 'User with this email already exists' });
      } else if (error.code === '42P01') { // Table doesn't exist
        return res.status(500).json({ error: 'Database table not set up. Please create the users table in Supabase.' });
      } else {
        return res.status(500).json({ error: 'Database error: ' + error.message });
      }
    }
    
    if (!user) {
      console.error('❌ No user data returned after insertion');
      return res.status(500).json({ error: 'User creation failed - no data returned' });
    }
    
    // Generate token
    console.log('🎫 Generating JWT token...');
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    
    console.log('✅ Registration successful for:', email);
    console.log('🎉 User created with ID:', user.id);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        major: user.major,
        year: user.year
      }
    });
  } catch (error) {
    console.error('🚨 Registration catch error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for:', email);
    
    // Find user in database
    console.log('🔍 Searching for user in database...');
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    console.log('📊 User search result:', { 
      userFound: !!user, 
      error: error ? error.message : 'None' 
    });

    if (error || !user) {
      console.error('❌ Login error - user not found:', error?.message);
      return res.status(400).json({ error: 'User not found' });
    }
    
    // Check password
    console.log('🔑 Verifying password...');
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.error('❌ Login error - invalid password for:', email);
      return res.status(400).json({ error: 'Invalid password' });
    }
    
    // Generate token
    console.log('🎫 Generating JWT token...');
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    
    console.log('✅ Login successful for:', email);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        major: user.major,
        year: user.year
      }
    });
  } catch (error) {
    console.error('🚨 Login catch error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('❌ Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Protected chat endpoint with AI
app.post('/api/chat', authenticateToken, async (req, res) => {
  const { message } = req.body;
  const userId = req.user.userId;
  
  console.log('💬 Chat request from user:', userId, 'Message:', message);
  
  try {
    // Get user context from database
    console.log('🔍 Fetching user context...');
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const userContext = user ? { 
      name: user.name, 
      major: user.major, 
      year: user.year 
    } : null;

    console.log('👤 User context:', userContext);
    
    // Get conversation history from database
    console.log('📚 Fetching conversation history...');
    const { data: history } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true })
      .limit(10);

    console.log('💭 History length:', history?.length || 0);

    // Generate AI response
    console.log('🤖 Generating AI response...');
    const aiResponse = await campusAI.generateResponse(
      message, 
      userContext, 
      history || []
    );
    
    console.log('✅ AI response generated:', aiResponse.substring(0, 100) + '...');
    
    // Store user message in database
    console.log('💾 Storing user message...');
    await supabase
      .from('conversations')
      .insert([
        { user_id: userId, message, sender: 'user' }
      ]);

    // Store AI response in database
    console.log('💾 Storing AI response...');
    await supabase
      .from('conversations')
      .insert([
        { user_id: userId, message: aiResponse, sender: 'ai' }
      ]);
    
    console.log('✅ Chat completed successfully');
    
    res.json({ 
      response: aiResponse,
      type: "ai_response"
    });
  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      response: "Sorry, I'm experiencing technical difficulties. Please try again.",
      type: "error"
    });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    console.log('👤 Profile request for user:', req.user.userId);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, major, year, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      console.error('❌ Profile not found for user:', req.user.userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ Profile fetched successfully');
    res.json({ user });
  } catch (error) {
    console.error('🚨 Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Simple chat endpoint (without auth for testing)
app.post('/api/simple-chat', async (req, res) => {
  const { message } = req.body;
  
  console.log('💬 Simple chat request:', message);
  
  try {
    const aiResponse = await campusAI.generateResponse(message);
    console.log('✅ Simple chat response generated');
    
    res.json({ 
      response: aiResponse,
      type: "ai_response"
    });
  } catch (error) {
    console.error('❌ Simple chat error:', error);
    res.status(500).json({ 
      response: "Sorry, I'm having technical issues. Please try again.",
      type: "error"
    });
  }
});

// Database setup endpoint
app.get('/api/setup-database', async (req, res) => {
  try {
    console.log('🗃️ Database setup check requested');
    
    const { data: usersTable, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    const { data: convTable, error: convError } = await supabase
      .from('conversations')
      .select('count')
      .limit(1);

    const result = {
      users_table: usersError ? `❌ ${usersError.message}` : '✅ Exists',
      conversations_table: convError ? `❌ ${convError.message}` : '✅ Exists',
      message: usersError || convError ? 'Check Supabase SQL Editor to create tables' : 'All tables exist'
    };

    console.log('📊 Database check result:', result);
    res.json(result);
  } catch (error) {
    console.error('🚨 Database setup check failed:', error);
    res.status(500).json({ error: 'Database setup check failed' });
  }
});

// Database tables creation endpoint
app.post('/api/create-tables', async (req, res) => {
  try {
    console.log('🗃️ Table creation requested');
    
    // This is a placeholder - in a real scenario, you'd run SQL migrations
    // For now, we'll just check current status
    
    const { data: usersTable, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    res.json({
      message: 'Table creation endpoint',
      note: 'Run the SQL commands in Supabase SQL Editor to create tables',
      current_status: {
        users: usersError ? 'Missing' : 'Exists',
        conversations: 'Check with /api/setup-database'
      }
    });
  } catch (error) {
    console.error('🚨 Table creation check failed:', error);
    res.status(500).json({ error: 'Table creation check failed' });
  }
});

// AI Health Check endpoint
app.get('/api/ai-health', async (req, res) => {
  try {
    console.log('🔍 AI Health check requested');
    
    const testResult = await campusAI.testConnection();
    
    res.json({
      ai_service: 'OpenAI GPT',
      status: testResult.success ? '✅ Healthy' : '❌ Unhealthy',
      details: testResult.success ? {
        message: testResult.message,
        model: testResult.model
      } : {
        error: testResult.error,
        code: testResult.code
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Health check error:', error);
    res.status(500).json({
      ai_service: 'OpenAI GPT',
      status: '❌ Error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n🎉 ==========================================');
  console.log('🚀 Campus AI Advisor Server Started!');
  console.log('📍 Port:', PORT);
  console.log('🔗 Endpoints:');
  console.log('   • Health:    http://localhost:' + PORT + '/api/health');
  console.log('   • Debug:     http://localhost:' + PORT + '/api/debug');
  console.log('   • DB Check:  http://localhost:' + PORT + '/api/setup-database');
  console.log('==========================================\n');
});
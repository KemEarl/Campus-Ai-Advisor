// frontend/src/App.js - COMPLETE UPDATED VERSION
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Import your image
import campusImage from './OG_Eduvos.jpg';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', email: '', password: '', major: '', year: '' 
  });
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowLogin(false);
      }
    };

    if (showLogin) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLogin]);

  // Check for existing login on app start
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: 'user', time: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const response = await axios.post('http://localhost:5000/api/chat', {
        message: input
      }, config);

      const aiMessage = { 
        text: response.data.response, 
        sender: 'ai', 
        time: new Date(),
        type: response.data.type 
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { 
        text: "Sorry, I'm having trouble connecting. Please try again.", 
        sender: 'ai', 
        time: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Attempting login:', loginData);
    
    try {
      const response = await axios.post('http://localhost:5000/api/login', loginData);
      console.log('✅ Login response:', response.data);
      
      if (response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
        setShowLogin(false);
        setLoginData({ email: '', password: '' });
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        alert('Login successful! Welcome back!');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      alert('Login failed: ' + errorMessage);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Attempting registration:', registerData);
    
    try {
      const response = await axios.post('http://localhost:5000/api/register', registerData);
      console.log('✅ Registration response:', response.data);
      
      if (response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
        setShowLogin(false);
        
        // Reset forms
        setRegisterData({ name: '', email: '', password: '', major: '', year: '' });
        setLoginData({ email: '', password: '' });
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        alert('Registration successful! Welcome to Campus AI Advisor!');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      alert('Registration failed: ' + errorMessage);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setMessages([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Logged out successfully!');
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-text">
            <h1>🎓 EduCampus AI Advisor</h1>
            <p>Your personal campus assistant</p>
          </div>
          
          {user ? (
            <div className="user-profile">
              <span>Welcome, {user.name}!</span>
              <button 
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              className="login-btn"
              onClick={() => setShowLogin(true)}
            >
              🔐 Login
            </button>
          )}
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <div className="modal-overlay">
          <div className="login-modal" ref={modalRef}>
            <div className="modal-content">
              {/* Image Side - WITH YOUR ACTUAL IMAGE */}
              <div className="modal-image-side">
                <img src={campusImage} alt="Eduvos Campus" className="campus-image" />
                <div className="image-overlay">
                  <h3>Welcome to Eduvos</h3>
                  <p>Your journey to excellence begins here</p>
                </div>
              </div>

              {/* Login Form Side */}
              <div className="modal-form-side">
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowLogin(false);
                    setIsLogin(true);
                    setLoginData({ email: '', password: '' });
                    setRegisterData({ name: '', email: '', password: '', major: '', year: '' });
                  }}
                >
                  ×
                </button>
                
                <div className="login-form-container">
                  <h2>{isLogin ? 'Welcome Back' : 'Join Our Campus'}</h2>
                  <p className="login-subtitle">
                    {isLogin ? 'Sign in to your Campus AI account' : 'Create your Campus AI Advisor account'}
                  </p>
                  
                  <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} className="login-form">
                    {!isLogin && (
                      <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    )}
                    
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={isLogin ? loginData.email : registerData.email}
                        onChange={isLogin ? 
                          (e) => setLoginData({...loginData, email: e.target.value}) :
                          (e) => setRegisterData({...registerData, email: e.target.value})
                        }
                        placeholder="student@eduvos.com"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={isLogin ? loginData.password : registerData.password}
                        onChange={isLogin ? 
                          (e) => setLoginData({...loginData, password: e.target.value}) :
                          (e) => setRegisterData({...registerData, password: e.target.value})
                        }
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    {!isLogin && (
                      <div className="additional-fields">
                        <div className="form-group">
                          <label htmlFor="major">Field of Study</label>
                          <input
                            type="text"
                            id="major"
                            name="major"
                            value={registerData.major}
                            onChange={(e) => setRegisterData({...registerData, major: e.target.value})}
                            placeholder="e.g., Computer Science, Business, Engineering"
                            className="major-input"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="year">Academic Year</label>
                          <div className="year-select-wrapper">
                            <select
                              id="year"
                              name="year"
                              value={registerData.year}
                              onChange={(e) => setRegisterData({...registerData, year: e.target.value})}
                              className="year-select"
                            >
                              <option value="">Select your year</option>
                              <option value="1">🎓 First Year</option>
                              <option value="2">📚 Second Year</option>
                              <option value="3">💼 Third Year</option>
                              <option value="4">🌟 Final Year</option>
                            </select>
                            <div className="select-arrow">▼</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isLogin && (
                      <div className="form-options">
                        <label className="remember-me">
                          <input type="checkbox" />
                          Remember me
                        </label>
                        <a href="#forgot" className="forgot-password">
                          Forgot password?
                        </a>
                      </div>
                    )}

                    <button type="submit" className={`submit-btn ${isLogin ? 'login-submit' : 'register-submit'}`}>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </button>

                    <div className="auth-toggle">
                      <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button 
                          type="button"
                          className="toggle-btn"
                          onClick={() => {
                            setIsLogin(!isLogin);
                            setLoginData({ email: '', password: '' });
                            setRegisterData({ name: '', email: '', password: '', major: '', year: '' });
                          }}
                        >
                          {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="chat-container">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h3>Welcome{user ? `, ${user.name}` : ''}! 👋</h3>
              <p>I can help you with:</p>
              <ul>
                <li>📚 Course information</li>
                <li>🏫 Campus locations</li>
                <li>📅 University procedures</li>
                <li>🎯 Personalized advice</li>
              </ul>
              <p>What would you like to know?</p>
              {user && user.major && (
                <p className="personalized-note">
                  <small>I see you're studying {user.major} - ask me about relevant courses!</small>
                </p>
              )}
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">
                    {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="message ai loading">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about campus life..."
              disabled={isLoading}
            />
            <button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
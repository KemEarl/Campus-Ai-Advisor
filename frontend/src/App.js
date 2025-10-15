// frontend/src/App.js - COMPLETE FIXED VERSION
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
  const [showMenu, setShowMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState('chat');
  
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);
  const menuRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle body scroll when modals are open
  useEffect(() => {
    if (showLogin || showMenu) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showLogin, showMenu]);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowLogin(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handlePromptButton = (promptType) => {
    let promptText = '';
    
    switch (promptType) {
      case 'courses':
        promptText = user?.major 
          ? `What ${user.major} courses do you recommend for a ${user.year ? getYearText(user.year) : 'student'} like me? What are the key topics and career paths for these courses?`
          : "What are the most popular courses available? Can you tell me about the course content and career opportunities?";
        break;
      
      case 'locations':
        promptText = "Where are the main campus facilities located? I need to find the library, computer labs, student center, and food services. Can you give me directions?";
        break;
      
      case 'procedures':
        promptText = "What are the important university procedures I should know about? This includes registration, exam scheduling, academic appeals, and graduation requirements.";
        break;
      
      case 'advice':
        promptText = user?.major && user?.year
          ? `As a ${getYearText(user.year)} ${user.major} student, what personalized advice do you have for my academic journey? Include study tips, career planning, and campus resources.`
          : "What general advice do you have for succeeding in university? Include study strategies, time management, and campus resource recommendations.";
        break;
      
      default:
        promptText = "How can you help me with campus life and academics?";
    }

    setInput(promptText);
    
    setTimeout(() => {
      const inputElement = document.querySelector('.input-wrapper input');
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  };

  const getYearText = (year) => {
    const yearMap = {
      '1': 'first-year',
      '2': 'second-year', 
      '3': 'third-year',
      '4': 'final-year'
    };
    return yearMap[year] || `year ${year}`;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    console.log('Attempting login:', loginData);
    
    try {
      const response = await axios.post('http://localhost:5000/api/login', loginData);
      console.log('Login response:', response.data);
      
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
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      alert('Login failed: ' + errorMessage);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    console.log('Attempting registration:', registerData);
    
    try {
      const response = await axios.post('http://localhost:5000/api/register', registerData);
      console.log('Registration response:', response.data);
      
      if (response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
        setShowLogin(false);
        
        setRegisterData({ name: '', email: '', password: '', major: '', year: '' });
        setLoginData({ email: '', password: '' });
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        alert('Registration successful! Welcome to Campus AI Advisor!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      alert('Registration failed: ' + errorMessage);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setMessages([]);
    setCurrentPage('chat');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Logged out successfully!');
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setShowMenu(false);
  };

  const Dashboard = () => (
    <div className="page-content">
      <h2>Student Dashboard</h2>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Academic Progress</h3>
          <p>Track your courses and grades</p>
          <div className="card-stats">
            <span className="stat">Current GPA: {user?.major ? '3.8' : 'N/A'}</span>
            <span className="stat">Courses Completed: {user?.major ? '12' : 'N/A'}</span>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3>Upcoming Deadlines</h3>
          <ul className="deadline-list">
            <li>Course Registration - Jan 15</li>
            <li>Midterm Exams - Mar 1-15</li>
            <li>Project Submissions - Apr 30</li>
          </ul>
        </div>
        
        <div className="dashboard-card">
          <h3>Campus Events</h3>
          <ul className="event-list">
            <li>Career Fair - Feb 20</li>
            <li>Tech Workshop - Feb 25</li>
            <li>Sports Day - Mar 5</li>
          </ul>
        </div>
        
        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => handleNavigation('chat')}>
              Ask AI Assistant
            </button>
            <button className="action-btn" onClick={() => window.open('#', '_blank')}>
              View Course Catalog
            </button>
            <button className="action-btn" onClick={() => window.open('#', '_blank')}>
              Campus Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const Resources = () => (
  <div className="page-content">
    <h2>Campus Resources</h2>
    <div className="resources-grid">
      <div className="resource-card">
        <h3>Academic Support</h3>
        <ul>
          <li>
            <a href="https://www.eduvos.com/library" target="_blank" rel="noopener noreferrer">
              Library Services
            </a>
          </li>
          <li>
            <a href="https://www.eduvos.com/writing-center" target="_blank" rel="noopener noreferrer">
              Writing Center
            </a>
          </li>
          <li>
            <a href="https://www.eduvos.com/tutoring" target="_blank" rel="noopener noreferrer">
              Math Tutoring
            </a>
          </li>
          <li>
            <a href="https://www.eduvos.com/research" target="_blank" rel="noopener noreferrer">
              Research Help
            </a>
          </li>
        </ul>
      </div>
      
      <div className="resource-card">
        <h3>Student Services</h3>
        <ul>
          <li>
            <a href="https://www.eduvos.com/career-services" target="_blank" rel="noopener noreferrer">
              Career Counseling
            </a>
          </li>
          <li>
            <a href="https://www.eduvos.com/health-services" target="_blank" rel="noopener noreferrer">
              Health Services
            </a>
          </li>
          <li>
            <a href="https://www.eduvos.com/financial-aid" target="_blank" rel="noopener noreferrer">
              Financial Aid
            </a>
          </li>
          <li>
            <a href="https://www.eduvos.com/housing" target="_blank" rel="noopener noreferrer">
              Housing Office
            </a>
          </li>
        </ul>
      </div>
      
      <div className="resource-card">
        <h3>Technology</h3>
        <ul>
          <li>
            <a href="https://www.eduvos.com/computer-labs" target="_blank" rel="noopener noreferrer">
              Computer Labs
            </a>
          </li>
          <li>
            <a href="https://www.eduvos.com/wifi-setup" target="_blank" rel="noopener noreferrer">
              WiFi Access
            </a>
          </li>
          <li>
            <a href="https://www.eduvos.com/software-downloads" target="_blank" rel="noopener noreferrer">
              Software Downloads
            </a>
          </li>
          <li>
            <a href="https://www.eduvos.com/it-help" target="_blank" rel="noopener noreferrer">
              IT Help Desk
            </a>
          </li>
        </ul>
      </div>
      
      <div className="resource-card">
        <h3>Campus Facilities</h3>
        <ul>
          <li>
            <a href="https://www.eduvos.com/sports-complex" target="_blank" rel="noopener noreferrer">
              Sports Complex
            </a>
          </li>
          <li>
            <a href="https://www.eduvos.com/student-center" target="_blank" rel="noopener noreferrer">
              Student Center
            </a>
          </li>
          <li>
            <a href="https://www.eduvos.com/food-services" target="_blank" rel="noopener noreferrer">
              Food Services
            </a>
          </li>
          <li>
            <a href="https://www.eduvos.com/study-rooms" target="_blank" rel="noopener noreferrer">
              Study Rooms
            </a>
          </li>
        </ul>
      </div>
      
      <div className="resource-card">
        <h3>Important Links</h3>
        <ul>
          <li>
            <a href="https://www.vossie.net/" target="_blank" rel="noopener noreferrer">
              Student Portal
            </a>
          </li>
          <li>
            <a href="https://www.eduvos.com/campuses/eduvos-generic-brochure.pdf" target="_blank" rel="noopener noreferrer">
              Course Catalog
            </a>
          </li>
          <li>
            <a href="https://www.eduvos.com/academic-calendar" target="_blank" rel="noopener noreferrer">
              Academic Calendar
            </a>
          </li>
          <li>
            <a href="http://mylms.vossie.net/" target="_blank" rel="noopener noreferrer">
              myLMS
            </a>
          </li>
        </ul>
      </div>
      
      <div className="resource-card">
        <h3>Emergency Contacts</h3>
        <ul>
          <li>
            <a href="tel:555-0111">
              Campus Security: 555-0111
            </a>
          </li>
          <li>
            <a href="tel:555-0112">
              Health Center: 555-0112
            </a>
          </li>
          <li>
            <a href="tel:555-0113">
              Counseling: 555-0113
            </a>
          </li>
          <li>
            <a href="tel:555-0114">
              IT Support: 555-0114
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

  const Chat = () => (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h3>Welcome{user ? `, ${user.name}` : ''}!</h3>
            <p>I can help you with:</p>
            
            <div className="prompt-buttons">
              <button 
                className="prompt-btn course-btn"
                onClick={() => handlePromptButton('courses')}
              >
                <span className="btn-icon">📚</span>
                <span className="btn-text">Course Information</span>
                <span className="btn-desc">Get course recommendations and details</span>
              </button>
              
              <button 
                className="prompt-btn location-btn"
                onClick={() => handlePromptButton('locations')}
              >
                <span className="btn-icon">🏫</span>
                <span className="btn-text">Campus Locations</span>
                <span className="btn-desc">Find facilities and directions</span>
              </button>
              
              <button 
                className="prompt-btn procedure-btn"
                onClick={() => handlePromptButton('procedures')}
              >
                <span className="btn-icon">📅</span>
                <span className="btn-text">University Procedures</span>
                <span className="btn-desc">Learn registration and policies</span>
              </button>
              
              <button 
                className="prompt-btn advice-btn"
                onClick={() => handlePromptButton('advice')}
              >
                <span className="btn-icon">🎯</span>
                <span className="btn-text">Personalized Advice</span>
                <span className="btn-desc">Get tailored guidance</span>
              </button>
            </div>
            
            <p>Or type your own question below!</p>
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
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <button 
            className="menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            ☰
          </button>

          <div className="header-center">
            <h1>Campus AI Advisor</h1>
            <p>Your personal campus assistant</p>
          </div>

          <div className="header-actions">
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
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {showMenu && (
        <div className="nav-overlay">
          <nav className="navigation-pane" ref={menuRef}>
            <div className="nav-header">
              <h3>Navigation</h3>
              <button 
                className="close-nav-btn"
                onClick={() => setShowMenu(false)}
              >
                ×
              </button>
            </div>
            
            <div className="nav-items">
              <button 
                className={`nav-item ${currentPage === 'chat' ? 'active' : ''}`}
                onClick={() => handleNavigation('chat')}
              >
                <span className="nav-icon">💬</span>
                <span className="nav-text">AI Chat</span>
              </button>
              
              <button 
                className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavigation('dashboard')}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Dashboard</span>
              </button>
              
              <button 
                className={`nav-item ${currentPage === 'resources' ? 'active' : ''}`}
                onClick={() => handleNavigation('resources')}
              >
                <span className="nav-icon">📚</span>
                <span className="nav-text">Resources</span>
              </button>
              
              <div className="nav-divider"></div>
              
              <button className="nav-item">
                <span className="nav-icon">⚙️</span>
                <span className="nav-text">Settings</span>
              </button>
              
              <button className="nav-item">
                <span className="nav-icon">❓</span>
                <span className="nav-text">Help & Support</span>
              </button>
            </div>
            
            <div className="nav-footer">
              <p className="user-info">
                {user ? `Logged in as ${user.name}` : 'Not logged in'}
              </p>
              {user && (
                <button className="nav-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              )}
            </div>
          </nav>
        </div>
      )}

      {showLogin && (
        <div className="modal-overlay">
          <div className="login-modal" ref={modalRef}>
            <div className="modal-content">
              <div className="modal-image-side">
                <img src={campusImage} alt="Eduvos Campus" className="campus-image" />
                <div className="image-overlay">
                  <h3>Welcome to Eduvos</h3>
                  <p>Your journey to excellence begins here</p>
                </div>
              </div>

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
                              <option value="1">First Year</option>
                              <option value="2">Second Year</option>
                              <option value="3">Third Year</option>
                              <option value="4">Final Year</option>
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
        {currentPage === 'chat' && <Chat />}
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'resources' && <Resources />}
      </div>
    </div>
  );
}

export default App;

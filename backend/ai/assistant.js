// backend/ai/assistant.js 
const OpenAI = require('openai');

class CampusAI {
  constructor() {
    console.log('🤖 Initializing Campus AI Assistant...');
    
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY is missing from environment variables');
      this.openai = null;
    } else {
      console.log('✅ OpenAI API key found, length:', process.env.OPENAI_API_KEY.length);
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    
    this.systemPrompt = `You are CampusAI, a helpful university assistant for Eduvos. You provide accurate, personalized information about campus life, courses, and university procedures.

IMPORTANT CONTEXT:
- You're assisting real Eduvos university students
- Be accurate, helpful, and professional
- Use the student's major and year to personalize advice
- For course recommendations, suggest relevant options
- For campus questions, provide specific, actionable information

STUDENT PERSONALIZATION:
- If you know their major: "As a Computer Science student, you might enjoy..."
- If you know their year: "For a 2nd year student, I recommend focusing on..."
- Always consider their academic level when giving advice

RESPONSE GUIDELINES:
- Be conversational but professional
- Provide specific, actionable information
- Admit when you don't know something
- Keep responses concise but helpful
- Use bullet points for multiple recommendations
- Include emojis sparingly for friendliness

EXAMPLE RESPONSES:
- "I see you're studying Business Management! The finance lab in Building A has great resources for your investments course."
- "As a first-year student, I recommend checking out the student orientation portal for campus maps and important dates."
- "The library's quiet study area on the 3rd floor is perfect for exam preparation."`;
  }

  async generateResponse(userMessage, userContext = null, conversationHistory = []) {
    // Check if OpenAI is properly initialized
    if (!this.openai) {
      console.error('❌ OpenAI client not initialized - missing API key');
      return "I'm currently undergoing maintenance. Please check if the AI service is properly configured.";
    }

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY is missing during request');
      return "I'm having trouble connecting to my knowledge base. Please contact support.";
    }

    try {
      console.log('🤖 Generating AI response for:', userMessage.substring(0, 100) + '...');
      
      const messages = [
        { role: "system", content: this.systemPrompt },
      ];

      // Add user context if available
      if (userContext) {
        let contextString = "\n\nCURRENT STUDENT CONTEXT:";
        if (userContext.name) contextString += `\n- Name: ${userContext.name}`;
        if (userContext.major) contextString += `\n- Major: ${userContext.major}`;
        if (userContext.year) contextString += `\n- Year: ${this.getYearText(userContext.year)}`;
        
        messages[0].content += contextString;
        console.log('👤 Using user context:', userContext);
      }

      // Add conversation history (last 6 messages)
      const recentHistory = conversationHistory.slice(-6);
      console.log('💭 Conversation history length:', recentHistory.length);
      
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.message
        });
      });

      // Add current message
      messages.push({ role: "user", content: userMessage });

      console.log('📡 Sending request to OpenAI...');
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      console.log('✅ AI response generated successfully');
      console.log('📝 Response preview:', response.substring(0, 150) + '...');
      
      return response;
    } catch (error) {
      console.error('❌ AI Generation Error:', {
        message: error.message,
        code: error.code,
        type: error.type
      });

      // User-friendly error messages based on error type
      if (error.code === 'invalid_api_key') {
        return "I'm having authentication issues. Please check the AI service configuration.";
      } else if (error.code === 'insufficient_quota') {
        return "I'm currently unavailable due to service limits. Please try again later or contact support.";
      } else if (error.code === 'rate_limit_exceeded') {
        return "I'm receiving too many requests right now. Please wait a moment and try again.";
      } else {
        return "I'm experiencing technical difficulties. Please try again in a moment, or contact IT support if this continues.";
      }
    }
  }

  getYearText(year) {
    const yearMap = {
      '1': 'First Year',
      '2': 'Second Year', 
      '3': 'Third Year',
      '4': 'Final Year'
    };
    return yearMap[year] || `Year ${year}`;
  }

  // Test method to verify OpenAI connection
  async testConnection() {
    if (!this.openai) {
      return { success: false, error: 'OpenAI client not initialized' };
    }

    try {
      const testResponse = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Say 'Test successful' if you can read this." }],
        max_tokens: 10,
      });

      return { 
        success: true, 
        message: testResponse.choices[0].message.content,
        model: 'gpt-3.5-turbo'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        code: error.code
      };
    }
  }
}

module.exports = CampusAI;

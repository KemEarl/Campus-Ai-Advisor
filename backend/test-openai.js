// backend/test-openai.js
require('dotenv').config();
const OpenAI = require('openai');

console.log('🔍 Testing OpenAI Connection...\n');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    console.log('📡 Testing OpenAI API key...');
    console.log('Key length:', process.env.OPENAI_API_KEY?.length);
    console.log('Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 7));
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say 'Hello from Campus AI!' in a friendly way." }],
      max_tokens: 50,
    });

    console.log('✅ OpenAI test SUCCESSFUL!');
    console.log('Response:', completion.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('❌ OpenAI test FAILED:');
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'invalid_api_key') {
      console.log('💡 Solution: Check your OpenAI API key in the .env file');
    } else if (error.code === 'insufficient_quota') {
      console.log('💡 Solution: Check your OpenAI billing and credits');
    }
    return false;
  }
}

testOpenAI();
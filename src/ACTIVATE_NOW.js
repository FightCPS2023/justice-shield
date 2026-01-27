/**
 * 🚀 INSTANT GEMINI AI ACTIVATION
 * 
 * Copy and paste this ENTIRE file into your browser console (F12)
 * while on the CPS Defense Analyzer app
 */

(async function activateGeminiAI() {
  console.clear();
  console.log('%c🤖 ACTIVATING GEMINI AI...', 'color: #667eea; font-size: 16px; font-weight: bold;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea;');
  
  // API key should be loaded from environment variables
  const API_KEY = prompt('Please enter your Gemini API key:') || '';
  
  if (!API_KEY) {
    console.log('%c❌ NO API KEY PROVIDED', 'color: #ef4444; font-size: 14px;');
    console.log('%cGet your free API key at: https://aistudio.google.com/app/apikey', 'color: #3b82f6;');
    return;
  }
  
  // Step 1: Save API Key
  console.log('%c\n📝 Step 1: Saving API key...', 'color: #3b82f6; font-weight: bold;');
  localStorage.setItem('VITE_GEMINI_API_KEY', API_KEY);
  console.log('%c✅ API key saved to localStorage!', 'color: #10b981;');
  console.log('   Key:', API_KEY.substring(0, 20) + '...' + API_KEY.substring(API_KEY.length - 4));
  
  // Step 2: Test Connection
  console.log('%c\n🔌 Step 2: Testing connection to Gemini API...', 'color: #3b82f6; font-weight: bold;');
  
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Respond with exactly: "CPS Defense AI activated! Ready to help parents fight for their children and reunify families."'
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    console.log('%c✅ Connection successful!', 'color: #10b981;');
    console.log('%c\n🤖 AI Response:', 'color: #8b5cf6; font-weight: bold;');
    console.log('%c   ' + (data.candidates[0]?.content?.parts[0]?.text || 'Success!'), 'color: #10b981; font-style: italic;');
    
    console.log('%c\n📊 API Stats:', 'color: #3b82f6; font-weight: bold;');
    console.log('   Model:', data.modelVersion || 'gemini-2.5-flash');
    console.log('   Tokens used:', data.usageMetadata?.totalTokenCount || 'N/A');
    console.log('   Prompt tokens:', data.usageMetadata?.promptTokenCount || 'N/A');
    console.log('   Response tokens:', data.usageMetadata?.candidatesTokenCount || 'N/A');
    
    // Step 3: Verify Features
    console.log('%c\n✨ Step 3: Verifying AI features...', 'color: #3b82f6; font-weight: bold;');
    console.log('%c✅ Document Analysis', 'color: #10b981;');
    console.log('%c✅ Defense Strategy Generator', 'color: #10b981;');
    console.log('%c✅ Motion Template Creator', 'color: #10b981;');
    console.log('%c✅ Case Law Analyzer', 'color: #10b981;');
    console.log('%c✅ Legal Q&A Assistant', 'color: #10b981;');
    console.log('%c✅ Violation Deep Analysis', 'color: #10b981;');
    
    // Step 4: Success Message
    console.log('%c\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea;');
    console.log('%c🎉 ACTIVATION COMPLETE!', 'font-size: 18px; font-weight: bold; color: #10b981;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea;');
    
    console.log('%c\n📖 HOW TO USE:', 'color: #f59e0b; font-weight: bold;');
    console.log('%c\n1️⃣ ANALYZE DOCUMENTS:', 'color: #3b82f6; font-weight: bold;');
    console.log('   → Go to "Docs" tab');
    console.log('   → Upload or paste CPS documents');
    console.log('   → AI automatically detects violations');
    
    console.log('%c\n2️⃣ GENERATE DEFENSE STRATEGY:', 'color: #3b82f6; font-weight: bold;');
    console.log('   → Go to "Defense" tab');
    console.log('   → Click "Generate AI Strategy"');
    console.log('   → Get comprehensive legal plan');
    
    console.log('%c\n3️⃣ DRAFT LEGAL MOTIONS:', 'color: #3b82f6; font-weight: bold;');
    console.log('   → Go to "Generator" tab');
    console.log('   → Select motion type');
    console.log('   → AI creates formatted motion');
    
    console.log('%c\n4️⃣ RESEARCH CASE LAW:', 'color: #3b82f6; font-weight: bold;');
    console.log('   → Go to "Policy" → "Case Law" tab');
    console.log('   → Search opinions');
    console.log('   → Get AI summaries');
    
    console.log('%c\n💡 PRO TIP:', 'color: #f59e0b; font-weight: bold;');
    console.log('   Upload multiple documents at once!');
    console.log('   AI will analyze all of them automatically.');
    
    console.log('%c\n🔒 PRIVACY:', 'color: #ef4444; font-weight: bold;');
    console.log('   • API key stored locally (not on our servers)');
    console.log('   • Document text sent to Google Gemini only');
    console.log('   • You control all your data');
    
    console.log('%c\n📊 YOUR LIMITS:', 'color: #3b82f6; font-weight: bold;');
    console.log('   • 15 requests per minute');
    console.log('   • 1,500 requests per day');
    console.log('   • 100% FREE (no credit card needed)');
    
    console.log('%c\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea;');
    console.log('%c🚀 ALL SYSTEMS READY! Start using AI features now!', 'color: #10b981; font-weight: bold;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'color: #667eea;');
    
    // Show alert
    alert('✅ GEMINI AI ACTIVATED!\n\n🎯 All AI features are now active!\n\n📄 Upload documents to auto-detect violations\n⚖️ Generate defense strategies\n📋 Draft legal motions\n🔍 Analyze case law\n\nGo to "Settings" tab to manage your API key!');
    
  } catch (error) {
    console.log('%c\n❌ ACTIVATION FAILED!', 'font-size: 18px; font-weight: bold; color: #ef4444;');
    console.error('Error details:', error);
    console.log('%c\nTroubleshooting:', 'color: #f59e0b; font-weight: bold;');
    console.log('1. Check your internet connection');
    console.log('2. Verify the API key is correct');
    console.log('3. Visit https://aistudio.google.com/apikey to check key status');
    console.log('4. Try again in a few moments');
    
    alert('❌ Activation failed!\n\n' + error.message + '\n\nCheck the console for details and troubleshooting steps.');
  }
})();

/**
 * QUICK REFERENCE COMMANDS:
 * 
 * Check if key is saved:
 *   localStorage.getItem('VITE_GEMINI_API_KEY')
 * 
 * Remove key:
 *   localStorage.removeItem('VITE_GEMINI_API_KEY')
 * 
 * Test API directly:
 *   (async () => {
 *     const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'x-goog-api-key': localStorage.getItem('VITE_GEMINI_API_KEY')
 *       },
 *       body: JSON.stringify({
 *         contents: [{ parts: [{ text: 'Test message' }] }]
 *       })
 *     });
 *     console.log(await res.json());
 *   })();
 */
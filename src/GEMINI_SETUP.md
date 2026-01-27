# 🤖 Gemini AI Setup Guide

## Quick Start (2 Minutes)

### Step 1: Get Your FREE Gemini API Key

1. **Visit Google AI Studio:**  
   👉 **[https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)**

2. **Sign in** with your Google account (or create one)

3. **Click "Create API Key"** or "Get API Key"

4. **Copy your key** - it looks like this:
   ```
   AIzaSyD9X2f3H8k5L1m4N6p7Q8r9S0t1U2v3W4x
   ```

### Step 2: Configure in the App

**Option A: In-App Setup (Recommended)**
1. Click the **Settings** tab in the app
2. Find the **"Gemini AI Setup"** section
3. Paste your API key
4. Click **"Save API Key"**
5. Done! ✅

**Option B: Environment Variable**
1. Create a `.env` file in the project root
2. Add this line:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
3. Restart the app

---

## 🎯 What Gemini AI Powers

### 1. **📄 Document Analysis**
Automatically analyze CPS documents to identify:
- Constitutional violations
- Procedural errors
- Rights violations
- Defense opportunities
- Action items

### 2. **⚖️ Defense Strategy Generation**
Generate comprehensive legal strategies based on:
- Identified violations
- Case timeline
- Documented facts
- Relevant case law

### 3. **📋 Motion Templates**
Create properly formatted legal motions:
- Motions to Suppress Evidence
- Motions to Dismiss
- Motions for Summary Judgment
- Constitutional challenges
- With citations and arguments

### 4. **🔍 Case Law Analysis**
Understand complex court opinions:
- Plain-language summaries
- Key legal principles
- How to apply to your case
- Important quotes to cite

### 5. **📊 Violation Analysis**
Deep analysis of each violation:
- Legal basis (laws violated)
- Severity assessment
- Available remedies
- Evidence requirements
- Relevant precedents

### 6. **❓ Legal Q&A Assistant**
Get answers to your legal questions:
- Context-aware responses
- Practical next steps
- Rights explanations
- Case-specific guidance

---

## 💰 Pricing (It's FREE!)

### Google Gemini Free Tier
- ✅ **15 requests per minute**
- ✅ **1 million tokens per minute**
- ✅ **1500 requests per day**
- ✅ **No credit card required**
- ✅ **More than enough for CPS case analysis**

**Example:** Analyzing 50 documents per day is well within limits!

### What Counts as a Request?
- 1 document analysis = 1 request
- 1 defense strategy = 1 request
- 1 motion generation = 1 request
- 1 Q&A = 1 request

---

## 🔒 Privacy & Security

### Where is Your API Key Stored?
- **Browser LocalStorage** (if using in-app setup)
- **Your `.env` file** (if using environment variable)
- ❌ **NEVER sent to our servers**

### What Data Goes to Google?
When you use AI features, the following is sent to Google Gemini API:
- Document text you upload
- Case facts you enter
- Violations you select
- Questions you ask

### Google's Privacy Policy
Review Google's terms and privacy policy:
- [Gemini API Terms](https://ai.google.dev/gemini-api/terms)
- [Google Privacy Policy](https://policies.google.com/privacy)

### Best Practices
1. ✅ Don't share your API key with others
2. ✅ Be mindful of sensitive information in documents
3. ✅ Review Google's data handling policies
4. ✅ Use "redacted" versions of documents if needed

---

## 🛠️ Technical Details

### API Endpoint
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

### Model Used
**Gemini 2.5 Flash** - Google's latest, fastest, most intelligent model
- Fast response times
- High quality analysis
- Multimodal (text, images, documents)
- Optimized for complex reasoning

### Request Format
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Your prompt here"
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 2048
  }
}
```

### Response Format
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "AI response here"
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP"
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 123,
    "candidatesTokenCount": 456,
    "totalTokenCount": 579
  }
}
```

---

## 🎓 How the AI Works

### System Instructions
Each AI feature uses specialized system instructions to act as:
- **Document Analyzer**: Identifies violations and defense opportunities
- **Defense Strategist**: Creates comprehensive legal strategies
- **Legal Researcher**: Summarizes case law
- **Motion Drafter**: Writes properly formatted legal documents
- **Q&A Assistant**: Answers legal questions clearly

### Temperature Settings
- **0.6**: Case law analysis (more factual, less creative)
- **0.7**: Document analysis, violation analysis (balanced)
- **0.8**: Defense strategies (more creative, strategic)

### Token Limits
- **Document Analysis**: Up to 2,048 tokens (~1,500 words)
- **Defense Strategies**: Up to 3,072 tokens (~2,250 words)
- **Motion Templates**: Up to 4,096 tokens (~3,000 words)
- **Q&A**: Up to 1,536 tokens (~1,150 words)

---

## ❓ Troubleshooting

### "API Key Not Configured" Error
**Solution:** Set up your API key in Settings or `.env` file

### "Invalid API Key" Error
**Solutions:**
1. Check that you copied the entire key
2. Make sure there are no extra spaces
3. Verify the key at [Google AI Studio](https://aistudio.google.com/apikey)
4. Generate a new key if needed

### "Rate Limit Exceeded" Error
**Solutions:**
1. Wait 1 minute (you hit the 15 requests/minute limit)
2. You likely analyzed many documents very quickly
3. Free tier limits reset every minute

### Slow Responses
**Possible Causes:**
1. Large document being analyzed (more tokens = longer)
2. Internet connection speed
3. Google's server load

**Solutions:**
1. Break large documents into smaller sections
2. Check your internet connection
3. Try again in a moment

### "No Response from AI" Error
**Solutions:**
1. Check your internet connection
2. Verify API key is valid
3. Check [Google AI Studio Status](https://status.cloud.google.com/)
4. Try again in a moment

---

## 🔧 Advanced Configuration

### Custom Temperature
Edit `/utils/gemini-api.ts` to adjust creativity:
```typescript
generationConfig: {
  temperature: 0.7, // 0.0 = factual, 1.0 = creative
  maxOutputTokens: 2048,
}
```

### Custom System Instructions
Modify system instructions in `/utils/gemini-api.ts`:
```typescript
const systemInstruction = `You are a CPS defense AI...`;
```

### Streaming Responses
Use `streamGenerateContent()` for real-time streaming:
```typescript
for await (const chunk of streamGenerateContent(request)) {
  console.log(chunk.candidates[0].content.parts[0].text);
}
```

### Multi-Turn Conversations
Use `GeminiChat` class for chat-style interactions:
```typescript
const chat = new GeminiChat('You are a legal assistant...');
const response1 = await chat.sendMessage('What are my Fourth Amendment rights?');
const response2 = await chat.sendMessage('How do I enforce them?');
```

---

## 📚 Resources

### Official Documentation
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [API Reference](https://ai.google.dev/api)
- [Quickstart Guide](https://ai.google.dev/gemini-api/docs/quickstart)

### Code Examples
- [Python Examples](https://github.com/google/generative-ai-python)
- [Node.js Examples](https://github.com/google/generative-ai-js)
- [REST API Examples](https://ai.google.dev/gemini-api/docs/rest)

### Support
- [Google AI Community](https://ai.google.dev/community)
- [Stack Overflow (tag: gemini-api)](https://stackoverflow.com/questions/tagged/gemini-api)
- [Issue Tracker](https://issuetracker.google.com/issues?q=componentid:1230946)

---

## ⚖️ Legal Disclaimer

**IMPORTANT:** AI-generated analysis, strategies, and documents are for **educational purposes only** and do **NOT constitute legal advice**.

- ❌ AI is not a substitute for a licensed attorney
- ❌ AI may make mistakes or miss important details
- ❌ Laws vary by jurisdiction and change over time
- ✅ Always consult with a qualified attorney
- ✅ Use AI as a research and educational tool
- ✅ Verify all information with legal professionals

**The CPS Case Defense Analyzer and Google Gemini AI are tools to help you understand and organize your case, but they cannot replace professional legal representation.**

---

## 🎉 You're All Set!

Once configured, you'll have access to enterprise-grade AI analysis that helps you:
1. 📄 Understand complex legal documents
2. ⚖️ Build strong defense strategies
3. 📋 Draft professional legal motions
4. 🔍 Research and apply case law
5. ❓ Get answers to legal questions
6. 📊 Identify and analyze violations

**Ready to get started?**  
👉 **[Get Your Free API Key](https://aistudio.google.com/apikey)**

---

*Last Updated: November 2024*  
*Gemini 2.5 Flash Model*  
*CPS Case Defense Analyzer v2.0*

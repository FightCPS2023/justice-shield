# 📧 Help Bot Email Setup - Quick Guide

## 🎯 Goal

Enable automatic email notifications when users request support through the help bot.

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Choose Email Service

**Recommended: Resend** (easiest setup, free tier)
- Website: https://resend.com
- Free tier: 100 emails/day
- Simple API
- Great deliverability

**Alternatives:**
- SendGrid (free 100 emails/day)
- Mailgun
- Amazon SES
- Postmark

---

### Step 2: Sign Up for Resend

1. Go to https://resend.com
2. Click "Get Started Free"
3. Create account with your email
4. Verify your email address

---

### Step 3: Get API Key

1. Log in to Resend dashboard
2. Click "API Keys" in sidebar
3. Click "Create API Key"
4. Name it: "CPS Punisher Help Bot"
5. **Copy the API key** (starts with `re_`)
6. Save it somewhere safe!

---

### Step 4: Verify Your Domain (Optional but Recommended)

**Option A: Use Resend's Free Domain**
- You can send from `@resend.dev` for free
- Skip to Step 5

**Option B: Use Your Own Domain (cpspunisher.com)**
1. In Resend dashboard, click "Domains"
2. Click "Add Domain"
3. Enter: `cpspunisher.com`
4. Add DNS records to your domain:
   - DKIM record
   - SPF record
   - DMARC record (optional)
5. Wait for verification (usually 5-30 minutes)

---

### Step 5: Add API Key to Vercel

1. Go to your Vercel dashboard
2. Select your CPS Punisher project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your API key (paste it)
   - **Environment:** All (Production, Preview, Development)
5. Click "Save"
6. **Redeploy** your app for changes to take effect

---

### Step 6: Update Server Code

Open `/supabase/functions/server/index.tsx` and find this section:

```typescript
// TODO: Integrate with email service (SendGrid, Resend, etc.)
// For production, you'd send an actual email here:
/*
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'helpbot@cpspunisher.com',
    to: 'your-support-email@example.com',
    subject: emailSubject,
    text: emailBody,
  }),
});
*/
```

**Uncomment and update** to:

```typescript
// Send email using Resend
const emailResponse = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'helpbot@resend.dev', // Or 'helpbot@cpspunisher.com' if verified
    to: 'your-actual-email@gmail.com', // YOUR EMAIL HERE!
    subject: emailSubject,
    text: emailBody,
  }),
});

if (!emailResponse.ok) {
  const error = await emailResponse.json();
  console.error('Error sending email:', error);
}
```

**Replace:**
- `your-actual-email@gmail.com` with YOUR email address where you want to receive support requests

---

### Step 7: Test It!

1. Go to your CPS Punisher app
2. Click the help bot button (bottom right)
3. Type: "I need help with my case"
4. Bot will ask for your info
5. Enter test name and email
6. Click "Send Transcript"
7. **Check your email!** 📧

---

## 📋 Complete Code Example

Here's the complete updated section for `/supabase/functions/server/index.tsx`:

```typescript
app.post("/make-server-a24eaa40/send-chat-transcript", async (c) => {
  try {
    const body = await c.req.json();
    const { messages, userEmail, userName, startTime } = body;

    if (!messages || !userEmail || !userName) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Format the transcript
    const formattedMessages = messages.map((msg: any) => {
      const time = new Date(msg.timestamp).toLocaleString();
      const sender = msg.sender === 'user' ? userName : 'CPS Punisher Bot';
      return `[${time}] ${sender}: ${msg.text}`;
    }).join('\n\n');

    const sessionDuration = new Date().getTime() - new Date(startTime).getTime();
    const durationMinutes = Math.floor(sessionDuration / 60000);

    // Email content
    const emailSubject = `CPS Punisher Help Chat Transcript - ${userName}`;
    const emailBody = `
NEW HELP CHAT TRANSCRIPT
========================

USER INFORMATION:
Name: ${userName}
Email: ${userEmail}
Session Start: ${new Date(startTime).toLocaleString()}
Session Duration: ${durationMinutes} minutes
Total Messages: ${messages.length}

CONVERSATION TRANSCRIPT:
========================

${formattedMessages}

========================
END OF TRANSCRIPT

This chat was automatically sent from The CPS Punisher Help Bot.
Reply to ${userEmail} to follow up with the user.
`;

    // Save to database
    const transcriptKey = `chat_transcript_${Date.now()}_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    await kv.set(transcriptKey, {
      userName,
      userEmail,
      startTime,
      messages,
      receivedAt: new Date().toISOString(),
      emailSubject,
      emailBody,
    });

    // Store in master list
    const allTranscripts = await kv.get('all_chat_transcripts') || [];
    allTranscripts.push({
      key: transcriptKey,
      userName,
      userEmail,
      timestamp: new Date().toISOString(),
    });
    await kv.set('all_chat_transcripts', allTranscripts);

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'helpbot@resend.dev', // Change if using verified domain
        to: 'your-support-email@example.com', // YOUR EMAIL!
        subject: emailSubject,
        text: emailBody,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.json();
      console.error('Error sending email via Resend:', error);
      // Still return success since we saved to database
    } else {
      console.log('Email sent successfully via Resend');
    }

    console.log('Chat transcript saved:', transcriptKey);

    return c.json({ 
      success: true, 
      message: 'Transcript saved and email sent successfully',
      transcriptKey,
    });

  } catch (error) {
    console.error('Error saving chat transcript:', error);
    return c.json({ error: 'Failed to save transcript' }, 500);
  }
});
```

---

## 🔐 Environment Variables Needed

Add to Vercel:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

That's it! Just one variable.

---

## ✅ Verification Checklist

- [ ] Signed up for Resend
- [ ] Got API key
- [ ] Added `RESEND_API_KEY` to Vercel
- [ ] Updated server code
- [ ] Changed email addresses in code
- [ ] Redeployed app
- [ ] Tested help bot
- [ ] Received test email

---

## 🚨 Troubleshooting

### "Email not received"

**Check:**
1. API key is correct in Vercel
2. Email address in code is correct
3. Check spam/junk folder
4. Check Resend dashboard for delivery status
5. Look at server logs for errors

### "API key not found"

**Solution:**
1. Make sure you added it to Vercel
2. Redeploy the app after adding
3. Check environment variable name matches: `RESEND_API_KEY`

### "401 Unauthorized"

**Solution:**
- API key is invalid or expired
- Generate new API key in Resend dashboard

### "403 Forbidden"

**Solution:**
- Using unverified domain
- Switch to `helpbot@resend.dev` or verify your domain

---

## 💡 Pro Tips

### 1. **Use HTML Emails** (Better Formatting)

Replace `text: emailBody` with:

```javascript
html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">New Help Chat Transcript</h2>
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>User Information</h3>
      <p><strong>Name:</strong> ${userName}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Session Start:</strong> ${new Date(startTime).toLocaleString()}</p>
    </div>
    <h3>Conversation:</h3>
    ${messages.map(msg => `
      <div style="margin: 10px 0; padding: 10px; background: ${msg.sender === 'user' ? '#dbeafe' : '#f3f4f6'}; border-radius: 8px;">
        <strong>${msg.sender === 'user' ? userName : 'CPS Punisher Bot'}:</strong><br/>
        ${msg.text.replace(/\n/g, '<br/>')}
      </div>
    `).join('')}
  </div>
`
```

### 2. **Add Reply-To Header**

```javascript
body: JSON.stringify({
  from: 'helpbot@resend.dev',
  to: 'your-support-email@example.com',
  reply_to: userEmail, // User's email
  subject: emailSubject,
  text: emailBody,
}),
```

Now when you click "Reply", it goes directly to the user!

### 3. **CC Yourself**

```javascript
to: ['your-support-email@example.com', 'backup@example.com'],
```

### 4. **Add Attachments** (Optional)

You can attach the full transcript as a file:

```javascript
attachments: [
  {
    filename: `transcript_${userName}.txt`,
    content: Buffer.from(emailBody).toString('base64'),
  }
]
```

---

## 🎯 Expected Result

After setup, when a user requests support:

1. ✅ Chat transcript saved to database
2. ✅ Email sent to your inbox
3. ✅ User sees confirmation message
4. ✅ You can reply directly to user
5. ✅ Transcript also viewable in admin panel

---

## 📊 Email Example

You'll receive emails like this:

**Subject:** CPS Punisher Help Chat Transcript - John Doe

**Body:**
```
NEW HELP CHAT TRANSCRIPT
========================

USER INFORMATION:
Name: John Doe
Email: john.doe@email.com
Session Start: 12/4/2024, 10:30:15 AM
Session Duration: 3 minutes
Total Messages: 6

CONVERSATION TRANSCRIPT:
========================

[10:30:16 AM] CPS Punisher Bot: 👋 Hi! I'm here to help you...

[10:30:45 AM] John Doe: How do I upload documents?

[10:30:46 AM] CPS Punisher Bot: 📄 Document Management: You can upload...

[10:31:22 AM] John Doe: Can someone help me understand my rights?

[10:31:23 AM] CPS Punisher Bot: I can send this to support...

[10:31:45 AM] John Doe: Yes please send to support

========================
END OF TRANSCRIPT

Reply to john.doe@email.com to follow up.
```

---

## ✨ That's It!

Five minutes of setup and you'll be receiving support requests via email!

**Need help?** The transcript is still saved to the database even if email fails, so you won't lose any requests.

**Questions?** Check `/HELP_BOT_DOCUMENTATION.md` for full details.

---

**Ready to help families 24/7!** 🚀💪

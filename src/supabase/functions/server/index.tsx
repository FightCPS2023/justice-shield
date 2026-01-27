import * as kv from "./kv_store.tsx";
import stripeApp from "./stripe.tsx";
import bulkDataApp from "./bulk-data.tsx";
import calendarApp from "./calendar.tsx";
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
// TEMPORARILY DISABLED: Community routes pending community.tsx restoration
// import communityApp from "./community.tsx";

const app = new Hono();

// Create Supabase client for auth
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "stripe-signature"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Mount Stripe routes
app.route('/make-server-a24eaa40/stripe', stripeApp);

// Mount Bulk Data routes
app.route('/make-server-a24eaa40/bulk-data', bulkDataApp);

// Mount Calendar routes
app.route('/make-server-a24eaa40/calendar', calendarApp);

// TEMPORARILY DISABLED: Community routes pending community.tsx restoration
// Mount Community routes (Advocates & Resources)
// app.route('/make-server-a24eaa40/community', communityApp);

// ===== HELP BOT CHAT TRANSCRIPT =====

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

    // Send email using your email service
    // For now, we'll save it to the database and you can retrieve it
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

    // Store in a list of all transcripts
    const allTranscripts = await kv.get('all_chat_transcripts') || [];
    allTranscripts.push({
      key: transcriptKey,
      userName,
      userEmail,
      timestamp: new Date().toISOString(),
    });
    await kv.set('all_chat_transcripts', allTranscripts);

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

    console.log('Chat transcript saved:', transcriptKey);
    console.log('Email would be sent to support with subject:', emailSubject);

    return c.json({ 
      success: true, 
      message: 'Transcript saved successfully',
      transcriptKey,
    });

  } catch (error) {
    console.error('Error saving chat transcript:', error);
    return c.json({ error: 'Failed to save transcript' }, 500);
  }
});

// Get all chat transcripts (admin endpoint)
app.get("/make-server-a24eaa40/chat-transcripts", async (c) => {
  try {
    const allTranscripts = await kv.get('all_chat_transcripts') || [];
    return c.json({ transcripts: allTranscripts });
  } catch (error) {
    console.error('Error getting chat transcripts:', error);
    return c.json({ error: 'Failed to get transcripts' }, 500);
  }
});

// Get specific transcript
app.get("/make-server-a24eaa40/chat-transcripts/:key", async (c) => {
  try {
    const key = c.req.param('key');
    const transcript = await kv.get(key);
    
    if (!transcript) {
      return c.json({ error: 'Transcript not found' }, 404);
    }

    return c.json({ transcript });
  } catch (error) {
    console.error('Error getting transcript:', error);
    return c.json({ error: 'Failed to get transcript' }, 500);
  }
});

// ===== AUTHENTICATION ROUTES =====

// SIGNUP
app.post("/make-server-a24eaa40/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true,
      userId: data.user.id,
      message: 'Account created successfully'
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// LOGIN
app.post("/make-server-a24eaa40/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // Get SUPABASE_ANON_KEY from environment - NO FALLBACK for security
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    console.log('Login attempt:', { email, hasPassword: !!password });
    console.log('SUPABASE_URL exists:', !!supabaseUrl);
    console.log('SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);

    if (!supabaseUrl) {
      console.error('Missing SUPABASE_URL environment variable');
      return c.json({ error: 'Server configuration error: Missing SUPABASE_URL' }, 500);
    }

    const anonSupabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await anonSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return c.json({ error: error.message }, 401);
    }

    if (!data.session || !data.user) {
      console.error('Login successful but missing session data');
      return c.json({ error: 'Authentication failed: Invalid session' }, 401);
    }

    console.log('Login successful for user:', data.user.id);

    return c.json({
      success: true,
      accessToken: data.session.access_token,
      userId: data.user.id,
      user: {
        email: data.user.email,
        name: data.user.user_metadata?.name
      }
    });
  } catch (error: any) {
    console.error('Login endpoint error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// ===== AUTHENTICATION MIDDLEWARE =====

const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const accessToken = authHeader?.split(' ')[1];

  if (!accessToken) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', user.id);
  await next();
};

// ===== DATA PERSISTENCE ROUTES =====

// SAVE DATA
app.post("/make-server-a24eaa40/data/save", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();

    await kv.set(`user_data:${userId}`, {
      ...body,
      lastSaved: new Date().toISOString()
    });

    return c.json({ 
      success: true,
      message: 'Data saved successfully' 
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// LOAD DATA
app.get("/make-server-a24eaa40/data/load", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const data = await kv.get(`user_data:${userId}`);

    if (!data) {
      return c.json({
        success: true,
        data: {
          documents: [],
          timelineEvents: [],
          caseDetails: {
            caseNumber: "",
            county: "",
            dateOpened: "",
            caseworker: "",
            attorney: "",
          },
          violations: {}
        }
      });
    }

    return c.json({
      success: true,
      data
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ===== HEALTH CHECK =====

app.get("/make-server-a24eaa40/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== START SERVER =====

Deno.serve(app.fetch);
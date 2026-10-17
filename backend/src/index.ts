import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// Mandatory Health Check Endpoint for Render
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Sesh@ Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// OAuth ID Token Verification Endpoint
app.post('/api/auth/verify', async (req: Request, res: Response): Promise<any> => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'Missing idToken in request body' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ error: 'Invalid Google identity payload' });
    }

    if (!payload.email_verified) {
      return res.status(403).json({ error: 'Google email address is not verified' });
    }

    return res.status(200).json({
      verified: true,
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });
  } catch (error: any) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Token verification failed', message: error.message });
  }
});

// Start Server on 0.0.0.0
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Sesh@ Backend listening on 0.0.0.0:${PORT}`);
});

import { Router } from 'express';
import { sendEmail } from '../controllers/email.controller';

const router = Router();

// POST /send-email - Send an email
router.post('/send-email', sendEmail);

export default router;
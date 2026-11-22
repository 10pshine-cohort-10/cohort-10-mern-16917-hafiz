import { Router } from 'express';
import validate from '../middlewares/validate';
import authenticate from '../middlewares/authenticate';
import { authLimiter } from '../middlewares/rateLimiter';
import { signupSchema, loginSchema } from '../validators/authValidators';
import { signup, login, me } from '../controllers/authController';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', authenticate, me);

export default router;

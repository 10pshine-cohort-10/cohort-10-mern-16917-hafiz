import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler';
import validate from '../middlewares/validate';
import authenticate from '../middlewares/authenticate';
import { authLimiter } from '../middlewares/rateLimiter';
import { signupSchema, loginSchema } from '../validators/authValidators';
import { signup, login, me } from '../controllers/authController';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), asyncHandler(signup));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(login));
router.get('/me', authenticate, asyncHandler(me));

export default router;

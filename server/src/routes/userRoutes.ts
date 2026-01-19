import { Router } from 'express';
import { verifyAuth } from '../middleware/authMiddleware';
import { syncUser } from '../controllers/userController';

const router = Router();

router.post('/', verifyAuth, syncUser);

export default router;

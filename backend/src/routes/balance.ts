import express from 'express'
import {getBalances,deposit} from '../controllers/balancecontroller';
import {authenticateToken} from '../middleware/auth';

const router =express.Router();

router.get('/',authenticateToken,getBalances);
router.post('/deposit',authenticateToken,deposit);

export default router;







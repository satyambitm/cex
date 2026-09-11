import express from 'express';
import {createOrder ,cancelOrder,getMarketDepth} from '../controllers/ordercontrollers';
import {authenticateToken} from '../middleware/auth'

const router =express.Router();

router.post('/',authenticateToken,createOrder);
router.delete('/:orderId',authenticateToken,cancelOrder);
router.get('/depth/:market',getMarketDepth);



export default router;


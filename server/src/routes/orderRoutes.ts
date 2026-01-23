import { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getInvoice } from '../controllers/orderController';
import { verifyAuth } from '../middleware/authMiddleware';
import { Router } from 'express';


const router = Router();

// Protected Routes
router.get('/my-orders', verifyAuth, getMyOrders);
router.get('/admin/all', verifyAuth, getAllOrders); // In real app, verifyAdmin
router.patch('/:id/status', verifyAuth, updateOrderStatus); // In real app, verifyAdmin
router.get('/:id/invoice', verifyAuth, getInvoice);
router.post('/', verifyAuth, createOrder);

export default router;

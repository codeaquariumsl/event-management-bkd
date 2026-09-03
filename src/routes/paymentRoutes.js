import { Router } from 'express';
import {
  getCustomerPayments,
  recordCustomerPayment,
  getStaffPayments,
  recordStaffPayment,
} from '../controllers/paymentController.js';

const router = Router();

router.get('/customer', getCustomerPayments);
router.post('/customer', recordCustomerPayment);
router.get('/staff', getStaffPayments);
router.post('/staff', recordStaffPayment);

export default router;

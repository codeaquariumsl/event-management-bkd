import { Router } from 'express';
import {
  getCustomerPayments,
  recordCustomerPayment,
  getStaffPayments,
  recordStaffPayment,
  updateStaffPayment,
  deleteStaffPayment,
} from '../controllers/paymentController.js';

const router = Router();

router.get('/customer', getCustomerPayments);
router.post('/customer', recordCustomerPayment);
router.get('/staff', getStaffPayments);
router.post('/staff', recordStaffPayment);
router.put('/staff/:id', updateStaffPayment);
router.delete('/staff/:id', deleteStaffPayment);

export default router;

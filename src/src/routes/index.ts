import { Router } from 'express';
import generateRouter from './generatePDF'

// Init router and path
const router = Router();

// Add sub-routes
router.use('/generate', generateRouter);


// Export the base-router
export default router;

import express from 'express';
import {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer
} from '../controllers/offerController.js';

const router = express.Router();

router.get('/', getOffers);
router.get('/:id', getOfferById);
router.post('/', createOffer);
router.put('/:id', updateOffer);
router.delete('/:id', deleteOffer);

export default router;

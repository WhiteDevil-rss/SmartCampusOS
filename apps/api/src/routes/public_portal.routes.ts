import { Router } from 'express';

const router = Router();

// Fetch public portal config
router.get('/:universitySlug/config', (req, res) => {
    res.json({ message: 'Get public portal config logic goes here' });
});

// Submit admission application
router.post('/:universitySlug/admissions/apply', (req, res) => {
    res.json({ message: 'Apply for admission logic goes here' });
});

export default router;

import { Router, Request, Response } from 'express';
import { memoryStore } from '../memoryStore';
import WebsiteContentModel from '../models/WebsiteContent';
import { adminOnly } from '../middleware/auth';

const router = Router();

// GET /api/website-content - Retrieve current website dynamic content
router.get('/', async (req: Request, res: Response) => {
  try {
    // 1. Try Mongo if connected
    try {
      const doc = await WebsiteContentModel.findOne({ contentKey: 'main_website_content' });
      if (doc && doc.data) {
        return res.json({ success: true, data: doc.data });
      }
    } catch (dbErr) {
      // MongoDB might be disconnected; continue to fallback
    }

    // 2. Fallback to memoryStore
    const data = memoryStore.getWebsiteContent();
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching website content:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch website content', error: error.message });
  }
});

// PUT /api/website-content - Update website content
router.put('/', adminOnly, async (req: Request, res: Response) => {
  try {
    const incomingData = req.body;
    if (!incomingData || typeof incomingData !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    // Defensively filter out any completely blank list items before saving
    if (incomingData.services?.servicesList?.items) {
      incomingData.services.servicesList.items = incomingData.services.servicesList.items.filter(
        (s: any) => (s.title?.en?.trim() || s.title?.ku?.trim() || s.title?.ar?.trim()) &&
                    (s.description?.en?.trim() || s.description?.ku?.trim() || s.description?.ar?.trim())
      );
    }
    if (incomingData.services?.whyChoose?.items) {
      incomingData.services.whyChoose.items = incomingData.services.whyChoose.items.filter(
        (s: any) => s.title?.en?.trim() || s.title?.ku?.trim() || s.title?.ar?.trim()
      );
    }
    if (incomingData.home?.howItWorks?.items) {
      incomingData.home.howItWorks.items = incomingData.home.howItWorks.items.filter(
        (s: any) => s.stepNumber?.trim() || s.title?.en?.trim() || s.title?.ku?.trim()
      );
    }
    if (incomingData.home?.globalWebsites?.items) {
      incomingData.home.globalWebsites.items = incomingData.home.globalWebsites.items.filter(
        (s: any) => s.name?.trim() && s.url?.trim()
      );
    }
    if (incomingData.home?.features?.items) {
      incomingData.home.features.items = incomingData.home.features.items.filter(
        (s: any) => s.title?.en?.trim() || s.title?.ku?.trim() || s.title?.ar?.trim()
      );
    }
    if (incomingData.about?.whatWeDo?.items) {
      incomingData.about.whatWeDo.items = incomingData.about.whatWeDo.items.filter(
        (s: any) => s.title?.en?.trim() || s.title?.ku?.trim() || s.title?.ar?.trim()
      );
    }
    if (incomingData.about?.values?.items) {
      incomingData.about.values.items = incomingData.about.values.items.filter(
        (s: any) => s.title?.en?.trim() || s.title?.ku?.trim() || s.title?.ar?.trim()
      );
    }
    if (incomingData.about?.process?.items) {
      incomingData.about.process.items = incomingData.about.process.items.filter(
        (s: any) => s.label?.en?.trim() || s.label?.ku?.trim() || s.label?.ar?.trim()
      );
    }
    if (incomingData.offers?.featuredDeals?.items) {
      incomingData.offers.featuredDeals.items = incomingData.offers.featuredDeals.items.filter(
        (s: any) => s.title?.en?.trim() || s.discount?.trim()
      );
    }
    if (incomingData.offers?.storeDeals?.items) {
      incomingData.offers.storeDeals.items = incomingData.offers.storeDeals.items.filter(
        (s: any) => s.storeName?.trim() && s.code?.trim()
      );
    }
    if (incomingData.contact?.officeLocations?.items) {
      incomingData.contact.officeLocations.items = incomingData.contact.officeLocations.items.filter(
        (s: any) => s.city?.en?.trim() || s.address?.en?.trim()
      );
    }
    if (incomingData.contact?.faq?.items) {
      incomingData.contact.faq.items = incomingData.contact.faq.items.filter(
        (s: any) => s.question?.en?.trim() || s.question?.ku?.trim() || s.question?.ar?.trim()
      );
    }
    if (incomingData.products?.items) {
      incomingData.products.items = incomingData.products.items.filter(
        (p: any) => (p.title?.en?.trim() || p.title?.ku?.trim() || p.title?.ar?.trim()) &&
                    Number(p.price) > 0
      );
    }

    // Save in memoryStore (which also persists to JSON file)
    const updated = memoryStore.updateWebsiteContent(incomingData);

    // Save in Mongo if possible
    try {
      await WebsiteContentModel.findOneAndUpdate(
        { contentKey: 'main_website_content' },
        { data: updated },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      // Mongo optional fallback
    }

    return res.json({ success: true, message: 'Website content updated successfully', data: updated });
  } catch (error: any) {
    console.error('Error updating website content:', error);
    return res.status(500).json({ success: false, message: 'Failed to update website content', error: error.message });
  }
});

// POST /api/website-content/reset - Reset to factory defaults
router.post('/reset', adminOnly, async (req: Request, res: Response) => {
  try {
    const defaults = memoryStore.resetWebsiteContent();

    try {
      await WebsiteContentModel.findOneAndUpdate(
        { contentKey: 'main_website_content' },
        { data: defaults },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      // Ignore Mongo error
    }

    return res.json({ success: true, message: 'Content reset to factory defaults', data: defaults });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to reset content', error: error.message });
  }
});

export default router;

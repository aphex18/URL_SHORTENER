import express from 'express';

import { shortenPostRequestBodySchema } from '../validation/request.validation.js';

import db from '../db/index.js';

import { urlsTable } from '../models/index.js';

import { nanoid } from 'nanoid';

import { ensureAuthenticated } from '../middlewares/auth.middleware.js';

import { insertUrl } from '../services/urls.service.js';

import { eq, and } from 'drizzle-orm';

const router = express.Router();

router.post("/shorten", ensureAuthenticated, async (req, res) => {

    const validationResult = await shortenPostRequestBodySchema.safeParseAsync(req.body);

    if (validationResult.error) {
        return res.status(400).json({error: validationResult.error.format()});
    }

    const { url, code } = validationResult.data;

    const shortCode = code ?? nanoid(6);

    const userId = req.user.id;

    const result = await insertUrl(url, shortCode, userId);

    return res.status(201)
              .json({
                message: "URL shortened successfully",
                url: {
                    id: result.id,
                    shortCode: result.shortCode,
                    targetUrl: result.targetUrl
                }
              });

});

router.get("/codes", ensureAuthenticated, async (req, res) => {
    const userId = req.user.id;

    const result = await db.select().from(urlsTable).where(eq(urlsTable.userId, userId));

    if (!result) {
        return res.status(404).json({error: "No URLs found for this user"});
    };

    return res.status(200).json({ result });
});

router.delete("/:id", ensureAuthenticated, async (req, res) => {
    const urlId = req.params.id;
    
    await db.delete(urlsTable).where(and(
        eq(urlsTable.id, urlId),
        eq(urlsTable.userId, req.user.id)
    ));

    return res.status(200).json({ message: "URL deleted successfully" });

});

router.get("/:shortCode", async (req, res) => {
    const code = req.params.shortCode;
    const [result] = await db.select({
        targetUrl: urlsTable.targetUrl
    }).from(urlsTable).where(eq(urlsTable.shortCode, code));

    if (!result) {
        return res.status(404).json({error: "Short URL not found"});
    };

    return res.redirect(result.targetUrl);

});

export default router;
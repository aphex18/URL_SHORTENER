import db from "../db/index.js";

import { urlsTable } from "../models/index.js";

export async function insertUrl(url, shortCode, userId) {
    const [result] = await db.insert(urlsTable).values({
            shortCode,
            targetUrl: url,
            userId
        }).returning({
                    id: urlsTable.id,
                    shortCode: urlsTable.shortCode,
                    targetUrl: urlsTable.targetUrl,
                });
    return result;
}
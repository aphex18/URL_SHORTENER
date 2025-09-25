import jwt from 'jsonwebtoken';

import { userTokenSchema } from '../validation/token.validation.js';

const JWT_SECRET = process.env.JWT_SECRET;

export async function createUserToken(payload){

    const validationResult = await userTokenSchema.safeParseAsync(payload);

    if (validationResult.error) {
        return res.status(400).json({error: validationResult.error.format()});
    }

    const payloadValidatedData = validationResult.data;

    const token = jwt.sign(payloadValidatedData, JWT_SECRET);

    return token;

};


export function validateUserToken(token) {
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        return payload;
    } catch (error) {
        return null;
    }
};
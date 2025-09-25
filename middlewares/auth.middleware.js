/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */

import { validateUserToken } from "../utils/token.js";  


export function authenticationMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];

    if(!authHeader) {
        return next();
    }

    // const token = authHeader.split(' ')[1];

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Invalid authorization header format" });
    };

    const [_, token] = authHeader.split(' ');

    const payload = validateUserToken(token);

    req.user = payload;
    next();


};


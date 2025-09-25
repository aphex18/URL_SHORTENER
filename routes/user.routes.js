import express from 'express';

import db from "../db/index.js";

import { usersTable } from "../models/index.js";

import { signupPostRequestBodySchema, loginPostRequestBodySchema } from '../validation/request.validation.js';

import { hashPasswordWithSalt } from '../utils/hash.js';

import { getUserByEmail, insertNewUser } from '../services/user.service.js';

import { createUserToken } from '../utils/token.js';
// import "dotenv/config";

import jwt from 'jsonwebtoken';

const router  = express.Router();

router.post("/signup", async (req, res) => {
    const validationResult = await signupPostRequestBodySchema.safeParseAsync(req.body);

    if (validationResult.error){
        return res.status(400).json({error: validationResult.error.format()});
    }

    const { firstname, lastname, email, password } = validationResult.data;

    const existingUser = await getUserByEmail(email);

   if (existingUser) {
    return res.status(400).json({ error: "User with this email already exists", email: existingUser.email });
   }

   const { salt, password: hashedPassword } = hashPasswordWithSalt(password);

   const user = await insertNewUser(firstname, lastname, email, hashedPassword, salt);   

    return res.status(201).json({ message: "User created successfully", userId: user.id });

});


router.post("/login", async (req, res) => {

    const validationResult = await loginPostRequestBodySchema.safeParseAsync(req.body);

    if (validationResult.error) {
        return res.status(400).json({error: validationResult.error.format()});
    }

    const { email, password } = validationResult.data;

    const user = await getUserByEmail(email);

    if (!user) {
        return res.status(400).json({ error: `User with email ${email} not found` });
    }

    // const salt = user.salt;

    const { password: hashedPassword } = hashPasswordWithSalt(password, user.salt);

    if (hashedPassword !== user.password) {
        return res.status(400).json({ error: "Invalid password" });
    }

    const token = await createUserToken({ 
                                        id: user.id,
                                        email: user.email
                                    });

    return res.status(200).json({ message: "Login successful", data: token });

});


export default router;
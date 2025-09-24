import express from 'express';

import db from "../db/index.js";

import { usersTable } from "../models/index.js";

import { signupPostRequestBodySchema } from '../validation/request.validation.js';

import { hashPasswordWithSalt } from '../utils/hash.js';

import { getUserByEmail, insertNewUser } from '../services/user.service.js';

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


export default router;
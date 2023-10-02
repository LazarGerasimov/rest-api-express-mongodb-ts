import express from 'express';

import { createUser, getUserByEmail } from '../services/userService';
import { authentication, randomizer } from '../auth_helpers';

export const register = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            console.log("All fields must be filled.");
            return res.sendStatus(400);
        };

        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            console.log("Username already exists.");
            return res.sendStatus(400);
        };

        // Happy path 
        const salt = randomizer();
        const user = await createUser({
            email,
            username,
            authentication: {
                salt: salt,
                password: authentication(salt, password)
            }
        });

        return res.status(200).json(user).end();

    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

export const login = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            console.log("All fields must be filled.");
            return res.sendStatus(400);
        };

        const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');

        if (!user) {
            console.log("User does not exist.");
            return res.sendStatus(400);
        };

        const expectedHash = authentication(user.authentication.salt, password);

        if (user.authentication.password !== expectedHash) {
            console.log("403 - Not Authorized")
            return res.sendStatus(403);
        }

        const salt = randomizer();
        user.authentication.sessionToken = authentication(salt, user._id.toString());

        await user.save();

        res.cookie('Auth:', user.authentication.sessionToken, { domain: 'localhost', path: '/' })

        return res.status(200).json(user).end();

    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}
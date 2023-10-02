import express from 'express';

import { createUser, getUserByEmail } from 'services/userService';
import { authentication, randomizer } from 'auth_helpers';

export const register = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            console.log("All fields must be filled.");
            return res.sendStatus(400);
        };

        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            console.log("No user with this name exists");
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

        return res.sendStatus(200).json(user).end();

    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}
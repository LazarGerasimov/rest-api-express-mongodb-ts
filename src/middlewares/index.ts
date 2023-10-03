import express from 'express';

import { get, merge } from 'lodash';

import { getUserBySessionToken } from '../services/userService';

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const sessionToken = req.cookies['Auth:'];

        if (!sessionToken) {
            console.log("403 - Not Authorized");
            return res.sendStatus(403);
        }

        const existingUser = await getUserBySessionToken(sessionToken);

        if (!existingUser) {
            console.log("Not authenticated");
            return res.sendStatus(403);
        }

        merge(req, { identity: existingUser });
        return next();

    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { id } = req.params;
        const currentUserId = get(req, 'identity._id') as string;

        if (!currentUserId) {
            console.log("You are not authorized to do that.");
            return res.sendStatus(403);
        }

        if (currentUserId.toString() !== id) {
            console.log("You are not the owner");
            return res.sendStatus(403);
        }

        next();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}
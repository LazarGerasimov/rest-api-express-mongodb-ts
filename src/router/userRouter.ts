import express from 'express';

import { deleteUser, getAllUsers } from '../controllers/userController';
import { isAuthenticated, isOwner } from '../middlewares';

export default (router: express.Router) => {
    router.get('/users', isAuthenticated, getAllUsers);
    router.delete('/users/:id', isOwner, deleteUser);
};
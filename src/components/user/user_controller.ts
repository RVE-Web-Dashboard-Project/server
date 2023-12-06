import { compare, genSaltSync, hashSync } from "bcryptjs";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { ExtractJwt } from "passport-jwt";
import { is } from "typia";

import Database from "../../database";

const db = Database.getInstance();

const JWT_EXPIRATION_PERIOD = process.env.JWT_TOKEN_EXPIRATION_DAYS + "d";

export async function listUsers(req: Request, res: Response) {
    const users = await db.user.findMany({
        select: {
            id: true,
            name: true,
            isAdmin: true,
            createdAt: true,
        },
    });
    return res.status(200).send(users);
}

export async function getMe(req: Request, res: Response) {
    if (!req.user) {
        res._err = "Unauthorized";
        return res.status(401).send(res._err);
    }
    const publicUserData = {
        id: req.user.id,
        name: req.user.name,
        isAdmin: req.user.isAdmin,
        createdAt: req.user.createdAt,
    };
    return res.status(200).send(publicUserData);
}

export async function login(req: Request<unknown, unknown, LoginParams>, res: Response) {
    // check arguments existense
    if (!is<LoginParams>(req.body)) {
        res._err = "Missing or invalid arguments";
        return res.status(400).send(res._err);
    }

    // get user from username
    const user = await db.user.findUnique({
        where: {
            name: req.body.username,
        },
    });
    if (user === null) {
        res._err = "Invalid username or password";
        return res.status(400).send(res._err);
    }

    // compare password with its stored hash
    const passwordMatch = await compare(req.body.password, user.password);
    if (!passwordMatch) {
        res._err = "Invalid username or password";
        return res.status(400).send(res._err);
    }

    // create a new token
    const tokenUserData = {
        id: user.id,
        name: user.name,
    };
    const token = sign( { result: tokenUserData }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRATION_PERIOD });

    // store token in database
    await db.userToken.create({
        data: {
            token: token,
            userId: user.id,
        },
    });

    const publicUserData = {
        id: user.id,
        name: user.name,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
    };

    return res.status(200).send({ ...publicUserData, token: token });
}

export async function logout(req: Request, res: Response) {
    // get token from request
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token === null) {
        res._err = "Missing token";
        return res.status(400).send(res._err);
    }
    // delete token from database
    await db.userToken.delete({
        where: {
            token: token,
        },
    });

    return res.sendStatus(200);
}

export async function editPassword(req: Request<unknown, unknown, ChangePasswordParams>, res: Response) {
    // check arguments existense
    if (!is<ChangePasswordParams>(req.body)) {
        res._err = "Missing or invalid arguments";
        return res.status(400).send(res._err);
    }

    // re-check user authentication
    if (req.user === undefined) {
        res._err = "Unauthorized";
        return res.status(401).send(res._err);
    }

    // compare previous password with its stored hash
    const passwordMatch = await compare(req.body.oldPassword, req.user.password);
    if (!passwordMatch) {
        res._err = "Invalid password";
        return res.status(400).send(res._err);
    }

    // hash new password
    const salt = genSaltSync(10);
    const newPassword = hashSync(req.body.newPassword, salt);

    // update user password
    await db.user.update({
        where: {
            id: req.user.id,
        },
        data: {
            password: newPassword,
        },
    });

    // delete previous tokens from database
    await db.userToken.deleteMany({
        where: {
            userId: req.user.id,
        },
    });

    return res.sendStatus(200);
}

export async function deleteMe(req: Request<unknown, unknown, DeleteMyAccountParams>, res: Response) {
    // re-check user authentication
    if (req.user === undefined) {
        res._err = "Unauthorized";
        return res.status(401).send(res._err);
    }

    // check arguments existense
    if (!is<DeleteMyAccountParams>(req.body)) {
        res._err = "Missing or invalid arguments";
        return res.status(400).send(res._err);
    }

    // compare previous password with its stored hash
    const passwordMatch = await compare(req.body.password, req.user.password);
    if (!passwordMatch) {
        res._err = "Invalid password";
        return res.status(400).send(res._err);
    }

    // check if user is not the last user
    const users = await db.user.findMany();
    if (users.length === 1) {
        res._err = "There must be at least one user";
        return res.status(400).send(res._err);
    }

    // check if user is not the last admin
    const admins = await db.user.findMany({
        where: {
            isAdmin: true,
        },
    });
    if (admins.length === 1 && admins[0].id === req.user.id) {
        res._err = "There must be at least one admin";
        return res.status(400).send(res._err);
    }

    // delete user
    await db.user.delete({
        where: {
            id: req.user.id,
        },
    });

    // delete user tokens
    await db.userToken.deleteMany({
        where: {
            userId: req.user.id,
        },
    });

    return res.sendStatus(200);
}

export async function deleteUser(req: Request<{id: string}>, res: Response) {
    // convert id to number
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        res._err = "Invalid user id";
        return res.status(400).send(res._err);
    }

    // check if user exists
    const user = await db.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (user === null) {
        res._err = "User not found";
        return res.status(404).send(res._err);
    }

    // check if user is not deleting himself
    if (req.user?.id === userId) {
        res._err = "You cannot delete yourself";
        return res.status(400).send(res._err);
    }

    // delete user
    await db.user.delete({
        where: {
            id: userId,
        },
    });

    // delete user tokens
    await db.userToken.deleteMany({
        where: {
            userId: userId,
        },
    });

    return res.sendStatus(200);
}


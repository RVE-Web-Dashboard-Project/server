import { compare, genSaltSync, hashSync } from "bcryptjs";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { ExtractJwt } from "passport-jwt";
import { is } from "typia";

import Database from "../../database";

const db = Database.getInstance();

const JWT_EXPIRATION_PERIOD = process.env.JWT_TOKEN_EXPIRATION_DAYS + "d";

export async function login(req: Request<unknown, unknown, LoginParams>, res: Response) {
    // check arguments existense
    if (!is<LoginParams>(req.body)) {
        res._err = "Missing or invalid arguments";
        return res.status(400).send({ success: false, message: res._err });
    }

    // get user from username
    const user = await db.user.findUnique({
        where: {
            name: req.body.username,
        },
    });
    if (user === null) {
        res._err = "Invalid username or password";
        return res.status(400).send({ success: false, message: res._err });
    }

    // compare password with its stored hash
    const passwordMatch = await compare(req.body.password, user.password);
    if (!passwordMatch) {
        res._err = "Invalid username or password";
        return res.status(400).send({ success: false, message: res._err });
    }

    // create a new token
    const publicUserData = {
        id: user.id,
        name: user.name,
        isAdmin: user.isAdmin,
    };
    const token = sign( { result: publicUserData }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRATION_PERIOD });

    // store token in database
    await db.userToken.create({
        data: {
            token: token,
            userId: user.id,
        },
    });

    return res.status(200).send({ success: true, data: { id: user.id, token: token } });
}

export async function logout(req: Request, res: Response) {
    // get token from request
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req)!;
    // delete token from database
    await db.userToken.delete({
        where: {
            token: token,
        },
    });

    return res.status(200).send({ success: true });
}

export async function createUser(req: Request<unknown, unknown, CreateAccountParams>, res: Response) {
    // check arguments existense
    if (!is<CreateAccountParams>(req.body)) {
        res._err = "Missing or invalid arguments";
        return res.status(400).send({ success: false, message: res._err });
    }

    // check if user already exists
    const user = await db.user.findUnique({
        where: {
            name: req.body.username,
        },
    });
    if (user !== null) {
        res._err = "User already exists";
        return res.status(400).send({ success: false, message: res._err });
    }

    // hash password
    const salt = genSaltSync(10);
    const password = hashSync(req.body.password, salt);

    // create user
    const newUser = await db.user.create({
        data: {
            name: req.body.username,
            password: password,
        },
    });

    // return user data
    return res.status(200).send({ success: true, data: { id: newUser.id, name: newUser.name, isAdmin: newUser.isAdmin, createdAt: newUser.createdAt } });
}
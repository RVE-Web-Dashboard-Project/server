import { compare, genSaltSync, hashSync } from "bcryptjs";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { ExtractJwt } from "passport-jwt";
import shortUUID from "short-uuid";
import { is } from "typia";

import Database from "../../database";

const db = Database.getInstance();

const JWT_EXPIRATION_PERIOD = process.env.JWT_TOKEN_EXPIRATION_DAYS + "d";

export async function getMe(req: Request, res: Response) {
    if (!req.user) {
        res._err = "Unauthorized";
        return res.status(401).send({ success: false, message: res._err });
    }
    const publicUserData = {
        id: req.user.id,
        name: req.user.name,
        isAdmin: req.user.isAdmin,
        createdAt: req.user.createdAt,
    };
    return res.status(200).send({ success: true, data: publicUserData });
}

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

    return res.status(200).send({ success: true, data: { ...publicUserData, token: token } });
}

export async function logout(req: Request, res: Response) {
    // get token from request
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token === null) {
        res._err = "Missing token";
        return res.status(400).send({ success: false, message: res._err });
    }
    // delete token from database
    await db.userToken.delete({
        where: {
            token: token,
        },
    });

    req.logout(function(err) {
        if (err) {
            console.log(err);
        }
    });

    return res.status(200).send({ success: true });
}

export async function changePassword(req: Request<unknown, unknown, ChangePasswordParams>, res: Response) {
    // check arguments existense
    if (!is<ChangePasswordParams>(req.body)) {
        res._err = "Missing or invalid arguments";
        return res.status(400).send({ success: false, message: res._err });
    }

    // re-check user authentication
    if (req.user === undefined) {
        res._err = "Unauthorized";
        return res.status(401).send({ success: false, message: res._err });
    }

    // compare previous password with its stored hash
    const passwordMatch = await compare(req.body.oldPassword, req.user.password);
    if (!passwordMatch) {
        res._err = "Invalid password";
        return res.status(400).send({ success: false, message: res._err });
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

    req.logout(function(err) {
        if (err) {
            console.log(err);
        }
    });

    return res.status(200).send({ success: true });
}

export async function inviteUser(req: Request<unknown, unknown, InviteUserParams>, res: Response) {
    if (req.user === undefined) {
        res._err = "Unauthorized";
        return res.status(401).send({ success: false, message: res._err });
    }

    // check arguments existense
    if (!is<InviteUserParams>(req.body)) {
        res._err = "Missing or invalid arguments";
        return res.status(400).send({ success: false, message: res._err });
    }

    // check if user already exists
    const existingUser = await db.user.findUnique({
        where: {
            name: req.body.username,
        },
    });
    if (existingUser !== null) {
        res._err = "User already exists";
        return res.status(400).send({ success: false, message: res._err });
    }
    // Check if an invitation with this username already exists
    const existingInvitation = await db.userInvitation.findUnique({
        where: {
            username: req.body.username,
        },
    });
    if (existingInvitation !== null) {
        res._err = "Invitation already exists";
        return res.status(400).send({ success: false, message: res._err });
    }


    // create invitation
    const invitationId = shortUUID.generate();
    const invitation = await db.userInvitation.create({
        data: {
            id: invitationId,
            username: req.body.username,
            inviterId: req.user.id,
        },
    });

    // return user data
    return res.status(200).send({ success: true, data: { id: invitation.id, username: invitation.username, createdAt: invitation.createdAt } });
}

import { genSaltSync, hashSync } from "bcryptjs";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import shortUUID from "short-uuid";
import { is } from "typia";

import Database from "../../database";

const db = Database.getInstance();

const JWT_EXPIRATION_PERIOD = process.env.JWT_TOKEN_EXPIRATION_DAYS + "d";


export async function listInvitations(req: Request, res: Response) {
    const invitations = await db.userInvitation.findMany({
        select: {
            id: true,
            username: true,
            inviterId: true,
            createdAt: true,
        },
    });
    const invitationsWithInviterName = [];
    for (const invite of invitations) {
        // get inviter from ID
        const inviter = await db.user.findUnique({
            where: {
                id: invite.inviterId,
            },
        });
        invitationsWithInviterName.push({
            ...invite,
            inviter: inviter?.name,
        });
    }
    return res.status(200).send(invitationsWithInviterName);
}

export async function inviteUser(req: Request<unknown, unknown, InviteUserParams>, res: Response) {
    if (req.user === undefined) {
        res._err = "Unauthorized";
        return res.status(401).send(res._err);
    }

    // check arguments existense
    if (!is<InviteUserParams>(req.body)) {
        res._err = "Missing or invalid arguments";
        return res.status(400).send(res._err);
    }

    // check if user already exists
    const existingUser = await db.user.findUnique({
        where: {
            name: req.body.username,
        },
    });
    if (existingUser !== null) {
        res._err = "User already exists";
        return res.status(400).send(res._err);
    }
    // Check if an invitation with this username already exists
    const existingInvitation = await db.userInvitation.findUnique({
        where: {
            username: req.body.username,
        },
    });
    if (existingInvitation !== null) {
        res._err = "Invitation already exists";
        return res.status(400).send(res._err);
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
    return res.status(200).send({
        id: invitation.id,
        username: invitation.username,
        createdAt: invitation.createdAt,
    } );
}

export async function getInvitationInfo(req: Request<{code: string}>, res: Response) {
    // get invitation from code
    const invitation = await db.userInvitation.findUnique({
        where: {
            id: req.params.code,
        },
    });
    if (invitation === null) {
        res._err = "Invalid invitation code";
        return res.status(404).send(res._err);
    }

    // get inviter from ID
    const inviter = await db.user.findUnique({
        where: {
            id: invitation.inviterId,
        },
    });

    return res.status(200).send({
        id: invitation.id,
        username: invitation.username,
        inviter: inviter?.name,
        inviterId: inviter?.id,
        createdAt: invitation.createdAt,
    });
}

export async function acceptInvitation(req: Request<{code: string}, unknown, AcceptInvitationParams>, res: Response) {
    // get invitation from code
    const invitation = await db.userInvitation.findUnique({
        where: {
            id: req.params.code,
        },
    });
    if (invitation === null) {
        res._err = "Invalid invitation code";
        return res.status(404).send(res._err);
    }

    // check arguments existense
    if (!is<AcceptInvitationParams>(req.body)) {
        res._err = "Missing or invalid arguments";
        return res.status(400).send(res._err);
    }

    // check if username is not already taken
    const existingUser = await db.user.findUnique({
        where: {
            name: invitation.username,
        },
    });
    if (existingUser !== null) {
        res._err = "User already exists";
        return res.status(400).send(res._err);
    }

    // hash password
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(req.body.password, salt);

    // create user
    const user = await db.user.create({
        data: {
            name: invitation.username,
            password: hashedPassword,
        },
    });

    // delete invitation
    await db.userInvitation.delete({
        where: {
            id: invitation.id,
        },
    });

    // create token
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

    // return user data
    return res.status(200).send({
        id: user.id,
        name: user.name,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        token: token,
    });
}

export async function deleteInvitation(req: Request<{code: string}>, res: Response) {
    // get invitation from code
    const invitation = await db.userInvitation.findUnique({
        where: {
            id: req.params.code,
        },
    });
    if (invitation === null) {
        res._err = "Invalid invitation code";
        return res.status(404).send(res._err);
    }

    // check if user is the inviter (or admin)
    if (req.user === undefined || (req.user.id !== invitation.inviterId && !req.user.isAdmin)) {
        res._err = "Unauthorized";
        return res.status(401).send(res._err);
    }

    // delete invitation
    await db.userInvitation.delete({
        where: {
            id: invitation.id,
        },
    });

    return res.sendStatus(200);
}

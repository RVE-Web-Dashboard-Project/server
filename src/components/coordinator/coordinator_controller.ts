import { CoordinatorNode } from "@prisma/client";
import { Request, Response } from "express";

import Database from "../../database";

const db = Database.getInstance();

export async function getNodes(req: Request, res: Response) {
    // create a map of CoordinatorId => list of Nodes
    const nodes = await db.coordinatorNode.findMany();
    const coordinatorIds = (await db.coordinator.findMany({ select: { id: true } })).map((c) => c.id);
    const coordinatorNodes: Record<number, CoordinatorNode[]> = coordinatorIds.reduce((acc, id) => {
        acc[id] = [];
        return acc;
    }, {} as Record<number, CoordinatorNode[]>);
    nodes.forEach((node) => {
        coordinatorNodes[node.coordinatorId].push(node);
    });

    return res.status(200).send({ success: true, data: coordinatorNodes });
}
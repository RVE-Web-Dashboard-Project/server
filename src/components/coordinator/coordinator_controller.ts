import { Request, Response } from "express";
import { is } from "typia";

import Database from "../../database";

const db = Database.getInstance();

/** Create a map of CoordinatorId => list of Nodes */
async function getNodesMap() {
    const nodes = await db.coordinatorNode.findMany();
    const coordinatorIds = (await db.coordinator.findMany({ select: { id: true } })).map((c) => c.id);
    const coordinatorNodes: Record<number, number[]> = coordinatorIds.reduce((acc, id) => {
        acc[id] = [];
        return acc;
    }, {} as Record<number, number[]>);
    nodes.forEach((node) => {
        coordinatorNodes[node.coordinatorId].push(node.id);
    });

    return coordinatorNodes;
}

/** Returns a map of coordinators and nodes */
export async function getNodes(req: Request, res: Response) {
    return res.status(200).send(await getNodesMap());
}

/** Allows to edit the list of coordinators and nodes in the database */
export async function editNodes(req: Request<unknown, unknown, EditNodesParams>, res: Response) {
    // check arguments existense
    if (!is<EditNodesParams>(req.body)) {
        res._err = "Missing or invalid arguments";
        return res.status(400).send(res._err);
    }

    // remove all coordinators from database
    await db.coordinator.deleteMany();

    // create coordinators
    const coordinators = Object.keys(req.body).map((id) => ({ id: parseInt(id) }));
    for (const coordinator of coordinators) {
        await db.coordinator.create({ data: coordinator });
    }

    // create nodes
    const nodes = Object.entries(req.body).flatMap(([coordinatorId, nodeIds]) => nodeIds.map((nodeId) => ({ id: nodeId, coordinatorId: parseInt(coordinatorId) })));
    for (const node of nodes) {
        await db.coordinatorNode.create({ data: node });
    }

    return res.status(200).send("ok");
}
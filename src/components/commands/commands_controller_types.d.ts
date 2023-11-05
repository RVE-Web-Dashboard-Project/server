interface SendCommandParams {
    commandId: Command["id"];
    coordinatorIds: number[];
    nodeIds?: number[];
    parameters?: number[];
}
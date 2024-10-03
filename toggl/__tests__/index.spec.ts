import { mock } from "bun:test";

import type * as client from "../client";

mock.module("../client", (): typeof client => ({
    me: mock(),
    clients: mock(),
    workspaces: mock(),
    stopTimeEntry: mock(),
    startTimeEntry: mock(),
    getCurrentTimeEntry: mock(),
}));

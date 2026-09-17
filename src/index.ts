import fs from "fs";
import { ENTRY_SERVER } from "./server/index.js";
import { ENTRY_CLIENT } from "./cli/index.js";
import { DATA_DIRECTORY } from "./shared/globals/index.js";
import { SessionStore } from "./server/storage/SessionStore.js";

fs.mkdirSync(DATA_DIRECTORY, { recursive: true });
SessionStore.getInstance();

ENTRY_SERVER();
ENTRY_CLIENT();

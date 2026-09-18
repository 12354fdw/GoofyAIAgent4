import fs from "fs";
import { ENTRY_SERVER } from "./server/index.js";
import { ENTRY_CLIENT } from "./cli/index.js";
import { DATA_DIRECTORY } from "./shared/globals/index.js";
import { SessionStore } from "./server/storage/SessionStore.js";
import path from "path";

fs.mkdirSync(path.join(DATA_DIRECTORY, "db"), { recursive: true });
SessionStore.getInstance();

ENTRY_SERVER();
ENTRY_CLIENT();

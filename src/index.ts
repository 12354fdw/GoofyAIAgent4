import fs from "fs";
import { ENTRY_SERVER } from "./server/index.js";
import { ENTRY_CLIENT } from "./cli/index.js";
import { DATA_DIRECTORY } from "./shared/globals/index.js";

fs.mkdirSync(DATA_DIRECTORY, { recursive: true });

ENTRY_SERVER();
ENTRY_CLIENT();

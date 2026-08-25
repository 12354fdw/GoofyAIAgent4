import { ENTRY_server } from "./server/index.js";
import { ENTRY_CLIENT } from "./cli/index.js";
import { LOGGER } from "./server/slogger.js";

ENTRY_server();
LOGGER.trace("starting client");
ENTRY_CLIENT();

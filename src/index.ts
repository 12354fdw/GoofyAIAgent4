import { ENTRY_server } from "./server/index.js";
import { Session } from "./server/session/session.js";

ENTRY_server();

const session = new Session("inclusionai/lineg-3.0-tiny:free");

const stream = await session.stream("hello");

for await (const token of stream.textStream) {
	console.log(token);
}

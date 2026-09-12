import { createContext } from "react";
import { ClientSession } from "../../client/clientSession.js";

export const SessionContext = createContext<ClientSession | null>(null);

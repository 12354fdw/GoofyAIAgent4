import { createContext } from "react";
import { Client } from "../../client/client.js";

export const ClientContext = createContext<Client | null>(null);

import { useContext, useEffect, useState } from "react";
import { Text } from "ink";
import { formatSIPrefix } from "../../../shared/SIPrefixer.js";
import { ClientContext } from "../clientContext.js";
import { SessionData } from "../../../shared/types/sessionData.js";
import { ClientSession } from "../../../client/clientSession.js";

export const SessionStatus = () => {
	const session = (useContext(ClientContext)?.currentSession ?? null) as ClientSession;
	const [sessionData, setSessionData] = useState<SessionData>(() => session.getSessionData());

	useEffect(() => {
		const connection = session.onCheckpointChange.connect(() => {
			setSessionData(session.getSessionData());
		});

		return () => connection.disconnect();
	}, [session]);

	const usage = sessionData.usage;
	const formattedCost = (Math.ceil(usage.cost * 10000) / 10000).toFixed(4);

	return (
		<Text italic dimColor>
			{` Session cost: $${formattedCost} `.padEnd(24)}
			{` Tokens: (${formatSIPrefix(usage.accTotalTokens)} / ${formatSIPrefix(usage.totalTokens)} tok)`.padEnd(31)}
			{` Water Evaporated: ~${formatSIPrefix(usage.waterEvaporatedLiters)}L`.padEnd(5)}
		</Text>
	);
};

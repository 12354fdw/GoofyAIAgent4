import { useEffect, useState } from "react";
import { ClientSession } from "../../client/clientSession.js";
import { SessionData } from "../../shared/types/sessionData.js";
import { Text } from "ink";
import { formatSIPrefix } from "../../shared/SIPrefixer.js";

type SessionStatusProps = {
	session: ClientSession;
};

export const SessionStatus = ({ session }: SessionStatusProps) => {
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
			{` Session cost: $${formattedCost} `.padEnd(25)}
			{`Tokens: ${formatSIPrefix(usage.totalTokens)} tok`.padEnd(5)}
		</Text>
	);
};

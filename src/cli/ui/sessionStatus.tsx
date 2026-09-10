import { useEffect, useState } from "react";
import { ClientSession } from "../../client/clientSession.js";
import { SessionData } from "../../shared/types/sessionData.js";
import { Text } from "ink";

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

	const formattedCost = (Math.ceil(sessionData.usage.cost * 10000) / 10000).toFixed(4);

	return (
		<Text italic dimColor>
			{` Session cost: $${formattedCost}`}
		</Text>
	);
};

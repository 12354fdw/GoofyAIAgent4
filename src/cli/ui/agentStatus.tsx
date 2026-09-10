import { Box, Text } from "ink";
import { useEffect, useState } from "react";
import { ClientSession } from "../../client/clientSession.js";
import { SessionData } from "../../shared/types/sessionData.js";

function formatSeconds(totalSeconds: number): string {
	if (totalSeconds <= 0) return "0s";

	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = Math.floor(totalSeconds % 60);

	const parts: string[] = [];

	if (hours > 0) parts.push(`${hours}h`);
	if (minutes > 0) parts.push(`${minutes}m`);
	if (seconds > 0) parts.push(`${seconds}s`);

	return parts.join(" ");
}

function agentStatusTextFactory(sessionData: SessionData) {
	if (sessionData.isPending) {
		return (
			<Text italic>
				{"[?] Evaporating Water for"} {formatSeconds((new Date().getTime() - sessionData.promptTime) / 1000)}
			</Text>
		);
	}

	if (sessionData.finishTime !== 0) {
		return (
			<Text dimColor italic>
				{" Evaporated Water for"} {formatSeconds((sessionData.finishTime - sessionData.promptTime) / 1000)}
			</Text>
		);
	}

	return null;
}

type AgentStatusProps = {
	session: ClientSession;
};

export const AgentStatus = ({ session }: AgentStatusProps) => {
	const [sessionData, setSessionData] = useState<SessionData>(() => session.getSessionData());

	useEffect(() => {
		const connection = session.onPendingChange.connect(() => {
			setSessionData(session.getSessionData());
		});

		return () => connection.disconnect();
	}, [session]);

	const [, setTick] = useState(0);
	useEffect(() => {
		if (!sessionData.isPending) return;

		const id = setInterval(() => {
			setTick((tick) => tick + 1);
		}, 1000);

		return () => clearInterval(id);
	}, [sessionData.isPending]);

	return <Box marginTop={1}>{agentStatusTextFactory(sessionData)}</Box>;
};

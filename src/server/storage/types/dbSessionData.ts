import { SessionParameters } from "../../agent/sessionController.js";
import { SessionUsage } from "../../../shared/types/sessionUsage.js";

export class dbSessionData {
	private constructor(
		public readonly sessionName: string,
		public readonly sessionParameter: SessionParameters,
		public readonly usage: SessionUsage,
	) {}

	public static parse(raw: unknown): dbSessionData[] {
		const data = raw as { sessionName: string; sessionParameter: string; usage: string }[];

		const parsed = data.map(
			({ sessionName, sessionParameter, usage }) =>
				new dbSessionData(
					sessionName,
					JSON.parse(sessionParameter) as SessionParameters,
					JSON.parse(usage) as SessionUsage,
				),
		);
		return parsed;
	}
}

import { Tool, TypedToolCall } from "ai";
import { ToolRegistry } from "../tool/toolRegistry.js";
import { SessionController } from "./session/sessionController.js";

export async function toolApproval(
	toolCall: TypedToolCall<NoInfer<{ [k: string]: Tool }>>,
	sessionController: SessionController,
	toolRegistry: ToolRegistry,
): Promise<{ type: "approved" | "denied"; reason: string }> {
	// return { type: "approved", reason: "bypass" };

	const tool = toolRegistry.getToolsMap().get(toolCall.toolName);
	if (tool && !tool.needsApproval) {
		return { type: "approved", reason: "tool does not require approval" };
	}

	let approval;

	try {
		approval = JSON.parse(
			await sessionController.runTemporaryAgent(
				`Inspect this toolcall, tool='${toolCall.toolName}', input='${JSON.stringify(toolCall.input, null, 2)}'`,
				{
					model: "google/gemini-2.5-flash-lite",
					instruction: "SYSTEM/SECURITY.md",
					// block all tools
					toolBlacklist: Object.keys(toolRegistry.getTools()),
				},
			),
		);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		return { type: "denied", reason: "unable to interept approval answer" };
	}

	if (approval.approved)
		return { type: "approved", reason: approval.reason ? approval.reason : "unable to extract reason" };

	return { type: "denied", reason: approval.reason ? approval.reason : "unable to extract reason" };
}

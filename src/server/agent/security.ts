import { Tool, TypedToolCall } from "ai";
import { ToolRegistry } from "../tool/toolRegistry.js";
import { SessionController } from "./sessionController.js";
import { LOGGER } from "../../shared/globals/logger.js";

export async function toolApproval(
	toolCall: TypedToolCall<NoInfer<{ [k: string]: Tool }>>,
	sessionController: SessionController,
	toolRegistry: ToolRegistry,
): Promise<{ type: "approved" | "denied"; reason: string }> {
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
					persist: false,
				},
			),
		);
	} catch (e) {
		LOGGER.error("Approval errored! trace:", e);
		return { type: "denied", reason: "Approval Errored! Assuming denied!" };
	}

	if (approval.approved)
		return { type: "approved", reason: approval.reason ? approval.reason : "Unable to extract reason!" };

	return { type: "denied", reason: approval.reason ? approval.reason : "Unable to extract reason!" };
}

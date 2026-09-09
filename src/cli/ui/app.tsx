import { Component } from "react";
import { CheckpointEntryTypes } from "../../shared/checkpoints/checkpointTypes.js";
import { Box } from "ink";
import { Prompt } from "./prompt.js";
import { History } from "./history.js";
import { Client } from "../../client/client.js";
import { ClientSession } from "../../client/clientSession.js";
import { AgentStatus } from "./agentStatus.js";

type AppProps = {
	client: Client;
};

type AppState = {
	history: CheckpointEntryTypes[];
	session: ClientSession | null;
};

export class App extends Component<AppProps, AppState> {
	override state: AppState = {
		history: [],
		session: null,
	};

	override async componentDidMount() {
		const session = await this.props.client.connectToSession("default-session");

		session.onCheckpointChange = (history: CheckpointEntryTypes[]) => {
			this.setState({
				history,
			});
		};

		this.setState({ session });
	}

	override render() {
		return (
			<Box flexDirection="column">
				<History history={this.state.history}></History>

				{this.state.session ? <AgentStatus session={this.state.session} /> : null}
				<Prompt
					onSubmit={(prompt: string) => {
						this.state.session?.sendUserPrompt(prompt);
					}}
				/>
			</Box>
		);
	}
}

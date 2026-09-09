import { Component } from "react";
import { CheckpointEntryTypes } from "../../shared/checkpoints/checkpointTypes.js";
import { Box } from "ink";
import { Prompt } from "./prompt.js";
import { History } from "./history.js";
import { Client } from "../../client/client.js";
import { ClientSession } from "../../client/clientSession.js";

type AppProps = {
	client: Client;
};

type AppState = {
	history: CheckpointEntryTypes[];
};

export class App extends Component<AppProps, AppState> {
	private defaultSession!: ClientSession;
	override state: AppState = {
		history: [],
	};

	override async componentDidMount() {
		this.defaultSession = await this.props.client.connectToSession("default-session");

		this.defaultSession.onCheckpointChange = (history: CheckpointEntryTypes[]) => {
			this.setState({
				history,
			});
		};
	}

	override render() {
		return (
			<Box flexDirection="column">
				<History history={this.state.history}></History>

				<Prompt
					onSubmit={(prompt: string) => {
						this.defaultSession.sendUserPrompt(prompt);
					}}
				/>
			</Box>
		);
	}
}

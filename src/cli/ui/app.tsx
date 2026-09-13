import { Component } from "react";
import { CheckpointEntryTypes } from "../../shared/checkpoints/checkpointTypes.js";
import { Box } from "ink";
import { Prompt } from "./prompt.js";
import { History } from "./history.js";
import { Client } from "../../client/client.js";
import { ClientSession } from "../../client/clientSession.js";
import { SignalConnection } from "../../shared/signal.js";
import { ClientContext } from "./clientContext.js";
import { SessionStatus } from "./status/sessionStatus.js";
import { AgentStatus } from "./status/agentStatus.js";

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

	private historyConnection?: SignalConnection;
	private mounted = true;

	override async componentDidMount() {
		const session = await this.props.client.connectToSession("default-session");
		if (!this.mounted) return;

		this.historyConnection = session.onCheckpointChange.connect((history: CheckpointEntryTypes[]) => {
			this.setState({
				history,
			});
		});

		this.props.client.currentSession = session;
		this.setState({ session });
	}

	override componentWillUnmount() {
		this.mounted = false;
		this.historyConnection?.disconnect();
	}

	override render() {
		return (
			<ClientContext.Provider value={this.props.client}>
				<Box flexDirection="column">
					<History history={this.state.history}></History>

					{this.state.session ? <AgentStatus /> : null}
					<Prompt
						onSubmit={(prompt: string) => {
							this.state.session?.sendUserPrompt(prompt);
						}}
					/>

					{this.state.session ? <SessionStatus /> : null}
				</Box>
			</ClientContext.Provider>
		);
	}
}

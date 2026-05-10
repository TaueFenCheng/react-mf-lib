import { loadRemoteMultiVersion } from "mf-runtime-libs";
import React from "react";
import ReactDOM from "react-dom";
import "./App.css";

interface RemoteButtonProps {
	onClick?: () => void;
	children?: React.ReactNode;
	variant?: "primary" | "secondary";
	disabled?: boolean;
}

interface RemoteCardProps {
	title?: string;
	children?: React.ReactNode;
	footer?: React.ReactNode;
}

function App() {
	const [buttonCount, setButtonCount] = React.useState(0);
	const [remoteButton, setRemoteButton] =
		React.useState<React.ComponentType<RemoteButtonProps> | null>(null);
	const [remoteCard, setRemoteCard] =
		React.useState<React.ComponentType<RemoteCardProps> | null>(null);
	const [buttonLoading, setButtonLoading] = React.useState(true);
	const [cardLoading, setCardLoading] = React.useState(true);
	const [buttonError, setButtonError] = React.useState<string | null>(null);
	const [cardError, setCardError] = React.useState<string | null>(null);

	React.useEffect(() => {
		async function loadButton() {
			try {
				const { mf } = await loadRemoteMultiVersion(
					{
						name: "demo_provider",
						pkg: "demo-bridge-provider",
						version: "1.0.0",
						localDebug: {
							enabled: true,
							entry: "http://localhost:3001/remoteEntry.js",
						},
					},
					[],
					{ react: { React, ReactDOM } },
				);
				const mod = await mf.loadRemote<Record<string, unknown> | null>(
					"demo_provider/RemoteButton",
				);
				if (!mod) {
					throw new Error("Remote module is null");
				}
				const component = mod?.default || mod;
				if (component) {
					setRemoteButton(
						() => component as React.ComponentType<RemoteButtonProps>,
					);
				}
				setButtonLoading(false);
			} catch (err) {
				setButtonError((err as Error).message);
				setButtonLoading(false);
			}
		}

		async function loadCard() {
			try {
				const { mf } = await loadRemoteMultiVersion(
					{
						name: "demo_provider",
						pkg: "demo-bridge-provider",
						version: "1.0.0",
						localDebug: {
							enabled: true,
							entry: "http://localhost:3001/remoteEntry.js",
						},
					},
					[],
					{ react: { React, ReactDOM } },
				);
				const mod = await mf.loadRemote<Record<string, unknown> | null>(
					"demo_provider/RemoteCard",
				);
				if (!mod) {
					throw new Error("Remote module is null");
				}
				const component = mod?.default || mod;
				if (component) {
					setRemoteCard(
						() => component as React.ComponentType<RemoteCardProps>,
					);
				}
				setCardLoading(false);
			} catch (err) {
				setCardError((err as Error).message);
				setCardLoading(false);
			}
		}

		loadButton();
		loadCard();
	}, []);

	function renderRemoteButton() {
		if (!remoteButton) return null;
		// biome-ignore lint/suspicious/noExplicitAny: @types/react@16 类型局限，JSX 无法直接使用 React.ComponentType
		const Comp = remoteButton as any;
		return (
			<Comp onClick={() => setButtonCount((c) => c + 1)} variant="primary">
				{`Remote Button (clicks: ${buttonCount})`}
			</Comp>
		);
	}

	function renderRemoteCard() {
		if (!remoteCard) return null;
		// biome-ignore lint/suspicious/noExplicitAny: @types/react@16 类型局限，JSX 无法直接使用 React.ComponentType
		const Comp = remoteCard as any;
		return (
			<Comp title="Cross-Version Remote Card">
				<p>This card is loaded from a React 18 remote provider.</p>
				<p>{`Host is running React ${React.version}`}</p>
				<p className="compatibility-note">
					Cross-version Module Federation working!
				</p>
			</Comp>
		);
	}

	return (
		<div className="app">
			<header className="app-header">
				<h1>Host React 16</h1>
				<p className="version-badge">React {React.version}</p>
				<p className="subtitle">
					使用 <code>mf-runtime-libs</code> 加载 React 18 远程组件
				</p>
			</header>

			<main className="app-main">
				<section className="demo-section">
					<h2>RemoteButton (from React 18 Provider)</h2>
					{buttonLoading && (
						<div className="status loading">Loading RemoteButton...</div>
					)}
					{buttonError && (
						<div className="status error">Failed: {buttonError}</div>
					)}
					{renderRemoteButton()}
				</section>

				<section className="demo-section">
					<h2>RemoteCard (from React 18 Provider)</h2>
					{cardLoading && (
						<div className="status loading">Loading RemoteCard...</div>
					)}
					{cardError && <div className="status error">Failed: {cardError}</div>}
					{renderRemoteCard()}
				</section>

				<section className="demo-section">
					<h2>Host Environment</h2>
					<table className="info-table">
						<tbody>
							<tr>
								<td>Host React Version</td>
								<td>{React.version}</td>
							</tr>
							<tr>
								<td>Remote Provider</td>
								<td>demo-bridge-provider (React 18)</td>
							</tr>
							<tr>
								<td>Loading Library</td>
								<td>mf-runtime-libs (bridge module)</td>
							</tr>
							<tr>
								<td>JSX Transform</td>
								<td>Classic (React.createElement)</td>
							</tr>
						</tbody>
					</table>
				</section>
			</main>
		</div>
	);
}

export default App;

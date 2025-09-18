import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return <div className="text-3xl font-bold hover:underline">GSW</div>;
}

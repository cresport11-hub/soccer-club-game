/** Design system: 「タッチライン戦術室」— the game canvas is the sole application route. */
import ErrorBoundary from "./components/ErrorBoundary";
import GameCanvas from "./components/GameCanvas";

export default function App() {
  return <ErrorBoundary><GameCanvas /></ErrorBoundary>;
}

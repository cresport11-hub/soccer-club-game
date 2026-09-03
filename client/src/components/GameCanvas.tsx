/**
 * Design system: 「タッチライン戦術室」— Reactは額縁、Babylonは夜のピッチ、HUDは監督の戦術ボード。
 * Deep forest + navy base, electric lime for forward motion, gold for reputation.
 */
import { useEffect, useRef, useState } from "react";
import { ClubSimulation } from "../game/ClubSimulation";
import { GameUI } from "../game/ui";
import "../game/game.css";
import "../game/mobile.css";
import "../game/player-detail.css";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const [startupFailed, setStartupFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;

    let ui: GameUI;
    try {
      ui = new GameUI(new ClubSimulation());
    } catch {
      setStartupFailed(true);
      startedRef.current = false;
      return;
    }

    let engine: { resize: () => void; dispose: () => void; runRenderLoop: (callback: () => void) => void } | null = null;
    let handle: { scene: { render: () => void }; dispose: () => void } | null = null;
    let disposed = false;

    void (async () => {
      try {
        const [{ Engine }, { createGameScene }] = await Promise.all([
          import("@babylonjs/core/Engines/engine"),
          import("../game/scene"),
        ]);
        if (disposed) return;
        const nextEngine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
        engine = nextEngine;
        const nextHandle = await createGameScene(nextEngine, canvas);
        if (disposed) { nextHandle.dispose(); return; }
        handle = nextHandle;
        nextEngine.runRenderLoop(() => nextHandle.scene.render());
      } catch { /* The tactical HUD remains usable without the animated pitch. */ }
    })();

    const onResize = () => engine?.resize();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      engine?.dispose();
      ui.dispose();
      startedRef.current = false;
    };
  }, []);

  return <><canvas ref={canvasRef} className="game-canvas" style={{ touchAction: "none" }} />{startupFailed && <section className="tactical-boot" role="alert"><header><div><img src="/manus-storage/club-orbit-mark_c3fb53ec.png" alt=""/><span>TOUCHLINE</span><strong>オービット東京</strong></div><p>CLUB STATE <b>復旧が必要</b></p></header><main><aside><i>01</i><i>02</i><i>03</i></aside><div><span>TACTICAL DESK / RECOVERY</span><h1>セーブを整えて戦術室へ入る。</h1><p>保存データの読み込みに失敗しました。セーブを初期化して起動し直せます。</p><button type="button" onClick={() => { try { localStorage.removeItem("touchline-tactics-save-v1"); } catch { /* Storage may be unavailable. */ } window.location.reload(); }}>セーブを初期化して起動</button></div><section><small>SCOUTING TAG</small><b>RETRY</b><p>初期状態から再開できます</p></section></main></section>}</>;
}

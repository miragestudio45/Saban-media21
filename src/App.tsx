import { Canvas } from "@react-three/fiber";
import { Component, ReactNode, Suspense, useEffect } from "react";
import * as THREE from "three";
import { CalibrationMode } from "./components/CalibrationMode";
import { Scene3D, SceneLoadingMessage } from "./components/Scene3D";
import { TacticalOverlay3D } from "./components/TacticalOverlay3D";
import { WarRoomUI } from "./components/WarRoomUI";
import { useBattleStore } from "./store/useBattleStore";

class SceneErrorBoundary extends Component<{ children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    useBattleStore.getState().setModelStatus("error", error.message);
  }

  render() {
    if (this.state.error) {
      return null;
    }
    return this.props.children;
  }
}

function ModelStatusOverlay() {
  const modelStatus = useBattleStore((state) => state.modelStatus);
  const modelError = useBattleStore((state) => state.modelError);

  if (modelStatus === "ready") {
    return null;
  }

  if (modelStatus === "error") {
    return (
      <div className="model-error-overlay">
        <div className="panel model-error-card">
          <strong>Không tải được sa bàn 3D</strong>
          <p>{modelError || "Trình tải GLB trả về lỗi không xác định."}</p>
          <ul>
            <li>Kiểm tra file `public/models/sa-ban.glb` có tồn tại.</li>
            <li>Chạy bằng `npm run dev`; không mở trực tiếp file HTML.</li>
            <li>Nếu đổi tên model, cập nhật lại đường dẫn `/models/sa-ban.glb`.</li>
            <li>Nếu chạy qua host khác, kiểm tra CORS và MIME type của file `.glb`.</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="model-loading-overlay">
      <div className="loader-ring" />
      <span>Đang chuẩn bị sa bàn 3D...</span>
    </div>
  );
}

export default function App() {
  const isPlaying = useBattleStore((state) => state.isPlaying);
  const nextStep = useBattleStore((state) => state.nextStep);

  useEffect(() => {
    useBattleStore.getState().loadCalibration();

    const params = new URLSearchParams(window.location.search);
    if (params.has("dev") || params.has("calibrate")) {
      useBattleStore.getState().unlockCalibration();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (event.key.toLowerCase() === "c") {
        const state = useBattleStore.getState();
        state.unlockCalibration();
        state.setCalibrationEnabled(!state.calibration.enabled);
      }
      if (event.key === " ") {
        event.preventDefault();
        useBattleStore.getState().togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const timer = window.setInterval(() => nextStep(), 4200);
    return () => window.clearInterval(timer);
  }, [isPlaying, nextStep]);

  return (
    <main className="war-room-root">
      <SceneErrorBoundary>
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ fov: 42, near: 0.08, far: 3000, position: [120, 95, 120] }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
          }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.18;
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <Suspense fallback={<SceneLoadingMessage />}>
            <Scene3D />
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>
      <TacticalOverlay3D />
      <WarRoomUI />
      <CalibrationMode />
      <ModelStatusOverlay />
    </main>
  );
}

import { useRef, useEffect, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { useGame } from "@/game/store";

/* ---------- VR Entry Button (desktop UI) ---------- */
export function VREntryButton() {
  const [vrSupported, setVrSupported] = useState(false);
  const [inVR, setInVR] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.xr) {
      setVrSupported(false);
      return;
    }
    (navigator.xr as any).isSessionSupported("immersive-vr").then(setVrSupported).catch(() => setVrSupported(false));
  }, []);

  useEffect(() => {
    const onVRChange = () => setInVR(!!(navigator.xr as any)?.session);
    window.addEventListener("vrdisplaypresentchange", onVRChange);
    return () => window.removeEventListener("vrdisplaypresentchange", onVRChange);
  }, []);

  if (!vrSupported) return null;

  return (
    <Button
      className="pointer-events-auto"
      variant={inVR ? "secondary" : "primary"}
      onClick={async () => {
        const canvas = document.querySelector("canvas");
        if (!canvas) return;
        const renderer = (canvas as any).__threeRenderer;
        if (!renderer) return;
        if (renderer.xr.isPresenting) {
          renderer.xr.endSession();
        } else {
          const session = await (navigator.xr as any)?.requestSession("immersive-vr"); if (session) renderer.xr.setSession?.(session);
        }
      }}
    >
      {inVR ? "Exit VR" : "Enter VR"}
    </Button>
  );
}

/* ---------- VR Controller Input Mapper ---------- */
export function VRControllerInput({
  onThumbstick,
  onTrigger,
  onGrip,
  onButton,
}: {
  onThumbstick?: (x: number, y: number, hand: "left" | "right") => void;
  onTrigger?: (value: number, hand: "left" | "right") => void;
  onGrip?: (value: number, hand: "left" | "right") => void;
  onButton?: (button: number, hand: "left" | "right") => void;
}) {
  const { gl } = useThree();
  const sessionRef = useRef<XRSession | null>(null);

  useEffect(() => {
    const renderer = gl as any;
    if (!renderer?.xr) return;

    const onSessionStart = (e: any) => {
      const session = e.session as XRSession;
      sessionRef.current = session;
      session.addEventListener("inputsourceschange", onInputSourcesChange);
      session.addEventListener("select", onSelect);
      session.addEventListener("selectstart", onSelectStart);
      session.addEventListener("selectend", onSelectEnd);
      session.addEventListener("squeeze", onSqueeze);
      session.addEventListener("squeezeend", onSqueezeEnd);
    };

    const onSessionEnd = () => {
      sessionRef.current = null;
    };

    const onInputSourcesChange = () => { /* controller list updated */ };
    const onSelect = (e: any) => {
      const hand = e.inputSource?.handedness === "left" ? "left" : "right";
      onButton?.(0, hand);
    };
    const onSelectStart = (e: any) => {
      const hand = e.inputSource?.handedness === "left" ? "left" : "right";
      onTrigger?.(1, hand);
    };
    const onSelectEnd = (e: any) => {
      const hand = e.inputSource?.handedness === "left" ? "left" : "right";
      onTrigger?.(0, hand);
    };
    const onSqueeze = (e: any) => {
      const hand = e.inputSource?.handedness === "left" ? "left" : "right";
      onGrip?.(1, hand);
    };
    const onSqueezeEnd = (e: any) => {
      const hand = e.inputSource?.handedness === "left" ? "left" : "right";
      onGrip?.(0, hand);
    };

    renderer.xr.addEventListener("sessionstart", onSessionStart);
    renderer.xr.addEventListener("sessionend", onSessionEnd);

    return () => {
      renderer.xr.removeEventListener("sessionstart", onSessionStart);
      renderer.xr.removeEventListener("sessionend", onSessionEnd);
      const session = sessionRef.current;
      if (session) {
        session.removeEventListener("inputsourceschange", onInputSourcesChange);
        session.removeEventListener("select", onSelect);
        session.removeEventListener("selectstart", onSelectStart);
        session.removeEventListener("selectend", onSelectEnd);
        session.removeEventListener("squeeze", onSqueeze);
        session.removeEventListener("squeezeend", onSqueezeEnd);
      }
    };
  }, [gl, onThumbstick, onTrigger, onGrip, onButton]);

  // Poll thumbstick each frame
  useFrame(() => {
    const session = sessionRef.current;
    if (!session) return;
    for (const source of session.inputSources) {
      const hand = source.handedness === "left" ? "left" : "right";
      const gp = source.gamepad;
      if (gp && gp.axes.length >= 2) {
        onThumbstick?.(gp.axes[0], gp.axes[1], hand);
      }
    }
  });

  return null;
}

/* ---------- VR Setup Helper ---------- */
export function setupVR(gl: THREE.WebGLRenderer): VRButton | null {
  const renderer = gl as any;
  if (!renderer?.xr) return null;
  renderer.xr.enabled = true;
  const button = VRButton.createButton(renderer);
  button.style.position = "absolute";
  button.style.bottom = "20px";
  button.style.left = "50%";
  button.style.transform = "translateX(-50%)";
  button.style.zIndex = "100";
  button.style.opacity = "0.8";
  return button;
}

# VR/AR Roadmap (Phase 5)

Neuro-Recover’s roadmap includes **VR/AR mode** for immersive reach/grasp tasks (spec §8.B).

## Scope

- **Target devices**: Meta Quest, Apple Vision Pro (and compatible WebXR-capable headsets).
- **Use case**: Hand tracking in headset; virtual hand overlay; gamified environments for reach, grasp, and ADL-style tasks.
- **Status**: Not implemented in the current web app. This document is a placeholder and roadmap.

## Why a separate client

- The current app is a **browser-based** React app using MediaPipe in 2D video.
- VR/AR requires **WebXR** (or native SDKs) and a 3D runtime (Three.js, A-Frame, or native).
- Hand tracking in headset uses device APIs (e.g. Quest hand tracking, Vision Pro hand tracking), not the same 2D camera pipeline.

## Suggested implementation path

1. **WebXR + hand tracking**
   - Use WebXR Hand Tracking extension or device-specific APIs.
   - Render a simple 3D scene (e.g. reach for a ball, pinch to grab).

2. **Reuse game logic**
   - Port “Bubble Popper” and “Grab cup” / “Button” concepts to 3D: targets in 3D space, pinch to select/grab.

3. **Separate repo or app**
   - New project (e.g. `neuro-recover-vr`) with Vite + Three.js + WebXR, or a native Quest/Vision Pro app, depending on target platform.

## References

- [WebXR Device API](https://www.w3.org/TR/webxr/)
- [WebXR Hand Tracking](https://immersiveweb.dev/webxr-hand-input/)
- [Meta Quest hand tracking](https://developer.oculus.com/documentation/native/android/mobile-hand-tracking/)

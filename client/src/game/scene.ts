/**
 * Design system: 「タッチライン戦術室」— a calm night pitch sits behind a high-density tactical HUD.
 */
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Scene } from "@babylonjs/core/scene";
import type { Engine } from "@babylonjs/core/Engines/engine";

export type GameHandle = { scene: Scene; dispose: () => void };

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.008, 0.04, 0.028, 1);

  const camera = new ArcRotateCamera("touchline-camera", -Math.PI / 2, 1.14, 29, new Vector3(0, 0, 0), scene);
  camera.lowerRadiusLimit = 29;
  camera.upperRadiusLimit = 29;
  camera.lowerBetaLimit = 1.14;
  camera.upperBetaLimit = 1.14;
  camera.attachControl(canvas, true);

  const ambient = new HemisphericLight("stadium-ambient", new Vector3(0, 1, 0), scene);
  ambient.intensity = 0.36;
  ambient.diffuse = Color3.FromHexString("#a5ffd2");
  ambient.groundColor = Color3.FromHexString("#021d11");

  const key = new PointLight("floodlight", new Vector3(-7, 13, -2), scene);
  key.intensity = 210;
  key.diffuse = Color3.FromHexString("#e3fff0");
  const rim = new PointLight("rimlight", new Vector3(9, 7, 7), scene);
  rim.intensity = 96;
  rim.diffuse = Color3.FromHexString("#b3ff47");

  const pitch = MeshBuilder.CreateGround("night-pitch", { width: 20, height: 13, subdivisions: 2 }, scene);
  const grass = new StandardMaterial("grass", scene);
  grass.diffuseColor = Color3.FromHexString("#0b5c32");
  grass.specularColor = Color3.FromHexString("#172b1e");
  pitch.material = grass;

  const lineMaterial = new StandardMaterial("pitch-lines", scene);
  lineMaterial.emissiveColor = Color3.FromHexString("#d9ff4a");
  const makeLine = (name: string, points: Vector3[]) => {
    const line = MeshBuilder.CreateLines(name, { points }, scene);
    line.color = Color3.FromHexString("#c5efc5");
    line.alpha = 0.3;
    return line;
  };
  makeLine("side-a", [new Vector3(-9.5, .03, -5.8), new Vector3(9.5, .03, -5.8)]);
  makeLine("side-b", [new Vector3(-9.5, .03, 5.8), new Vector3(9.5, .03, 5.8)]);
  makeLine("midline", [new Vector3(0, .03, -5.8), new Vector3(0, .03, 5.8)]);
  const circle = MeshBuilder.CreateTorus("center-circle", { diameter: 3.2, thickness: .045, tessellation: 40 }, scene);
  circle.rotation.x = Math.PI / 2;
  circle.position.y = .04;
  circle.material = lineMaterial;

  const ball = MeshBuilder.CreateSphere("match-ball", { diameter: .56, segments: 16 }, scene);
  ball.position = new Vector3(0, .32, 0);
  const ballMat = new StandardMaterial("ball-material", scene);
  ballMat.diffuseColor = Color3.FromHexString("#f5ffdf");
  ballMat.emissiveColor = Color3.FromHexString("#163c20");
  ball.material = ballMat;

  const standMat = new StandardMaterial("stands", scene);
  standMat.diffuseColor = Color3.FromHexString("#061830");
  standMat.emissiveColor = Color3.FromHexString("#071b32");
  for (const [x, z, w, d] of [[0, -8.4, 23, 2.2], [0, 8.4, 23, 2.2], [-12, 0, 2.2, 16], [12, 0, 2.2, 16]] as const) {
    const stand = MeshBuilder.CreateBox(`stand-${x}-${z}`, { width: w, height: 2.3, depth: d }, scene);
    stand.position = new Vector3(x, 1.1, z);
    stand.material = standMat;
  }

  scene.onBeforeRenderObservable.add(() => {
    const time = performance.now() * 0.0007;
    ball.position.x = Math.sin(time) * 1.7;
    ball.position.z = Math.cos(time * 1.4) * .6;
    ball.rotation.x += .016;
    ball.rotation.z += .011;
    rim.intensity = 82 + Math.sin(time * 1.5) * 20;
  });

  return { scene, dispose: () => scene.dispose() };
}

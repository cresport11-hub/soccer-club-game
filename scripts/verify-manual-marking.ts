import { ClubSimulation } from "../client/src/game/ClubSimulation";

const store = new Map<string, string>();
Object.assign(globalThis, { localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value), removeItem: (key: string) => store.delete(key) } });

const simulation = new ClubSimulation();
simulation.setFormation("3-6-1");
simulation.setPlayingStyle("press");
const marker = simulation.playerForSlot("lcb");
const target = simulation.currentOpponentTactics.lineup.find((player) => player.position === "CF");
const secondTarget = simulation.currentOpponentTactics.lineup.find((player) => player.position === "WG");
if (!marker || !target || !secondTarget) throw new Error(JSON.stringify({ phase: "fixture", marker, target, secondTarget }));

const assigned = simulation.setManualMarkAssignment(target.id, marker.id);
if (!assigned.ok || simulation.currentManualMarkAssignments[target.id] !== marker.id) throw new Error(JSON.stringify({ phase: "manual-assignment", assigned, assignments: simulation.currentManualMarkAssignments }));

const reassigned = simulation.setManualMarkAssignment(secondTarget.id, marker.id);
const assignmentsAfterReassignment = simulation.currentManualMarkAssignments;
if (!reassigned.ok || assignmentsAfterReassignment[target.id] || assignmentsAfterReassignment[secondTarget.id] !== marker.id || Object.values(assignmentsAfterReassignment).filter((playerId) => playerId === marker.id).length !== 1) {
  throw new Error(JSON.stringify({ phase: "reassign", reassigned, assignmentsAfterReassignment }));
}

const assignedBack = simulation.setManualMarkAssignment(target.id, marker.id);
if (!assignedBack.ok || simulation.currentManualMarkAssignments[target.id] !== marker.id) throw new Error(JSON.stringify({ phase: "assign-back", assignedBack, assignments: simulation.currentManualMarkAssignments }));
const restored = new ClubSimulation();
if (restored.currentManualMarkAssignments[target.id] !== marker.id) throw new Error(JSON.stringify({ phase: "save-restore", assignments: restored.currentManualMarkAssignments }));
const result = restored.advanceWeek();
const manualDuel = result.markDuels.find((duel) => duel.playerId === marker.id);
if (!manualDuel || manualDuel.opponent !== target.name || !result.highlights.some((item) => item.minute === 18 && item.text.includes("MARKING IMPACT"))) {
  throw new Error(JSON.stringify({ phase: "match-report", marker, target, manualDuel, duels: result.markDuels, highlights: result.highlights }));
}

console.log(JSON.stringify({ manualMarker: marker.name, target: target.name, duel: manualDuel, impact: result.markingImpact, restored: true }));

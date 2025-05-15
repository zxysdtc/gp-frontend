import http from "./http";

export interface Agent {
  id?: number;
  name: string;
  description: string;
  avatar: string;
  url: string;
}

export function getAgents() {
  return http.get<Agent[]>("/agents");
}

export function getAgent(id: number) {
  return http.get<Agent>(`/agents/${id}`);
}

export function createAgent(agent: Agent) {
  return http.post<Agent, Agent>("/agents", agent);
}

export function updateAgent(id: number, agent: Agent) {
  return http.put<Agent, Agent>(`/agents/${id}`, agent);
}

export function deleteAgent(id: number) {
  return http.delete(`/agents/${id}`);
}

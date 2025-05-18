import http from "./http";

export interface Agent {
  id: number;
  name: string;
  description: string;
  avatar: string;
  apiKey: string;
  enabled: boolean;
}

export interface CreateAgentRequest {
  name: string;
  description: string;
  apiKey: string;
  avatar: string;
  enabled: boolean;
}

export interface UpdateAgentRequest {
  name: string;
  description: string;
  apiKey: string;
  avatar: string;
  enabled: boolean;
}

export function getAgents() {
  return http.get<Agent[]>("/dify/list");
}

export function getAgent(id: number) {
  return http.get<Agent>(`/dify/${id}`);
}

export function createAgent(agent: CreateAgentRequest) {
  return http.post<Agent, CreateAgentRequest>("/dify/create", agent);
}

export function updateAgent(id: number, updateRequest: UpdateAgentRequest) {
  return http.put<Agent, UpdateAgentRequest>(
    `/dify/update/${id}`,
    updateRequest
  );
}

export function deleteAgent(id: number) {
  return http.delete(`/dify/delete/${id}`);
}

export function getAvailableChatbots() {
  return http.get<any[]>("/dify/chatbots");
}

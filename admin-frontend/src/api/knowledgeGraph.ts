import http from "./http";

export interface KnowledgeGraphNode {
  id?: number;
  label: string;
  properties: Record<string, any>;
  type: string;
}

export interface KnowledgeGraphEdge {
  id?: number;
  source: number;
  target: number;
  label: string;
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export function generateKnowledgeGraphFromPdf(file: File, params: string) {
  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("params", params);

  return http.post<FormData, KnowledgeGraph>(
    "/knowledge-graph/generate",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
}

export function getKnowledgeGraphs() {
  return http.get<KnowledgeGraph[]>("/knowledge-graph");
}

export function getKnowledgeGraph(id: number) {
  return http.get<KnowledgeGraph>(`/knowledge-graph/${id}`);
}

export function createNode(node: KnowledgeGraphNode) {
  return http.post<KnowledgeGraphNode, KnowledgeGraphNode>(
    "/knowledge-graph/nodes",
    node
  );
}

export function updateNode(id: number, node: KnowledgeGraphNode) {
  return http.put<KnowledgeGraphNode, KnowledgeGraphNode>(
    `/knowledge-graph/nodes/${id}`,
    node
  );
}

export function deleteNode(id: number) {
  return http.delete(`/knowledge-graph/nodes/${id}`);
}

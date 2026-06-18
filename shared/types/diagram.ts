export type DiagramCategory =
  | 'mobile'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'queue'
  | 'auth'
  | 'storage'
  | 'external'
  | 'devops';

export type ReviewSeverity = 'critical' | 'warning' | 'info';

export interface DiagramPosition {
  x: number;
  y: number;
}

export interface DiagramNode {
  id: string;
  name: string;
  category: DiagramCategory;
  role?: string;
  reason?: string;
  icon?: string;
  workflow?: string;
  products?: string[];
  position?: DiagramPosition;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type?: 'step' | 'protocolEdge' | string;
}

export interface ReviewFinding {
  severity: ReviewSeverity;
  title: string;
  detail: string;
  nodeIds?: string[];
  edgeIds?: string[];
}

export interface ReviewSuggestionConnection {
  source: string;
  target: string;
  label?: string;
  reason?: string;
}

export interface ReviewSuggestion {
  id?: string;
  name: string;
  category: DiagramCategory;
  role?: string;
  reason?: string;
  icon?: string;
  products?: string[];
  connections?: ReviewSuggestionConnection[];
}

export interface ArchitectureScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  breakdown?: {
    deductions?: Record<string, number>;
    bonuses?: Record<string, number>;
  };
}

export interface GeneratedDiagram {
  model: string;
  rawResponse: string;
  userMessage: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  quality?: {
    score: ArchitectureScore;
    findings: ReviewFinding[];
  };
  autoFixes?: string[];
}

export type ViewState = 'dashboard' | 'analysis' | 'gis' | 'code';

export interface RuleDefinition {
  id: string;
  name: string;
  description: string;
  category: 'Safety' | 'Area' | 'Parking' | 'Legal';
}

export interface CheckResult {
  ruleId: string;
  elementId: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  value?: number;
  required?: number;
}

export interface BimStats {
  totalElements: number;
  warnings: number;
  errors: number;
  complianceRate: number;
}

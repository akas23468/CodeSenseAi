export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type FindingSource = 'tool' | 'ai'
export type FindingStatus = 'open' | 'resolved'
export type Verification = 'tool-reported' | 'awaiting-verification'
export type CheckStatus = 'passed' | 'findings' | 'failed' | 'skipped' | 'not-run'

export interface Finding {
  id: string; repoId: string; title: string; description: string
  severity: Severity; category: string; filePath: string; lineNumber: number
  source: FindingSource; tool?: string; ruleId?: string
  status: FindingStatus; verification: Verification
  evidence: { startLine: number; code: string[] }
  suggestedAction: string
}
export interface Check { id: string; name: string; description: string; status: CheckStatus; durationSec?: number; ranAt?: string }
export interface Repository {
  id: string; name: string; language: string; files: number; branch: string
  lastAnalysis: string; status: string; checks: Check[]
}
export interface AnalysisRun { id: string; repoId: string; time: string; files: number; findings: number; status: 'completed' | 'completed-with-findings' | 'failed' }

import type { AnalysisRun, Check, Finding, Repository } from '../types'

// DEMONSTRATION DATA. Nothing here comes from a real analysis run.
const chk = (id: string, name: string, description: string, status: Check['status'], durationSec: number, ranAt: string): Check =>
  ({ id, name, description, status, durationSec, ranAt })

export const repos: Repository[] = [
  { id: 'inventory', name: 'flask-inventory-api', language: 'Python', files: 48, branch: 'main', lastAnalysis: '2026-10-24T14:32:00Z', status: 'Demo analysis complete',
    checks: [
      chk('ruff', 'Ruff', 'Code quality and style', 'findings', 2, '2026-10-24T14:32:00Z'),
      chk('bandit', 'Bandit', 'Security analysis', 'findings', 4, '2026-10-24T14:32:00Z'),
      chk('pytest', 'Pytest', 'Automated tests', 'passed', 11, '2026-10-24T14:32:00Z'),
      chk('parse', 'Repository parsing', 'File discovery and AST parsing', 'passed', 1, '2026-10-24T14:31:00Z'),
    ] },
  { id: 'csv', name: 'csv-toolkit', language: 'Python', files: 17, branch: 'develop', lastAnalysis: '2026-10-20T09:05:00Z', status: 'Demo analysis complete',
    checks: [
      chk('ruff', 'Ruff', 'Code quality and style', 'passed', 1, '2026-10-20T09:05:00Z'),
      chk('bandit', 'Bandit', 'Security analysis', 'findings', 2, '2026-10-20T09:05:00Z'),
      chk('pytest', 'Pytest', 'Automated tests', 'failed', 3, '2026-10-20T09:05:00Z'),
      chk('parse', 'Repository parsing', 'File discovery and AST parsing', 'passed', 1, '2026-10-20T09:04:00Z'),
    ] },
]

type Seed = Omit<Finding, 'status' | 'verification'> & Partial<Pick<Finding, 'status'>>
const f = (x: Seed): Finding => ({ status: 'open', verification: x.source === 'ai' ? 'awaiting-verification' : 'tool-reported', ...x })

export const findings: Finding[] = [
  f({ id: 'F-101', repoId: 'inventory', title: 'Possible SQL injection via string formatting', severity: 'critical', category: 'Security', filePath: 'app/db/queries.py', lineNumber: 42, source: 'tool', tool: 'Bandit', ruleId: 'B608',
    description: 'A SQL statement is built by interpolating a variable into the query string.',
    evidence: { startLine: 40, code: ['def find_item(conn, name):', '    cur = conn.cursor()', '    cur.execute(f"SELECT * FROM items WHERE name = \'{name}\'")', '    return cur.fetchall()'] },
    suggestedAction: 'Use a parameterised query: cur.execute("... WHERE name = ?", (name,)).' }),
  f({ id: 'F-102', repoId: 'inventory', title: 'Potential hardcoded secret', severity: 'high', category: 'Security', filePath: 'app/config.py', lineNumber: 12, source: 'tool', tool: 'Bandit', ruleId: 'B105',
    description: 'A string is assigned to a variable named like a password or key.',
    evidence: { startLine: 11, code: ['class Config:', '    SECRET_KEY = "dev-secret-123"', '    DEBUG = False'] },
    suggestedAction: 'Read the value from an environment variable and rotate the exposed value.' }),
  f({ id: 'F-103', repoId: 'inventory', title: 'Potentially unsafe use of subprocess', severity: 'medium', category: 'Security', filePath: 'app/utils/export.py', lineNumber: 27, source: 'tool', tool: 'Bandit', ruleId: 'B602',
    description: 'subprocess is called with shell=True and a variable command.',
    evidence: { startLine: 26, code: ['def export(path):', '    subprocess.run(f"tar -czf out.tgz {path}", shell=True)'] },
    suggestedAction: 'Pass an argument list and drop shell=True.' }),
  f({ id: 'F-104', repoId: 'inventory', title: 'Possible missing test for stock reconciliation', severity: 'medium', category: 'Testing', filePath: 'app/services/stock.py', lineNumber: 58, source: 'ai',
    description: 'Generated suggestion: reconcile_stock() may have no test. This is a hypothesis from reading the code, not a measured coverage result.',
    evidence: { startLine: 58, code: ['def reconcile_stock(items, counts):', '    for item in items:', '        item.qty = counts.get(item.sku, item.qty)'] },
    suggestedAction: 'Check whether tests cover this function, then add cases for missing SKUs.' }),
  f({ id: 'F-105', repoId: 'inventory', title: 'Unused variable', severity: 'low', category: 'Quality', filePath: 'app/routes/items.py', lineNumber: 19, source: 'tool', tool: 'Ruff', ruleId: 'F841',
    description: 'A local variable is assigned but never used.',
    evidence: { startLine: 18, code: ['def list_items():', '    page_size = 50', '    return Item.query.all()'] },
    suggestedAction: 'Remove the variable or use it to paginate.' }),
  f({ id: 'F-106', repoId: 'inventory', title: 'Unused import', severity: 'low', category: 'Quality', filePath: 'app/__init__.py', lineNumber: 3, source: 'tool', tool: 'Ruff', ruleId: 'F401', status: 'resolved',
    description: 'An imported module is never referenced.',
    evidence: { startLine: 1, code: ['import os', 'import json', 'from flask import Flask'] },
    suggestedAction: 'Remove the import.' }),
  f({ id: 'F-201', repoId: 'csv', title: 'yaml.load used without a safe loader', severity: 'high', category: 'Security', filePath: 'csvtool/settings.py', lineNumber: 9, source: 'tool', tool: 'Bandit', ruleId: 'B506',
    description: 'yaml.load can construct arbitrary Python objects from untrusted input.',
    evidence: { startLine: 8, code: ['def load_settings(path):', '    return yaml.load(open(path))'] },
    suggestedAction: 'Use yaml.safe_load.' }),
  f({ id: 'F-202', repoId: 'csv', title: 'Possible failure when a file has no header row', severity: 'medium', category: 'Reliability', filePath: 'csvtool/reader.py', lineNumber: 21, source: 'ai',
    description: 'Generated suggestion that may be wrong. The failing Pytest check is a separate, deterministic result.',
    evidence: { startLine: 20, code: ['rows = list(csv.reader(fh))', 'header = rows[0]'] },
    suggestedAction: 'Reproduce with an empty file before changing anything.' }),
  f({ id: 'F-203', repoId: 'csv', title: 'assert used in non-test code', severity: 'low', category: 'Quality', filePath: 'csvtool/cli.py', lineNumber: 33, source: 'tool', tool: 'Bandit', ruleId: 'B101',
    description: 'assert statements are removed when Python runs with -O.',
    evidence: { startLine: 33, code: ['assert args.input, "input required"'] },
    suggestedAction: 'Raise a ValueError or use parser.error().' }),
]

export const runs: AnalysisRun[] = [
  { id: 'R-12', repoId: 'inventory', time: '2026-10-24T14:32:00Z', files: 48, findings: 5, status: 'completed-with-findings' },
  { id: 'R-11', repoId: 'inventory', time: '2026-10-17T10:10:00Z', files: 46, findings: 6, status: 'completed-with-findings' },
  { id: 'R-07', repoId: 'csv', time: '2026-10-20T09:05:00Z', files: 17, findings: 3, status: 'completed-with-findings' },
  { id: 'R-06', repoId: 'csv', time: '2026-10-12T16:40:00Z', files: 17, findings: 0, status: 'failed' },
]

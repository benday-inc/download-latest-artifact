import {HeadCommit} from './head-commit'
import {Repository} from './repository'

export interface WorkflowRun {
  id: number
  node_id: string
  head_branch: string
  head_sha: string
  run_number: number
  event: string
  status: string
  conclusion: string
  workflow_id: number
  check_suite_id: number
  check_suite_node_id: string
  url: string
  html_url: string
  // pull_requests: any[]
  created_at: string
  updated_at: string
  jobs_url: string
  logs_url: string
  check_suite_url: string
  artifacts_url: string
  cancel_url: string
  rerun_url: string
  workflow_url: string
  head_commit: HeadCommit
  repository: Repository
  head_repository: Repository
}

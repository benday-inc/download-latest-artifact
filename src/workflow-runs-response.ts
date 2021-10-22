import {WorkflowRun} from './workflow-run'

export interface WorkflowRunsResponse {
  total_count: number
  workflow_runs: WorkflowRun[]
}

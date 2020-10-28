import {WorkflowRun} from './WorkflowRun'

export interface WorkflowRunsResponse {
  total_count: number
  workflow_runs: WorkflowRun[]
}

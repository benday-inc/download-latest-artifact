import {Workflow} from './workflow'

export interface WorkflowResponse {
  total_count: number
  workflows: Workflow[]
}

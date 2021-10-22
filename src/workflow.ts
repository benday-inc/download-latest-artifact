export interface Workflow {
  id: number
  node_id: string
  name: string
  path: string
  state: string
  created_at: Date
  updated_at: Date
  url: string
  html_url: string
  badge_url: string
}

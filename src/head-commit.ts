import {Author} from './author'

export interface HeadCommit {
  id: string
  tree_id: string
  message: string
  timestamp: string
  author: Author
  committer: Author
}

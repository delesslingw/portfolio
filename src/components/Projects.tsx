import { getAllProjects } from '../lib/projects'
import Project from './Project'
const colors = [
  '#fe9aaa',
  '#fea741',
  '#d19d3a',
  '#f7f58c',
  '#c1fc40',
  '#2dfe50',
  '#34feaf',
  '#65ffea',
  '#90c7fc',
  '#5c86e1',
  '#97abfb',
  '#d975e2',
  '#e55ca2',
]
export default async function Projects() {
  const projects = await getAllProjects()
  return (
    <section style={{ display: 'flex', flexDirection: 'column' }}>
      {projects.map((p, i) => {
        return <Project p={p} key={p.slug} color={colors[i]} />
      })}
    </section>
  )
}

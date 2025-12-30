import { getAllProjects } from '../lib/projects'
import colors from './colors'
import Project from './Project'

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

import { getAllProjects } from '../lib/projects'
import Project from './Project'

export default async function Projects() {
  const projects = await getAllProjects()
  return (
    <section style={{ display: 'flex', flexDirection: 'column' }}>
      {projects.map((p) => {
        return <Project p={p} key={p.slug} />
      })}
    </section>
  )
}

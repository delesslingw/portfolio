import { getAllProjects } from '../lib/projects'
import Project from './Project'
export default async function Projects() {
  const projects = await getAllProjects()
  return (
    <section className=''>
      {projects.map((p) => (
        <Project p={p} key={p.slug} />
      ))}
    </section>
  )
}

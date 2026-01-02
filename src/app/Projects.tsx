import colors from '../components/colors'
import Project from '../components/Project'
import Section from '../components/Section'
import { getAllProjects } from '../lib/projects'

export default async function Projects() {
  const projects = await getAllProjects()
  return (
    <section style={{ display: 'flex', flexDirection: 'column' }}>
      {projects.map((p, i) => {
        return (
          <>
            {i == 0 ? (
              <Section>
                <div className='flex-1 bg-[#111]'>hallo</div>
              </Section>
            ) : null}
            <Project p={p} key={p.slug} color={colors[i]} />
          </>
        )
      })}
    </section>
  )
}

import ContactForm from './ContactForm'
const Contact = () => {
  const color = '#333'
  return (
    <section
      className='border-l-16 min-h-[500px] flex'
      style={{ borderColor: color }}
    >
      <div className='mx-4 flex-1 p-4' style={{ backgroundColor: color }}>
        <h3 className='text-2xl text-white font-bold'>Contact</h3>
        <h4 className='text-white text-lg mb-4'>
          Have a question, idea, or project you want to discuss?
        </h4>
        <ContactForm />
      </div>
    </section>
  )
}

export default Contact

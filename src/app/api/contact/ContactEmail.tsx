import {
  Body,
  Container,
  Hr,
  Html,
  pretty,
  render,
  Section,
  Text,
} from '@react-email/components'

const ContactEmail = ({
  name,
  message,
  color,
}: {
  name: string
  message: string
  color: string
}) => {
  return (
    <Html lang='en'>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#fe9aaa',
        }}
      >
        {/* Full-width background */}
        <Section
          style={{
            backgroundColor: color,
            padding: '40px 16px', // space around the white card
          }}
        >
          {/* Centered white card */}
          <Container
            style={{
              backgroundColor: '#ffffff',
              padding: '24px',
              maxWidth: '560px',
              margin: '0 auto',
              // borderRadius: '6px',
            }}
          >
            <Text>Tanake {name},</Text>

            <Text>
              Thank you for reaching out! I&apos;ve received your message and
              will get back to you as soon as possible.
            </Text>

            <Text>Hawu kuri,</Text>
            <Text>DeLesslin</Text>

            <Text>Below is your message:</Text>
            <Hr />

            <Text
              style={{
                fontFamily: 'monospace',
              }}
            >
              {message}
            </Text>
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

export const genEmail = async ({
  name,
  message,
  color,
}: {
  name: string
  message: string
  color: string
}) => {
  return await pretty(
    await render(<ContactEmail name={name} message={message} color={color} />)
  )
}

export default ContactEmail

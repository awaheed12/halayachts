import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Tailwind,
} from '@react-email/components';

export default function NewsletterWelcome({ email }) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Hala Yachts Luxury Newsletter</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-10 px-5 bg-gradient-to-br from-blue-50 to-gray-50">
            {/* Header */}
            <Section className="text-center mb-8">
              <Heading className="text-3xl font-bold text-gray-800 mb-2">
                Hala Yachts
              </Heading>
              <Text className="text-lg text-gray-600">
                Luxury Yacht Experiences
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <Heading className="text-2xl font-semibold text-gray-800 mb-4">
                Welcome Aboard! 🛥️
              </Heading>
              
              <Text className="text-lg text-gray-700 mb-4">
                Dear Valued Guest,
              </Text>
              
              <Text className="text-gray-600 mb-4">
                Thank you for subscribing to the Hala Yachts newsletter! We're thrilled to have you join our exclusive community of luxury travel enthusiasts.
              </Text>

              <Text className="text-gray-600 mb-4">
                You'll be the first to receive updates on:
              </Text>

              <Section className="mb-4">
                <Text className="text-gray-600 mb-2">✨ New yacht arrivals and fleet updates</Text>
                <Text className="text-gray-600 mb-2">🌴 Exclusive destinations and itineraries</Text>
                <Text className="text-gray-600 mb-2">🎯 Special offers and seasonal promotions</Text>
                <Text className="text-gray-600 mb-2">📸 Insider travel tips and luxury insights</Text>
              </Section>

              <Text className="text-gray-600 mb-6">
                We look forward to helping you discover extraordinary yachting experiences.
              </Text>

              <Section className="text-center border-t border-gray-200 pt-6">
                <Text className="text-sm text-gray-500">
                  Subscription email: {email}
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-sm text-gray-500 mb-2">
                Hala Yachts - Where Luxury Meets the Sea
              </Text>
              <Text className="text-xs text-gray-400">
                © {new Date().getFullYear()} Hala Yachts. All rights reserved.
              </Text>
              <Text className="text-xs text-gray-400 mt-2">
                <Link href="#" className="text-blue-500 underline mx-2">Unsubscribe</Link>
                |
                <Link href="#" className="text-blue-500 underline mx-2">Privacy Policy</Link>
                |
                <Link href="#" className="text-blue-500 underline mx-2">Contact Us</Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
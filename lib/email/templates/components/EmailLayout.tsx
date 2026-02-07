/**
 * Base Email Layout Component
 */

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Img,
} from '@react-email/components';
import React from 'react';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  unsubscribeUrl: string;
}

export default function EmailLayout({ preview, children, unsubscribeUrl }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${process.env.NEXTAUTH_URL}/logo.png`}
              width="40"
              height="40"
              alt="Blaniel"
              style={logo}
            />
            <Text style={headerText}>Blaniel</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              2025 Blaniel. Todos los derechos reservados.
            </Text>
            <Text style={footerText}>
              <Link href={unsubscribeUrl} style={footerLink}>
                Cancelar suscripción
              </Link>
              {' · '}
              <Link href={`${process.env.NEXTAUTH_URL}/privacy`} style={footerLink}>
                Privacidad
              </Link>
              {' · '}
              <Link href={`${process.env.NEXTAUTH_URL}/support`} style={footerLink}>
                Soporte
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 48px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
  marginBottom: '16px',
};

const headerText = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: 0,
};

const content = {
  padding: '0 48px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  padding: '0 48px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '8px 0',
};

const footerLink = {
  color: '#8898aa',
  textDecoration: 'underline',
};

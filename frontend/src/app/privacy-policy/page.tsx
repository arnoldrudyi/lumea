import React from "react";
import { Metadata } from "next";

import { LogoLight } from "@/components/svgs";
import { Container, Title } from "@/components/shared";

export const metadata: Metadata = {
  title: 'Lumea - Privacy Policy',
}

export default function PrivacyPage() {
    return (
      <>
        <a href="/">
          <LogoLight className="absolute right-0 left-0 mx-auto top-8" />
        </a>
        <Container className="flex flex-col space-y-5 py-24">
          <Title size="sm" text="Privacy Policy" className="font-bold mx-auto pb-4" />
          <p>Effective Date: <b>31.08.2024</b></p>
          <Title size="xxs" text="1. Introduction" />
          <p>
            Welcome to Lumea (&quot;the App&quot;). We value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our app and related services.
          </p>

          <Title size="xxs" text="2. Information We Collect" />
          <Title size="xxs" text="a. Personal Information" />
          <p>
            - Account Information: When you create an account, we may collect your name, email address, and password.
            <br />
            - Study Preferences: Information related to your study topics, preferences, and time allocations.
          </p>
          <Title size="xxs" text="b. Usage Data" />
          <p>
            - Log Data: We collect data on how you interact with the App, including the features you use and the time you spend on each section.
            <br />
            - Device Information: Information about the device you use to access the App, including IP address, browser type, and operating system.
          </p>
          <Title size="xxs" text="c. Cookies and Tracking Technologies" />
          <p>
            We may use cookies and similar tracking technologies to enhance your experience, track usage, and analyze user behavior.
          </p>

          <Title size="xxs" text="3. How We Use Your Information" />
          <p>
            - Personalization: To tailor study plans and quizzes to your preferences.
            <br />
            - Communication: To send you updates, respond to inquiries, and provide customer support.
            <br />
            - Improvement: To analyze usage data to improve the App’s features and user experience.
            <br />
            - Security: To monitor and protect the App from security threats and unauthorized access.
          </p>

          <Title size="xxs" text="4. Sharing Your Information" />
          <p>
            We do not sell, trade, or otherwise transfer your personal information to outside parties without your consent, except as necessary to provide the App&apos;s services or comply with legal obligations.
          </p>

          <Title size="xxs" text="5. Data Security" />
          <p>
            We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction.
          </p>

          <Title size="xxs" text="6. Your Rights" />
          <p>
            - Access: You have the right to access the personal information we hold about you.
            <br />
            - Correction: You can request that we correct any inaccurate or incomplete information.
            <br />
            - Deletion: You can request that we delete your personal data, subject to certain legal obligations.
            <br />
            - Opt-Out: You may opt-out of receiving promotional emails from us by following the unsubscribe link in those emails.
          </p>

          <Title size="xxs" text="7. Third-Party Links" />
          <p>
            The App may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third-party sites.
          </p>

          <Title size="xxs" text="8. Children's Privacy" />
          <p>
            Lumea is not intended for use by individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently collected such data, we will take steps to delete it.
          </p>

          <Title size="xxs" text="9. Changes to This Privacy Policy" />
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted within the App, and the &quot;Effective Date&quot; will be updated accordingly.
          </p>

          <Title size="xxs" text="10. Contact Us" />
          <p>
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at <b>hi.arnoldrudyi@gmail.com</b>.
          </p>
        </Container>
      </>
    )
}
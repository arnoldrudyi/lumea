import React from "react";
import { Metadata } from "next";

import { LogoLight } from "@/components/svgs";
import { Container, Title } from "@/components/shared";

export const metadata: Metadata = {
  title: 'Lumea - Terms of Service',
}

export default function TermsPage() {
    return (
      <>
        <a href="/">
          <LogoLight className="absolute right-0 left-0 mx-auto top-8" />
        </a>
        <Container className="flex flex-col space-y-5 py-24">
          <Title size="sm" text="Terms of Service" className="font-bold mx-auto pb-4" />
          <p>Effective Date: <b>31.08.2024</b></p>
          <Title size="xxs" text="1. Acceptance of Terms" />
            <p>
            By accessing and using the Lumea application (&quot;the App&quot;), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, you should not use the App.
            </p>

            <Title size="xxs" text="2. Use of the App" />
            <p>
            You agree to use the App in accordance with all applicable laws and regulations. You are responsible for all activity that occurs under your account, and you must keep your account password secure.
            </p>

            <Title size="xxs" text="3. User Content" />
            <p>
            You retain ownership of any content you submit, post, or display on or through the App. However, by submitting content, you grant Lumea a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content in connection with the operation of the App.
            </p>

            <Title size="xxs" text="4. Intellectual Property" />
            <p>
            All content, trademarks, service marks, logos, and intellectual property related to the App are either the property of Lumea or are used with permission from their respective owners. This includes public icons and AI tools, which may be subject to their own licensing terms. You may not use any of these without prior written consent, except as permitted by the respective licenses or terms of use.
            </p>

            <Title size="xxs" text="5. Termination" />
            <p>
            We reserve the right to terminate or suspend your account and access to the App at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users of the App.
            </p>

            <Title size="xxs" text="6. Limitation of Liability" />
            <p>
            Lumea shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the App.
            </p>

            <Title size="xxs" text="7. Changes to the Terms" />
            <p>
            We may update these Terms of Service from time to time. Any changes will be effective upon posting the revised terms within the App. Your continued use of the App after such changes constitutes your acceptance of the new Terms of Service.
            </p>

            <Title size="xxs" text="8. Governing Law" />
            <p>
            These Terms of Service are governed by and construed in accordance with the laws of <b>Hungary</b>. Any disputes arising under or in connection with these terms shall be resolved in the courts of <b>Hungary</b>.
            </p>

            <Title size="xxs" text="9. Contact Information" />
            <p>
            If you have any questions about these Terms of Service, please contact us at <b>hi.arnoldrudyi@gmail.com</b>.
            </p>
        </Container>
      </>
    )
}
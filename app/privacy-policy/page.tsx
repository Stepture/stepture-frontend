import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Stepture",
  description:
    "Learn how Stepture collects, uses, and protects your personal information. Understand your privacy rights and our commitment to data security.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600">Last updated: December 24, 2024</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              At Stepture ("we," "our," or "us"), we are committed to protecting
              your privacy and ensuring the security of your personal
              information. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our browser
              extension, web application, and related services (collectively,
              the "Services").
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Information We Collect
            </h2>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              Personal Information
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>
                <strong>Google Account Information:</strong> When you sign in
                with Google OAuth, we collect your name, email address, Google
                ID, and profile image.
              </li>
              <li>
                <strong>Authentication Tokens:</strong> We store encrypted
                Google OAuth access and refresh tokens to maintain your
                authenticated session and access Google Drive services.
              </li>
              <li>
                <strong>Account Data:</strong> User preferences, settings, and
                account configuration information.
              </li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              Content and Usage Data
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>
                <strong>Screenshots and Images:</strong> Screenshots captured
                through our browser extension, including viewport coordinates,
                device pixel ratios, and display metadata.
              </li>
              <li>
                <strong>Step Documentation:</strong> Text descriptions, step
                sequences, document titles, and organizational metadata you
                create.
              </li>
              <li>
                <strong>Web Interaction Data:</strong> Information about
                elements you interact with on web pages, including click
                coordinates, element properties (tag names, IDs, classes), and
                page URLs.
              </li>
              <li>
                <strong>Browser Context:</strong> Viewport dimensions, device
                pixel ratio, screen resolution, and browser technical
                specifications necessary for accurate screenshot capture.
              </li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              Technical Information
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>
                <strong>Device Information:</strong> Browser type, operating
                system, device specifications, and extension version.
              </li>
              <li>
                <strong>Usage Analytics:</strong> Service interaction patterns,
                feature usage statistics, and performance metrics.
              </li>
              <li>
                <strong>Cookies and Local Storage:</strong> Authentication
                cookies, session tokens, and browser local storage for offline
                functionality.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>
                <strong>Service Provision:</strong> To provide, maintain, and
                improve our step-by-step documentation creation services.
              </li>
              <li>
                <strong>Authentication:</strong> To verify your identity and
                maintain secure access to your account across sessions.
              </li>
              <li>
                <strong>Content Management:</strong> To store, organize, and
                retrieve your created documentation and screenshots.
              </li>
              <li>
                <strong>Google Drive Integration:</strong> To upload and manage
                your screenshots and documents in your designated Google Drive
                folder.
              </li>
              <li>
                <strong>Feature Enhancement:</strong> To develop new features,
                improve user experience, and optimize service performance.
              </li>
              <li>
                <strong>Communication:</strong> To send important service
                updates, security alerts, and respond to support inquiries.
              </li>
              <li>
                <strong>Compliance:</strong> To comply with legal obligations
                and protect against fraudulent or unauthorized use.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Data Storage and Third-Party Services
            </h2>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              Google Drive Integration
            </h3>
            <p className="text-gray-700 mb-4">
              We integrate with Google Drive to store your screenshots and
              documentation. When you use our services:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>
                We create a dedicated folder named "Stepture - [Your Name]" in
                your Google Drive
              </li>
              <li>
                All captured screenshots are uploaded to this folder with public
                read permissions for sharing functionality
              </li>
              <li>
                We store Google Drive file IDs and public URLs in our database
                for content management
              </li>
              <li>
                Deleted content is automatically removed from both our systems
                and your Google Drive
              </li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              Database Storage
            </h3>
            <p className="text-gray-700 mb-4">
              We use PostgreSQL databases hosted on secure cloud infrastructure
              to store:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>User account information and preferences</li>
              <li>
                Document metadata, step descriptions, and organizational
                structures
              </li>
              <li>
                Screenshot metadata including URLs, coordinates, and technical
                specifications
              </li>
              <li>Encrypted authentication tokens and session data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Data Security
            </h2>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures to protect your
              information:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>
                <strong>Encryption:</strong> All data transmission is encrypted
                using HTTPS/TLS protocols
              </li>
              <li>
                <strong>Token Security:</strong> Authentication tokens are
                encrypted using advanced cryptographic methods
              </li>
              <li>
                <strong>Access Controls:</strong> Strict access controls and
                authentication requirements for all service components
              </li>
              <li>
                <strong>Secure Infrastructure:</strong> Cloud-hosted
                infrastructure with regular security updates and monitoring
              </li>
              <li>
                <strong>Data Isolation:</strong> User data is properly isolated
                and accessible only to authorized systems
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibond text-gray-900 mb-4">
              Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or otherwise transfer your personal
              information to third parties, except in the following
              circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>
                <strong>With Your Consent:</strong> When you explicitly share
                documents or grant access to specific users
              </li>
              <li>
                <strong>Service Providers:</strong> With trusted third-party
                service providers (Google Drive, cloud infrastructure) necessary
                for service operation
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law, court
                order, or to protect our rights and safety
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a
                merger, acquisition, or sale of assets, with advance notice
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your Rights and Choices
            </h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>
                <strong>Access and Portability:</strong> You can access,
                download, and export all your data through our service interface
              </li>
              <li>
                <strong>Correction:</strong> You can update, edit, or correct
                your personal information and content at any time
              </li>
              <li>
                <strong>Deletion:</strong> You can delete individual documents,
                screenshots, or your entire account and associated data
              </li>
              <li>
                <strong>Data Control:</strong> You maintain full control over
                your Google Drive folder and can revoke access permissions
              </li>
              <li>
                <strong>Communication Preferences:</strong> You can opt out of
                non-essential communications while maintaining service
                notifications
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Browser Extension Privacy
            </h2>
            <p className="text-gray-700 mb-4">
              Our browser extension operates with specific privacy
              considerations:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>
                <strong>Selective Operation:</strong> The extension only
                captures data when explicitly activated by you
              </li>
              <li>
                <strong>Local Storage:</strong> Captured data is temporarily
                stored locally before secure upload to our servers
              </li>
              <li>
                <strong>Permission-Based:</strong> All web page interactions
                require your explicit consent and activation
              </li>
              <li>
                <strong>Content Script Isolation:</strong> Our content scripts
                operate in isolation and do not interfere with page
                functionality
              </li>
              <li>
                <strong>No Passive Monitoring:</strong> We do not monitor or
                collect data from web pages unless actively recording
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Data Retention
            </h2>
            <p className="text-gray-700 mb-4">
              We retain your information for as long as necessary to provide our
              services and comply with legal obligations:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>
                <strong>Account Data:</strong> Retained while your account is
                active and for a reasonable period after deactivation
              </li>
              <li>
                <strong>Content:</strong> Documents and screenshots are retained
                until you delete them or close your account
              </li>
              <li>
                <strong>Authentication Tokens:</strong> Regularly refreshed and
                expired tokens are securely deleted
              </li>
              <li>
                <strong>Usage Data:</strong> Aggregated usage statistics may be
                retained for service improvement purposes
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              International Data Transfers
            </h2>
            <p className="text-gray-700 mb-4">
              Your information may be processed and stored in countries other
              than your country of residence. We ensure appropriate safeguards
              are in place to protect your data in accordance with applicable
              privacy laws and regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Children's Privacy
            </h2>
            <p className="text-gray-700 mb-4">
              Our Services are not intended for individuals under the age of 13.
              We do not knowingly collect personal information from children
              under 13. If you become aware that a child has provided us with
              personal information, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or applicable laws. We will notify you of
              any material changes by posting the new Privacy Policy on this
              page and updating the "Last updated" date. Your continued use of
              our Services after such changes constitutes acceptance of the
              updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 mb-4">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong>steptureabac@gmail.com
                <br />
                <strong>Support:</strong>steptureabac@gmail.com
                <br />
                <strong>Address:</strong> Stepture Privacy Team
                <br />
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

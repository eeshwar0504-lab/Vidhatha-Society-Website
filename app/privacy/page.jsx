// app/privacy/page.jsx

export const metadata = {
  title: "Privacy Policy | Vidhatha Society",
  description: "Learn how Vidhatha Society handles user data and protects privacy.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "December 08, 2025"; // set manually so it doesn't change on every build

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Privacy Policy
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Last updated: {lastUpdated}
        </p>

        <div className="space-y-6 text-gray-700 leading-relaxed text-[15px]">
          {/* 1. Intro */}
          <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Introduction
            </h2>
            <p>
              Vidhatha Society (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
              is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, store, and protect your information
              when you interact with us online or offline, including through
              our website, donation forms, volunteering forms, and events.
            </p>
          </section>

          {/* 2. Information we collect */}
          <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Information We Collect
            </h2>
            <p className="mb-2">
              The types of information we may collect include:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Name, email address, and phone number</li>
              <li>
                Details submitted through contact, volunteer, membership, or
                donation forms
              </li>
              <li>
                Transaction-related information when you make a donation or
                payment (processed securely via our payment partners)
              </li>
              <li>
                Basic technical data such as IP address, browser type, and
                pages visited (for analytics and security)
              </li>
            </ul>
          </section>

          {/* 3. How we use your information */}
          <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              How We Use Your Information
            </h2>
            <p className="mb-2">
              We may use your information for the following purposes:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>To respond to your queries and communicate with you</li>
              <li>To process donations and issue receipts or acknowledgements</li>
              <li>To manage volunteering, membership, and program participation</li>
              <li>To send updates about our work, campaigns, and events (only if you consent)</li>
              <li>To improve our website, services, and outreach</li>
              <li>To comply with legal, accounting, and reporting obligations</li>
            </ul>
          </section>

          {/* 4. Payments */}
          <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Donations and Payments
            </h2>
            <p>
              When you donate or make a payment, your payment details are
              processed securely by our payment gateway provider (such as
              Razorpay). We do not store your full card details on our servers.
              You can refer to Razorpay&apos;s privacy policy for more
              information on how they handle your data.
            </p>
          </section>

          {/* 5. Sharing */}
          <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Information Sharing
            </h2>
            <p>
              We do not sell or rent your personal information. We may share
              your data only with:
            </p>
            <ul className="list-disc ml-6 space-y-1 mt-1">
              <li>
                Trusted service providers (such as email or payment service
                providers) who assist us in operating our services
              </li>
              <li>
                Authorities or regulators when required by law, regulation, or
                legal process
              </li>
            </ul>
            <p className="mt-2">
              In all cases, we take reasonable steps to ensure appropriate
              confidentiality and security.
            </p>
          </section>

          {/* 6. Data security */}
          <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Data Security
            </h2>
            <p>
              We use reasonable technical and organisational measures to protect
              your information from unauthorised access, loss, or misuse.
              However, no method of transmission over the internet is completely
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* 7. Cookies */}
          <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Cookies and Tracking Technologies
            </h2>
            <p>
              Our website may use cookies or similar technologies to improve
              your browsing experience, analyse website traffic, and understand
              how visitors use our site. You can control or disable cookies
              through your browser settings, but some features may not function
              correctly if cookies are turned off.
            </p>
          </section>

          {/* 8. Children */}
          <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Children&apos;s Privacy
            </h2>
            <p>
              We work closely with children through our programs, but we do not
              knowingly collect personal information from children online
              without appropriate consent from a parent or guardian. If you
              believe a child has provided us personal data without consent,
              please contact us and we will remove it.
            </p>
          </section>

          {/* 9. Your rights */}
          <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Your Rights and Choices
            </h2>
            <p className="mb-2">
              Depending on applicable laws, you may have the right to:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction or updating of inaccurate information</li>
              <li>Request deletion of your personal data, where appropriate</li>
              <li>
                Withdraw consent for email/SMS updates or other communications
              </li>
            </ul>
            <p className="mt-2">
              To exercise these rights, please contact us using the details
              below.
            </p>
          </section>

          {/* 10. Third-party links */}
          <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Third-Party Websites
            </h2>
            <p>
              Our website and social media pages may contain links to external
              websites (such as payment gateways, blogs, or social platforms).
              We are not responsible for the privacy practices or content of
              those third-party sites. We encourage you to review their privacy
              policies separately.
            </p>
          </section>

          {/* 11. Updates */}
          <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices, legal requirements, or services.
              Updated versions will be posted on this page with the revised
              &quot;Last updated&quot; date.
            </p>
          </section>

          {/* 12. Contact */}
          <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Contact Us
            </h2>
            <p>
              If you have any questions, concerns, or requests related to this
              Privacy Policy, please contact us:
            </p>
            <p className="mt-2">
              <strong>Vidhatha Society</strong>
              <br />
              C-841, NGO Colony, Vanasthalipuram,
              <br />
              Hyderabad, Telangana 500070
              <br />
              <strong>Email:</strong>{" "}
              <a
                href="mailto:vidhathasociety@gmail.com"
                className="text-blue-600 underline"
              >
                vidhathasociety@gmail.com
              </a>
              <br />
              <strong>Phone:</strong>{" "}
              <a
                href="tel:+919542366556"
                className="text-blue-600 underline"
              >
                +91 95423 66556
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

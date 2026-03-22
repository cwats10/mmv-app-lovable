import { PublicShell } from '@/components/layout/PublicShell';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';

const sections = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly: your name, email address, and delivery address when you create an account or purchase a book. Contributors provide their name, relationship to the missionary, written messages, and photographs. We also collect usage data such as pages visited, browser type, and device information through standard server logs.`,
  },
  {
    title: '2. How We Use It',
    body: `We use your information to operate and improve the Service, including creating and managing vaults, processing submissions, producing printed books, processing payments, communicating with you about your account or orders, and preventing fraud. We do not use your content for advertising or sell your personal information to third parties.`,
  },
  {
    title: '3. Data Storage',
    body: `Your data is stored securely using industry-standard encryption at rest and in transit. Account information, vault data, and submitted content are hosted on secure cloud infrastructure. Uploaded photos and generated book files are stored in encrypted cloud storage buckets. We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, or destruction.`,
  },
  {
    title: '4. Third-Party Services',
    body: `We share limited information with trusted third-party providers to deliver the Service. Stripe processes payments — they receive your name, email, and payment details under their own privacy policy. Our print fulfillment partner receives the final book file and your delivery address to produce and ship your order. We do not share submitted content, personal messages, or photographs with any other third parties.`,
  },
  {
    title: '5. Data Retention',
    body: `We retain your account information and vault content for as long as your account is active. Submitted memories are preserved indefinitely within their vault so they remain available for future book editions. If you delete your account, your profile data is removed, but vault content that has already been included in purchased books cannot be retroactively removed from printed copies. You may request deletion of unpublished content at any time.`,
  },
  {
    title: '6. User Rights',
    body: `You have the right to access, correct, or delete your personal information at any time. You may export your data by contacting us. If you are located in the European Economic Area, you have additional rights under GDPR including the right to data portability, the right to restrict processing, and the right to object to processing. To exercise any of these rights, contact us at the address below.`,
  },
  {
    title: '7. Contact',
    body: `If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at privacy@missionmemoryvault.com.`,
  },
];

export default function Privacy() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-20">
        <PageTag>Legal</PageTag>
        <h1 className="mt-2 font-playfair text-3xl font-semibold text-dark-text sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 font-inter text-sm text-muted-text">
          Last updated: March 22, 2026
        </p>

        <Divider className="my-8" />

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-playfair text-xl font-semibold text-dark-text">
                {section.title}
              </h2>
              <p className="mt-3 font-inter text-sm leading-relaxed text-muted-text">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}

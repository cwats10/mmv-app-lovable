import { PublicShell } from '@/components/layout/PublicShell';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using Mission Memory Vault ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service. We reserve the right to update these terms at any time, and your continued use of the Service constitutes acceptance of any changes.`,
  },
  {
    title: '2. Description of Service',
    body: `Mission Memory Vault is a platform that enables families and communities to collect written memories, photos, and stories for a missionary, and compile them into a professionally printed hardcover book. The Service includes vault creation, contributor submission collection, content review, book design, and print fulfillment.`,
  },
  {
    title: '3. User Accounts',
    body: `You must create an account to use certain features of the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information as necessary. We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: '4. Submissions & Content Ownership',
    body: `Contributors retain ownership of the content they submit, including text and photographs. By submitting content to a vault, contributors grant Mission Memory Vault a non-exclusive, royalty-free license to reproduce, display, and include the content in printed books and digital previews associated with that vault. Vault owners are responsible for reviewing and approving submissions before they are included in a book. Mission Memory Vault does not claim ownership of user-submitted content.`,
  },
  {
    title: '5. Payment & Refunds',
    body: `Book purchases are processed securely through Stripe. Prices are displayed before checkout, and sales tax may apply based on your delivery address. Because each book is custom-printed on demand, all sales are final once the book enters production. If you receive a damaged or defective book, please contact us within 14 days of delivery for a replacement. Refund requests for other reasons will be considered on a case-by-case basis.`,
  },
  {
    title: '6. Privacy',
    body: `We collect and process personal information as described in our Privacy Policy. We use your data solely to provide and improve the Service. We do not sell personal information to third parties. Submitted content is stored securely and is only accessible to the vault owner, designated managers, and Mission Memory Vault for the purpose of fulfilling book orders.`,
  },
  {
    title: '7. Limitation of Liability',
    body: `Mission Memory Vault is provided "as is" without warranty of any kind, express or implied. To the fullest extent permitted by law, Mission Memory Vault and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or data, arising out of or in connection with your use of the Service. Our total liability for any claim arising from these terms shall not exceed the amount you paid to us in the twelve months preceding the claim.`,
  },
  {
    title: '8. Contact',
    body: `If you have any questions about these Terms of Service, please contact us at support@missionmemoryvault.com.`,
  },
];

export default function Terms() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-20">
        <PageTag>Legal</PageTag>
        <h1 className="mt-2 font-playfair text-3xl font-semibold text-dark-text sm:text-4xl">
          Terms of Service
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

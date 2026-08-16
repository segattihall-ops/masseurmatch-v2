import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Prohibited Conduct Policy";
const DESCRIPTION =
  "Conduct that is strictly prohibited on MasseurMatch — sexual solicitation, harassment, trafficking, fraud, and all zero-tolerance violations.";
const PATH = "/prohibited-conduct";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    type: "website",
    url: absoluteUrl(PATH),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Page() {
  return (
    <LegalPage title={TITLE} path={PATH} lastUpdated="June 29, 2026">
      <p>
        This policy describes conduct that is strictly prohibited on MasseurMatch. These
        prohibitions apply to all users — clients, providers, and visitors. Violations will result
        in enforcement action, which may include immediate account termination and referral to law
        enforcement.
      </p>
      <p>
        MasseurMatch maintains a zero-tolerance approach to conduct that endangers users,
        facilitates illegal activity, or undermines the platform&apos;s integrity as a professional
        wellness directory.
      </p>

      <h2>1. Sexual Solicitation and Illegal Services</h2>
      <p>
        The following are absolutely prohibited and will result in immediate termination and
        potential law enforcement referral:
      </p>
      <ul>
        <li>Soliciting, offering, requesting, or facilitating sexual services of any kind.</li>
        <li>
          Soliciting, offering, or requesting erotic massage, escort services, or any commercial
          sexual activity.
        </li>
        <li>Using coded language, euphemisms, or innuendo to imply illegal or sexual services.</li>
        <li>
          Using the platform to facilitate human trafficking, sex trafficking, or coercion of any
          kind.
        </li>
        <li>
          Prostitution or any arrangement where sexual services are exchanged for money, gifts, or
          benefits.
        </li>
        <li>Posting explicit nudity, pornographic content, or sexually explicit images or text.</li>
        <li>
          Any content that sexualizes, depicts, or involves a minor. Child sexual abuse material
          (CSAM) is reported to the National Center for Missing &amp; Exploited Children (NCMEC) and
          law enforcement.
        </li>
      </ul>

      <h2>2. Harassment, Threats, and Intimidation</h2>
      <ul>
        <li>Sending threatening, abusive, or harassing messages to any user.</li>
        <li>Engaging in coordinated harassment or encouraging others to harass a user.</li>
        <li>Making threats of physical violence or harm against any person.</li>
        <li>Stalking or persistent unwanted contact after a user has asked you to stop.</li>
        <li>
          Publishing or threatening to publish another person&apos;s private information (doxxing).
        </li>
        <li>Intimidation, coercion, or pressure to perform prohibited services.</li>
      </ul>

      <h2>3. Discrimination and Hate Conduct</h2>
      <ul>
        <li>
          Using slurs, hate speech, or dehumanizing language targeting any individual or group.
        </li>
        <li>
          Discriminating against or refusing service based on race, ethnicity, gender, gender
          identity, sexual orientation, religion, disability, age, or national origin.
        </li>
        <li>
          Posting content that promotes, glorifies, or incites hatred against any protected group.
        </li>
        <li>Harassment or targeting of LGBTQ+ individuals or any other identity group.</li>
      </ul>

      <h2>4. Fraud, Impersonation, and Deception</h2>
      <ul>
        <li>Impersonating any person, business, brand, or organization.</li>
        <li>Creating fake accounts, duplicate profiles, or sock puppet accounts.</li>
        <li>Misrepresenting professional credentials, licenses, certifications, or experience.</li>
        <li>Submitting false or fabricated reviews, testimonials, or endorsements.</li>
        <li>
          Using stolen photos, AI-generated faces, or misleading images to represent a profile.
        </li>
        <li>Fraudulent billing disputes, chargebacks, or payment manipulation.</li>
        <li>Phishing, pretexting, or social engineering attacks targeting users or staff.</li>
        <li>Attempting to circumvent a suspension or ban through a new registration.</li>
      </ul>

      <h2>5. Safety Violations</h2>
      <ul>
        <li>
          Using the platform to arrange meetings for illegal, unsafe, or exploitative purposes.
        </li>
        <li>Facilitating or coordinating any activity that puts users at physical risk.</li>
        <li>Ignoring or overriding a user&apos;s clearly stated safety boundaries.</li>
        <li>Contacting minors or facilitating access to the platform by persons under 18.</li>
        <li>
          Using personal data obtained through the platform for stalking, tracking, or surveillance.
        </li>
      </ul>

      <h2>6. Technical Abuse</h2>
      <ul>
        <li>Scraping, crawling, or automated data harvesting without written permission.</li>
        <li>Reverse engineering, decompiling, or tampering with any part of the platform.</li>
        <li>Introducing malware, viruses, or harmful code to the platform or its users.</li>
        <li>Attempting to gain unauthorized access to accounts, systems, or data.</li>
        <li>Overloading or interfering with the platform&apos;s performance or availability.</li>
        <li>Circumventing security, moderation, or content filtering systems.</li>
      </ul>

      <h2>7. Enforcement</h2>
      <p>
        Enforcement actions include warnings, content removal, temporary suspension, permanent
        account termination, IP and device flagging to prevent re-registration, and referral to law
        enforcement. The severity of the action depends on the nature of the violation, prior
        history, and risk to users and the platform.
      </p>
      <p>
        MasseurMatch does not guarantee any particular timeline or outcome for any enforcement
        action. We may take action without prior notice when safety or legal urgency requires it.
      </p>

      <h2>8. Legal Compliance and Law Enforcement (FOSTA-SESTA)</h2>
      <p>
        MasseurMatch is a professional wellness directory. It is not an escort or adult-services
        platform, and it does not permit, host, or facilitate commercial sexual activity. We do not
        tolerate any use of the platform to promote or facilitate prostitution or sex trafficking,
        and we design our policies, moderation, and reporting tools to prevent it.
      </p>
      <p>
        Consistent with the Allow States and Victims to Fight Online Sex Trafficking Act and the
        Stop Enabling Sex Traffickers Act (together, &ldquo;FOSTA-SESTA,&rdquo; including 18 U.S.C.
        &sect;&nbsp;2421A) and our obligations under 18 U.S.C. &sect;&nbsp;2258A, MasseurMatch:
      </p>
      <ul>
        <li>
          Prohibits any content or conduct that owns, manages, or operates the platform with intent
          to promote or facilitate the prostitution of another person.
        </li>
        <li>
          Removes offending content and terminates the accounts responsible when we become aware of
          a violation.
        </li>
        <li>
          Preserves relevant records and cooperates with valid legal process and law enforcement
          investigations into trafficking, exploitation, or other criminal activity.
        </li>
        <li>
          Reports apparent child sexual abuse material (CSAM) to the National Center for Missing
          &amp; Exploited Children (NCMEC) CyberTipline as required by law.
        </li>
      </ul>
      <p>
        Nothing on this platform is intended to facilitate any transaction that is unlawful in the
        applicable jurisdiction. This policy does not create any obligation, warranty, or liability
        beyond what applicable law requires, and MasseurMatch is a neutral intermediary that does
        not create user content.
      </p>

      <h2>9. Reporting</h2>
      <p>
        Report prohibited conduct to
        <a href="mailto:trust@masseurmatch.com">trust@masseurmatch.com</a>, or use the
        <strong>&ldquo;Report this profile&rdquo;</strong> link on any therapist profile. For
        emergencies or suspected trafficking, contact local law enforcement or the National Human
        Trafficking Hotline at
        <strong>1-888-373-7888</strong>. To report child sexual exploitation, contact the NCMEC
        CyberTipline at
        <strong>1-800-843-5678</strong> or
        <a href="https://report.cybertip.org">report.cybertip.org</a>.
      </p>

      <h2>10. Contact</h2>
      <p>
        Policy questions: <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a>.<br />
        Operator: XRankFlow Media Group LLC — Dover, Delaware, USA.
      </p>
    </LegalPage>
  );
}

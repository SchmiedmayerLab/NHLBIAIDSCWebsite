const deploymentUrl = process.env.SITE_URL ?? 'https://nhlbi-ai-dsc.org';
const deploymentBase = process.env.SITE_BASE ?? '';
const defaultParticipationFormUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLScqREncXYai5WXLxO608vT2zsXQ5b9DKDUN7cesgkBEXo3NFg/viewform?embedded=true';
const defaultCareerInterestFormUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLSeAOEvug7Zz9yYsNIQsXFM5rREZr3WMBbEVI0COmSVqYM6cKw/viewform?embedded=true';
const participationFormUrl =
  process.env.PARTICIPATION_FORM_URL?.trim() || defaultParticipationFormUrl;
const careerInterestFormUrl =
  process.env.CAREER_INTEREST_FORM_URL?.trim() || defaultCareerInterestFormUrl;
const contactEmail = process.env.CENTER_CONTACT_EMAIL ?? 'departmentchair@stanford.edu';

export const siteConfig = {
  name: 'NHLBI-AI Stanford Data Science Center',
  shortName: 'NHLBI-AI Stanford DSC',
  description:
    'The NHLBI-AI Stanford Data Science Center advances safe agentic AI, multimodal models, and reproducible research across large-scale biomedical data.',
  tagline: 'Agentic AI for biomedical discovery.',
  url: deploymentUrl,
  base: deploymentBase,
  institution: {
    name: 'Stanford University',
    url: 'https://www.stanford.edu/',
    parentUnit: 'Stanford University School of Medicine',
    locale: 'en-US',
    openGraphLocale: 'en_US',
    themeColor: '#8c1515',
    identityBar: true,
    globalFooter: true,
    copyright: '© Stanford University. Stanford, California 94305.',
    primaryLinks: [
      { label: 'Stanford Home', href: 'https://www.stanford.edu/' },
      { label: 'Maps & Directions', href: 'https://visit.stanford.edu/plan/' },
      { label: 'Search Stanford', href: 'https://www.stanford.edu/search/' },
      { label: 'Emergency Info', href: 'https://emergency.stanford.edu/' },
    ],
    policyLinks: [
      {
        label: 'Terms of Use',
        href: 'https://www.stanford.edu/site/terms/',
        title: 'Terms of use for sites',
      },
      {
        label: 'Privacy',
        href: 'https://www.stanford.edu/site/privacy/',
        title: 'Privacy and cookie policy',
      },
      {
        label: 'Copyright',
        href: 'https://uit.stanford.edu/security/copyright-infringement',
        title: 'Report alleged copyright infringement',
      },
      {
        label: 'Trademarks',
        href: 'https://adminguide.stanford.edu/chapter-1/subchapter-5/policy-1-5-4',
        title: 'Ownership and use of Stanford trademarks and images',
      },
      {
        label: 'Non-Discrimination',
        href: 'https://studentservices.stanford.edu/more-resources/student-policies/non-academic/non-discrimination',
        title: 'Non-discrimination policy',
      },
      {
        label: 'Accessibility',
        href: 'https://www.stanford.edu/site/accessibility',
        title: 'Report web accessibility issues',
      },
    ],
  },
  funder: {
    name: 'National Heart, Lung, and Blood Institute',
    shortName: 'NHLBI',
    url: 'https://www.nhlbi.nih.gov/',
  },
  initiative: {
    name: 'NHLBI-AI Enabled Precision Medicine Initiative',
    shortName: 'NHLBI-AI Initiative',
    url: 'https://nhlbi-ai.org/',
  },
  discovery: {
    indexing: true,
    aiSearch: true,
    aiTraining: false,
    defaultSocialImage: '/brand/social-preview.png',
    defaultSocialImageAlt:
      'NHLBI-AI Stanford Data Science Center: agentic AI for biomedical discovery.',
    favicon: '/favicon.svg',
    faviconPng: '/favicon-32x32.png',
    appleTouchIcon: '/apple-touch-icon.png',
    webManifest: '/site.webmanifest',
    organizationLogo: '/brand/mark.svg',
  },
  participation: {
    formUrl: participationFormUrl,
    contactEmail,
    contactProfileUrl: 'https://profiles.stanford.edu/euan-ashley',
  },
  careerInterest: {
    formUrl: careerInterestFormUrl,
    stanfordCareersUrl: 'https://careersearch.stanford.edu/',
  },
  navigation: [
    { label: 'Mission', href: '/#mission' },
    { label: 'Capabilities', href: '/#capabilities' },
    { label: 'Services', href: '/#services' },
    { label: 'Community', href: '/#community' },
    { label: 'Team', href: '/#team' },
    { label: 'Work with us', href: '/work-with-us/' },
    { label: 'Participate', href: '/participate/' },
  ],
};

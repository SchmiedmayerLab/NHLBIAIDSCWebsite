export type Aim = {
  id: string;
  icon: string;
  relatedToolId?: string;
  shortTitle: string;
  title: string;
  summary: string;
  deliverables: string[];
};

type InvestigatorDetails = {
  id: string;
  name: string;
  role: string;
  title: string;
  focus: string;
  profileUrl: string;
  portrait: {
    position: string;
    scale: number;
  };
};

type InvestigatorPortrait =
  { image: string; initials?: never } | { image?: never; initials: string };

export type Investigator = InvestigatorDetails & InvestigatorPortrait;

export type LinkedResource = {
  name: string;
  url: string;
  summary: string;
};

export const openSourceTools: (LinkedResource & { id: string })[] = [
  {
    id: 'heartwood',
    name: 'Heartwood',
    url: 'https://github.com/SchmiedmayerLab/heartwood',
    summary:
      'An open-source, auditable coding agent for biomedical research environments, with explicit project boundaries, review before execution, and verifiable session history.',
  },
];

export const nhlbiDataPrograms: LinkedResource[] = [
  {
    name: 'TOPMed',
    url: 'https://www.nhlbi.nih.gov/science/trans-omics-precision-medicine-topmed-program',
    summary: 'NHLBI program connecting genomic, omic, imaging, environmental, and clinical data.',
  },
  {
    name: 'MESA',
    url: 'https://www.nhlbi.nih.gov/science/multi-ethnic-study-atherosclerosis-mesa',
    summary: 'NHLBI cohort and TOPMed parent study with longitudinal cardiovascular data.',
  },
  {
    name: 'HeartShare',
    url: 'https://www.nhlbi.nih.gov/news/2022/accelerating-heart-failure-research',
    summary: 'NHLBI heart failure program combining phenotypes, images, and multi-omics.',
  },
  {
    name: 'AMP Heart Failure',
    url: 'https://www.nhlbi.nih.gov/science/accelerating-medicines-partnership-heart-failure-program-amp-hf',
    summary: 'Public-private program using HeartShare and other NHLBI resources to study HFpEF.',
  },
  {
    name: 'BioLINCC collections',
    url: 'https://www.nhlbi.nih.gov/science/biologic-specimen-and-data-repository-information-coordinating-center-biolincc',
    summary: 'NHLBI repository resources from population studies and clinical trials.',
  },
];

export const nhlbiDataAccess: LinkedResource[] = [
  {
    name: 'dbGaP',
    url: 'https://www.ncbi.nlm.nih.gov/gap/',
    summary: 'NIH system for requesting approved access to controlled genomic data.',
  },
  {
    name: 'BioData Catalyst',
    url: 'https://biodatacatalyst.nhlbi.nih.gov/',
    summary: 'NHLBI cloud ecosystem for finding, accessing, analyzing, and sharing data and tools.',
  },
];

export const biodataCatalystWorkspaces: LinkedResource[] = [
  {
    name: 'Terra',
    url: 'https://terra.biodatacatalyst.nhlbi.nih.gov/',
    summary: 'BioData Catalyst workspace hosted and operated by the Broad Institute.',
  },
  {
    name: 'Seven Bridges by Velsera',
    url: 'https://platform.sb.biodatacatalyst.nhlbi.nih.gov/',
    summary: 'BioData Catalyst workspace hosted and operated by Velsera.',
  },
];

export const aims: Aim[] = [
  {
    id: 'secure-compute',
    icon: 'secure',
    shortTitle: 'Secure compute',
    title: 'Interoperable, AI-ready research environments',
    summary:
      'Deliver reproducible environments for BioData Catalyst workspaces and other approved secure computing platforms, with portable containers, complete provenance, and safeguards for AI agents.',
    deliverables: ['Portable environments', 'Traceable analyses', 'Agent safeguards'],
  },
  {
    id: 'multimodal-ai',
    icon: 'multimodal',
    shortTitle: 'Multimodal AI',
    title: 'Models that connect data across modalities',
    summary:
      'Develop and evaluate reusable models that link imaging, physiological signals, clinical phenotypes, genomics, and proteomics across large cohorts.',
    deliverables: ['Multimodal models', 'Phenotyping pipelines', 'Shared benchmarks'],
  },
  {
    id: 'agentic-research',
    icon: 'agent',
    relatedToolId: 'heartwood',
    shortTitle: 'Agentic research',
    title: 'Guarded agents for reproducible discovery',
    summary:
      'Enable agents to plan, run, check, and document multi-step analyses within secure environments, then share validated workflows through a community hub.',
    deliverables: ['Agent workflow tools', 'Model and workflow hub', 'Training and support'],
  },
];

export const researcherServices = [
  {
    icon: 'plan',
    title: 'Shape the research plan',
    summary:
      'Match a scientific question with the right NHLBI data resource, access path, computing environment, models, and agentic workflow.',
  },
  {
    icon: 'build',
    title: 'Build and adapt',
    summary:
      'Start from maintained environments, containers, pipelines, model templates, and reference implementations.',
  },
  {
    icon: 'evaluate',
    title: 'Evaluate with confidence',
    summary:
      'Test models and agents across cohorts with common benchmarks, provenance, human review, and safety checks.',
  },
  {
    icon: 'share',
    title: 'Share, train, and reuse',
    summary:
      'Package validated models and workflows with documentation, training, and support for the wider community.',
  },
];

export const leadership: Investigator[] = [
  {
    id: 'euan-ashley',
    name: 'Euan A. Ashley, MB ChB, DPhil',
    role: 'Contact Principal Investigator',
    title: 'Professor of Medicine, Genetics, and Biomedical Data Science',
    focus: 'Center leadership and AI for cardiovascular medicine.',
    profileUrl: 'https://profiles.stanford.edu/euan-ashley',
    image: '/people/euan-ashley-stanford-medicine.jpg',
    portrait: { position: '52% 32%', scale: 1.42 },
  },
  {
    id: 'matthew-wheeler',
    name: 'Matthew T. Wheeler, MD, PhD',
    role: 'Multiple Principal Investigator',
    title: 'Associate Professor of Medicine',
    focus: 'Bioinformatics, secure infrastructure, and center operations.',
    profileUrl: 'https://profiles.stanford.edu/matthew-wheeler',
    image: '/people/matthew-wheeler.jpg',
    portrait: { position: '50% 30%', scale: 1.08 },
  },
  {
    id: 'james-zou',
    name: 'James Zou, PhD',
    role: 'Multiple Principal Investigator',
    title: 'Associate Professor of Biomedical Data Science',
    focus: 'Reliable agentic AI and biomedical machine learning.',
    profileUrl: 'https://profiles.stanford.edu/james-zou',
    image: '/people/james-zou.jpg',
    portrait: { position: '50% 30%', scale: 1 },
  },
];

export const coInvestigators: Investigator[] = [
  {
    id: 'bruna-gomes',
    name: 'Bruna Gomes, MD',
    role: 'Co-Investigator',
    title: 'Assistant Professor of Medicine and, by courtesy, of Biomedical Data Science',
    focus: 'AI for cardiovascular signals and imaging.',
    profileUrl: 'https://profiles.stanford.edu/bruna-filipa-gomes-botelho-quintas',
    image: '/people/bruna-gomes.jpg',
    portrait: { position: '50% 30%', scale: 1 },
  },
  {
    id: 'daniel-katz',
    name: 'Daniel H. Katz, MD',
    role: 'Co-Investigator',
    title: 'Assistant Professor of Medicine',
    focus: 'Multi-omic data pipelines and analysis.',
    profileUrl: 'https://profiles.stanford.edu/daniel-katz',
    image: '/people/daniel-katz.jpg',
    portrait: { position: '50% 32%', scale: 1 },
  },
  {
    id: 'jure-leskovec',
    name: 'Jure Leskovec, PhD',
    role: 'Co-Investigator',
    title: 'Professor of Computer Science',
    focus: 'Agentic systems, machine learning, and governance.',
    profileUrl: 'https://profiles.stanford.edu/jure-leskovec',
    image: '/people/jure-leskovec.jpg',
    portrait: { position: '50% 30%', scale: 1 },
  },
  {
    id: 'marco-perez',
    name: 'Marco Perez, MD',
    role: 'Co-Investigator',
    title: 'Associate Professor of Medicine',
    focus: 'Digital health data and cardiovascular model evaluation.',
    profileUrl: 'https://profiles.stanford.edu/marco-perez',
    image: '/people/marco-perez.jpg',
    portrait: { position: '50% 30%', scale: 1.08 },
  },
  {
    id: 'albert-rogers',
    name: 'Albert “A.J.” Rogers, MD, MBA, FAHA',
    role: 'Co-Investigator',
    title: 'Instructor of Medicine',
    focus: 'Machine learning for cardiovascular signals.',
    profileUrl: 'https://profiles.stanford.edu/rogersaj',
    image: '/people/albert-rogers.jpg',
    portrait: { position: '50% 30%', scale: 1.12 },
  },
  {
    id: 'ben-rogers',
    name: 'Ben Rogers, PhD',
    role: 'Co-Investigator',
    title: 'Executive Director, Stanford Research Computing',
    focus: 'Secure research computing and privacy.',
    profileUrl: 'https://srcc.stanford.edu/people/ben-rogers',
    image: '/people/ben-rogers.jpg',
    portrait: { position: '50% 30%', scale: 1 },
  },
  {
    id: 'paul-schmiedmayer',
    name: 'Paul Schmiedmayer, PhD',
    role: 'Co-Investigator',
    title: 'Instructor, Computational Medicine',
    focus: 'Open, interoperable agentic AI and multimodal AI models.',
    profileUrl: 'https://profiles.stanford.edu/schmiedmayer',
    image: '/people/paul-schmiedmayer.jpg',
    portrait: { position: '50% 30%', scale: 1 },
  },
  {
    id: 'holly-tabor',
    name: 'Holly Tabor, PhD',
    role: 'Co-Investigator',
    title: 'Professor of Medicine',
    focus: 'Ethics, safety, and participant engagement.',
    profileUrl: 'https://profiles.stanford.edu/holly-tabor',
    image: '/people/holly-tabor.jpg',
    portrait: { position: '50% 30%', scale: 1 },
  },
];

export const programManagement: Investigator[] = [
  {
    id: 'mia-levanto',
    name: 'Mia Levanto, BS',
    role: 'Program Manager',
    title: 'Clinical Research Coordinator, Cardiovascular Medicine',
    focus: 'Center operations and research coordination.',
    profileUrl: 'https://profiles.stanford.edu/mia-levanto',
    image: '/people/mia-levanto.jpg',
    portrait: { position: '50% 32%', scale: 1 },
  },
];

export const centerStaff: Investigator[] = [
  {
    id: 'david-jimenez-morales',
    name: 'David Jimenez-Morales, PhD',
    role: 'Researcher',
    title: 'Senior Research Scientist',
    focus: 'Reproducible multi-omics analysis and cloud-scale bioinformatics infrastructure.',
    profileUrl: 'https://profiles.stanford.edu/david-jimenez-morales',
    image: '/people/david-jimenez-morales.jpg',
    portrait: { position: '50% 32%', scale: 1.08 },
  },
  {
    id: 'nikolai-vetr',
    name: 'Nikolai G. Vetr, PhD',
    role: 'Researcher',
    title: 'Research Scientist',
    focus: 'Complex-trait genetics and multi-omic analysis of exercise.',
    profileUrl: 'https://profiles.stanford.edu/nikolai-vetr',
    initials: 'NV',
    portrait: { position: '50% 50%', scale: 1 },
  },
  {
    id: 'jimmy-zhen',
    name: 'Jimmy Zhen',
    role: 'Researcher',
    title: 'Software Developer',
    focus: 'Research interfaces and scalable software infrastructure for biomedical consortia.',
    profileUrl: 'https://med.stanford.edu/mattlab/our-team.html',
    image: '/people/jimmy-zhen.jpg',
    portrait: { position: '50% 36%', scale: 1.06 },
  },
];

export const investigators = [
  ...leadership,
  ...coInvestigators,
  ...programManagement,
  ...centerStaff,
];

export const workingGroups = [
  {
    icon: 'workflow',
    title: 'Agentic AI Workflows',
    summary:
      'Test agent-assisted workflows and define what must be logged, reviewed, and controlled.',
  },
  {
    icon: 'model',
    title: 'Foundation Models and Omics',
    summary: 'Set benchmarks for multimodal models and standardize analysis pipelines.',
  },
  {
    icon: 'governance',
    title: 'ELSI + Safety',
    summary:
      'Bring ethics, privacy, safety, and participant perspectives into design and evaluation.',
  },
];

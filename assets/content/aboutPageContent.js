export const aboutPageContent = {
  mission: {
    title: "Our mission is to open epilepsy science and share it for public & scientific collaboration.",
  },
  statsDescription:
    "The platform provides over 200,000 EEG recordings from diverse contexts including routine outpatient EEGs, critically ill patients, and epilepsy monitoring unit evaluations.",
  whatWeDo: {
    title: "What are we doing here at Epilepsy.Science?",
    textItems: [
      "Epilepsy.Science is a new cloud-based platform for managing, analyzing, publishing, and sharing scientific datasets to accelerate epilepsy research.",
      "Led by PennSieve and the Brain Data Science Platform (BDSP) and with support from the AWS Open Data Sponsorship Program, we are creating an unparalleled open data resource for the epilepsy community.",
    ],
  },
  missionDetails: {
    title: "Driving Progress is our Mission",
    subtitle:
      "We strive to understand, treat, and ultimately cure epilepsy through open access to multidimensional epilepsy data at scale. The platform provides over 200,000 EEG recordings from diverse contexts including routine outpatient EEGs, critically ill patients, and epilepsy monitoring unit evaluations.",
    additionalInfo:
      "As the platform grows, it will also include extensive accompanying clinical data like medications, imaging, genetics, and more from institutions worldwide.",
    introduction:
      "Researchers can use Epilepsy.Science to easily build customized cohorts by connecting data points across datasets.The platform enables scientists to publish -- at no cost -- high quality datasets for citation, reuse, and reproducible research.By promoting open science, Epilepsy.Science aims to accelerate discoveries and improve patient outcomes.",
    highlightsTitle: "This collaboration brings together:",
    highlights: [
      "PennSieve's scalable data management and sharing capabilities.",
      "BDSP's extensive data resources including over 200,000 EEG recordings.",
      "The AWS Open Data Sponsorship Program covers the cost of storage.",
      "Epilepsy.Science offers unprecedented opportunities for open, collaborative epilepsy research.",
    ],
    imageSrc: "https://images.ctfassets.net/erzgaqq17mnz/25miXcUrrPaHjdX0dJ4ce6/8efe96f5a3723a404f4a6a33dbb70d18/mission-details-image.png",
    footer: "Epilepsy.Science offers unprecedented opportunities for open, collaborative epilepsy research through its powerful data resources, analytics tools, and cloud-based platform."
  },
};

export const aboutCollaboratorsContent = {
  title: "This collaboration brings together",
  subtitle: "PennSieve + BDSP + AWS OpenData + PedQuest",
  cards: [
    {
      title: "PennSieve’s scalable data management and sharing capabilities and graph-based data integration model.",
      description:
        "The Pennsieve Data Management Platform provides a scalable cloud-based solution for managing, analyzing, and sharing scientific datasets. The platform enables graph based data and metadata integration, supporting meaningful curation of data in context. Using the platform, scientists can publish high quality datasets, cite, and make them available to the larger scientific community.",
      link: { text: "Explore PennSieve >", url: "https://discover.pennsieve.io/" }
    },
    {
      title: "BDSP’s extensive data resources includes over 200,000 EEG recordings and genetics, imaging, and clinical data.",
      description:
        "BDSP is a repository of freely-available brain research data, launched by the Clinical Data Animation Center at BIDMC.",
      link: { text: "Search the data >", url: "https://bdsp.io/" }
    },
    {
      title: "AWS Open Data Sponsorship Program",
      description:
        "The Amazon Web Services (AWS) Open Data Sponsorship Program covers the cost of storage for publicly available high-value cloud-optimized datasets.",
      link: { text: "Explore PennSieve >", url: "https://discover.pennsieve.io/" }
    },
    {
      title: "PedQuEST is a research and clinical practice work group dedicated to advancing brain-focused care of critically ill children using qEEG.",
      description:
        "PedQuEST is a research and clinical practice work group dedicated to advancing brain-focused care of critically ill children using qEEG.",
      link: { text: "Explore PedQuest >", url: "/about/collaborators/pedquest" }
    },
  ],
}
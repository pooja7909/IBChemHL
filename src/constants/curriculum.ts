export interface Topic {
  id: string;
  title: string;
  code: string;
  subtopics: string[];
}

export const IB_CURRICULUM: Topic[] = [
  {
    id: "s1",
    title: "Models of the particulate nature of matter",
    code: "Structure 1",
    subtopics: [
      "1.1 Introduction to the particulate nature of matter",
      "1.2 The nuclear atom",
      "1.3 Electron configurations",
      "1.4 Counting particles by mass: The mole",
      "1.5 Ideal gases"
    ]
  },
  {
    id: "s2",
    title: "Models of bonding and structure",
    code: "Structure 2",
    subtopics: [
      "2.1 The ionic model",
      "2.2 The covalent model",
      "2.3 The metallic model",
      "2.4 From models to materials"
    ]
  },
  {
    id: "s3",
    title: "Classification of matter",
    code: "Structure 3",
    subtopics: [
      "3.1 The periodic table",
      "3.2 Functional groups"
    ]
  },
  {
    id: "r1",
    title: "What drives chemical reactions?",
    code: "Reactivity 1",
    subtopics: [
      "1.1 Measuring enthalpy changes",
      "1.2 Energy cycles in reactions",
      "1.3 Energy from fuels",
      "1.4 Entropy and spontaneity (AHL)"
    ]
  }
];

export const STUDY_ROADMAP = [
  { week: 1, topicId: "s1", focus: "Stoichiometry & Atomic Structure", objective: "Master mole calculations and sub-shell configs." },
  { week: 2, topicId: "s2", focus: "Chemical Bonding", objective: "Differentiate between VSEPR shapes and hybridizations." },
  { week: 3, topicId: "s3", focus: "Periodicity & Organic Baselines", objective: "Understand periodic trends and group classifications." },
  { week: 4, topicId: "r1", focus: "Energetics / Thermochemistry", objective: "Solve Born-Haber cycles and Gibbs Free Energy problems." },
  { week: 5, topicId: "all", focus: "Exam Simulation", objective: "Full past paper practice with timing." }
];

// SHS Subjects Data
// Complete list of all subjects for Academic and Technical-Professional pathways

export interface Subject {
  code: string;
  name: string;
  units: number;
  description: string;
}

export interface Track {
  id: string;
  name: string;
  pathway: "academic" | "techpro";
  description: string;
  coreSubjects: Subject[];
  specializedSubjects: Subject[];
  totalUnits: number;
}

// ============================================================
// CORE SUBJECTS (All Pathways)
// ============================================================

export const coreSubjectsAcademic: Subject[] = [
  { code: "ENG11", name: "English for Academic Purposes", units: 3, description: "Reading, writing, speaking skills" },
  { code: "FIL11", name: "Filipino for Academic Purposes", units: 3, description: "Wikang Filipino communication" },
  { code: "MATH11", name: "General Mathematics", units: 3, description: "Algebra, geometry, statistics" },
  { code: "SCI11", name: "Earth and Life Science", units: 4, description: "Biology, ecology, earth science" },
  { code: "MAPEH11", name: "Music, Arts, PE, Health", units: 4, description: "Physical education & wellness" },
  { code: "COMP11", name: "Computer Studies", units: 3, description: "Basic IT and digital literacy" },
  { code: "HUMSS11", name: "Humanities & Social Sciences", units: 3, description: "History, culture, society" },
];

export const coreSubjectsTechPro: Subject[] = [
  { code: "ENG11", name: "English for Technical Purposes", units: 3, description: "Technical communication" },
  { code: "FIL11", name: "Filipino for Technical Purposes", units: 3, description: "Wikang Filipino" },
  { code: "MATH11", name: "Technical Mathematics", units: 3, description: "Applied mathematics" },
  { code: "SCI11", name: "Applied Science", units: 3, description: "Science applications" },
  { code: "MAPEH11", name: "Music, Arts, PE, Health", units: 4, description: "Physical education" },
  { code: "COMP11", name: "Computer Studies", units: 3, description: "IT fundamentals" },
  { code: "ETHICS11", name: "Work Ethics & Values", units: 2, description: "Professional ethics" },
];

// ============================================================
// STEM TRACK
// ============================================================

export const stemSubjects: Subject[] = [
  { code: "PHYS11", name: "Physics", units: 4, description: "Mechanics, waves, electricity" },
  { code: "CHEM11", name: "Chemistry", units: 4, description: "Atomic structure, reactions" },
  { code: "BIO11", name: "Biology", units: 4, description: "Cell biology, genetics" },
  { code: "PRECALC11", name: "Pre-Calculus", units: 3, description: "Advanced mathematics" },
  { code: "ENGR11", name: "Introduction to Engineering", units: 3, description: "Engineering principles" },
  { code: "PROG11", name: "Introduction to Programming", units: 3, description: "Basic coding concepts" },
];

// ============================================================
// HUMMS TRACK
// ============================================================

export const hummsSubjects: Subject[] = [
  { code: "HIST11", name: "Philippine History", units: 3, description: "National history & culture" },
  { code: "GEOG11", name: "Geography", units: 3, description: "Physical & human geography" },
  { code: "ECON11", name: "Economics", units: 3, description: "Microeconomics basics" },
  { code: "PSYCH11", name: "Psychology", units: 3, description: "Human behavior & development" },
  { code: "PHILO11", name: "Philosophy", units: 3, description: "Critical thinking & ethics" },
  { code: "ARTS11", name: "Visual Arts", units: 3, description: "Art appreciation & creation" },
];

// ============================================================
// ABM TRACK
// ============================================================

export const abmSubjects: Subject[] = [
  { code: "ACCT11", name: "Accounting 1", units: 3, description: "Basic accounting principles" },
  { code: "BUS11", name: "Business Management", units: 3, description: "Business operations" },
  { code: "ECON11", name: "Economics", units: 3, description: "Microeconomics" },
  { code: "ENTREP11", name: "Entrepreneurship", units: 3, description: "Business startup concepts" },
  { code: "FINANCE11", name: "Personal Finance", units: 3, description: "Money management" },
  { code: "MARKETING11", name: "Marketing", units: 3, description: "Marketing principles" },
];

// ============================================================
// GAS TRACK
// ============================================================

export const gasSubjects: Subject[] = [
  { code: "HIST11", name: "Philippine History", units: 3, description: "National history" },
  { code: "GEOG11", name: "Geography", units: 3, description: "World geography" },
  { code: "ECON11", name: "Economics", units: 3, description: "Basic economics" },
  { code: "PSYCH11", name: "Psychology", units: 3, description: "Human behavior" },
  { code: "PHYS11", name: "Physics", units: 3, description: "Basic physics" },
  { code: "CHEM11", name: "Chemistry", units: 3, description: "Basic chemistry" },
];

// ============================================================
// TVL - ICT SPECIALIZATION
// ============================================================

export const ictSubjects: Subject[] = [
  { code: "PROG11", name: "Programming 1", units: 4, description: "Web development basics" },
  { code: "NETW11", name: "Networking Basics", units: 3, description: "Network fundamentals" },
  { code: "HARD11", name: "Hardware Maintenance", units: 3, description: "Computer hardware" },
  { code: "SOFT11", name: "Software Applications", units: 3, description: "Office & design software" },
  { code: "CYBSEC11", name: "Cybersecurity Basics", units: 3, description: "Information security" },
  { code: "ICTPROJ11", name: "ICT Project", units: 3, description: "Capstone project" },
];

// ============================================================
// TVL - AUTOMOTIVE SPECIALIZATION
// ============================================================

export const automotiveSubjects: Subject[] = [
  { code: "AUTO11", name: "Automotive Technology 1", units: 4, description: "Engine systems" },
  { code: "AUTOELEC11", name: "Automotive Electrical", units: 3, description: "Electrical systems" },
  { code: "AUTODIAG11", name: "Automotive Diagnostics", units: 3, description: "Troubleshooting" },
  { code: "AUTOMAINT11", name: "Vehicle Maintenance", units: 3, description: "Maintenance procedures" },
  { code: "AUTOSAFETY11", name: "Automotive Safety", units: 2, description: "Safety standards" },
  { code: "AUTOPROJ11", name: "Automotive Project", units: 3, description: "Capstone project" },
];

// ============================================================
// TVL - CULINARY ARTS SPECIALIZATION
// ============================================================

export const culinarySubjects: Subject[] = [
  { code: "COOK11", name: "Culinary Fundamentals", units: 4, description: "Basic cooking techniques" },
  { code: "BAKE11", name: "Baking & Pastry", units: 3, description: "Baking techniques" },
  { code: "FOOD11", name: "Food Safety & Sanitation", units: 2, description: "Health & safety" },
  { code: "MENU11", name: "Menu Planning", units: 3, description: "Meal planning" },
  { code: "SERV11", name: "Food Service", units: 3, description: "Restaurant operations" },
  { code: "COOKPROJ11", name: "Culinary Project", units: 3, description: "Capstone project" },
];

// ============================================================
// TVL - HOSPITALITY SPECIALIZATION
// ============================================================

export const hospitalitySubjects: Subject[] = [
  { code: "HOSP11", name: "Hospitality Management", units: 4, description: "Hotel operations" },
  { code: "FRONT11", name: "Front Office Operations", units: 3, description: "Reception & booking" },
  { code: "HOUSE11", name: "Housekeeping Operations", units: 3, description: "Room management" },
  { code: "CUST11", name: "Customer Service", units: 3, description: "Guest relations" },
  { code: "EVENT11", name: "Event Management", units: 3, description: "Event planning" },
  { code: "HOSPPROJ11", name: "Hospitality Project", units: 3, description: "Capstone project" },
];

// ============================================================
// TVL - ELECTRICAL INSTALLATION SPECIALIZATION
// ============================================================

export const electricalSubjects: Subject[] = [
  { code: "ELEC11", name: "Electrical Installation 1", units: 4, description: "Wiring & circuits" },
  { code: "ELECSAFETY11", name: "Electrical Safety", units: 2, description: "Safety standards" },
  { code: "ELECTOOLS11", name: "Electrical Tools & Equipment", units: 3, description: "Tool usage" },
  { code: "ELECDIAG11", name: "Electrical Diagnostics", units: 3, description: "Troubleshooting" },
  { code: "ELECCODE11", name: "Electrical Code", units: 2, description: "Building codes" },
  { code: "ELECPROJ11", name: "Electrical Project", units: 3, description: "Capstone project" },
];

// ============================================================
// TVL - WELDING SPECIALIZATION
// ============================================================

export const weldingSubjects: Subject[] = [
  { code: "WELD11", name: "Welding Fundamentals", units: 4, description: "Welding techniques" },
  { code: "METAL11", name: "Metalworking", units: 3, description: "Metal fabrication" },
  { code: "WELDSAFETY11", name: "Welding Safety", units: 2, description: "Safety procedures" },
  { code: "WELDINS11", name: "Weld Inspection", units: 3, description: "Quality control" },
  { code: "WELDDESIGN11", name: "Metal Design", units: 3, description: "Design principles" },
  { code: "WELDPROJ11", name: "Welding Project", units: 3, description: "Capstone project" },
];

// ============================================================
// TRACKS CONFIGURATION
// ============================================================

export const academicTracks: Track[] = [
  {
    id: "stem",
    name: "STEM",
    pathway: "academic",
    description: "Science, Technology, Engineering, Mathematics",
    coreSubjects: coreSubjectsAcademic,
    specializedSubjects: stemSubjects,
    totalUnits: 44,
  },
  {
    id: "humms",
    name: "HUMMS",
    pathway: "academic",
    description: "Humanities, Social Sciences, Arts",
    coreSubjects: coreSubjectsAcademic,
    specializedSubjects: hummsSubjects,
    totalUnits: 41,
  },
  {
    id: "abm",
    name: "ABM",
    pathway: "academic",
    description: "Accountancy, Business, Management",
    coreSubjects: coreSubjectsAcademic,
    specializedSubjects: abmSubjects,
    totalUnits: 41,
  },
  {
    id: "gas",
    name: "GAS",
    pathway: "academic",
    description: "General Academic Strand",
    coreSubjects: coreSubjectsAcademic,
    specializedSubjects: gasSubjects,
    totalUnits: 41,
  },
];

export const techproTracks: Track[] = [
  {
    id: "ict",
    name: "ICT",
    pathway: "techpro",
    description: "Information & Communication Technology",
    coreSubjects: coreSubjectsTechPro,
    specializedSubjects: ictSubjects,
    totalUnits: 40,
  },
  {
    id: "automotive",
    name: "Automotive",
    pathway: "techpro",
    description: "Automotive Technology",
    coreSubjects: coreSubjectsTechPro,
    specializedSubjects: automotiveSubjects,
    totalUnits: 39,
  },
  {
    id: "culinary",
    name: "Culinary Arts",
    pathway: "techpro",
    description: "Culinary Arts & Food Service",
    coreSubjects: coreSubjectsTechPro,
    specializedSubjects: culinarySubjects,
    totalUnits: 39,
  },
  {
    id: "hospitality",
    name: "Hospitality",
    pathway: "techpro",
    description: "Hospitality & Tourism",
    coreSubjects: coreSubjectsTechPro,
    specializedSubjects: hospitalitySubjects,
    totalUnits: 40,
  },
  {
    id: "electrical",
    name: "Electrical Installation",
    pathway: "techpro",
    description: "Electrical Installation & Maintenance",
    coreSubjects: coreSubjectsTechPro,
    specializedSubjects: electricalSubjects,
    totalUnits: 38,
  },
  {
    id: "welding",
    name: "Welding",
    pathway: "techpro",
    description: "Welding & Metal Fabrication",
    coreSubjects: coreSubjectsTechPro,
    specializedSubjects: weldingSubjects,
    totalUnits: 39,
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getTrackByPathway(pathway: string): Track[] {
  if (pathway === "academic") return academicTracks;
  if (pathway === "techpro") return techproTracks;
  return [];
}

export function getTrackById(trackId: string): Track | undefined {
  const allTracks = [...academicTracks, ...techproTracks];
  return allTracks.find(t => t.id === trackId);
}

export function getSubjectsByTrack(trackId: string): Subject[] {
  const track = getTrackById(trackId);
  if (!track) return [];
  return [...track.coreSubjects, ...track.specializedSubjects];
}

export function getTotalUnits(trackId: string): number {
  const track = getTrackById(trackId);
  return track?.totalUnits || 0;
}

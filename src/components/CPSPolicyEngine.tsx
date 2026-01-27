import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { CourtListenerSearch } from './CourtListenerSearch';
import { CourtListenerGuide } from './CourtListenerGuide';
import { 
  Search, 
  Book, 
  Scale, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  ExternalLink,
  Download,
  BookOpen,
  Gavel,
  Shield,
  Clock,
  MapPin,
  Filter,
  ArrowRight,
  Info
} from 'lucide-react';

interface PolicyEngineProps {
  userState: string;
  violations: any;
  onViolationFound?: (violation: string, reference: string) => void;
}

interface StatePolicy {
  state: string;
  manualUrl: string;
  lastUpdated: string;
  keyRegulations: Regulation[];
  timelines: Timeline[];
  specificViolations: ViolationType[];
  courtRules: CourtRule[];
  resources: Resource[];
}

interface Regulation {
  id: string;
  title: string;
  citation: string;
  category: string;
  summary: string;
  fullText: string;
  relatedViolations: string[];
  penalties: string;
  exceptions: string[];
}

interface Timeline {
  event: string;
  deadline: string;
  citation: string;
  consequences: string;
}

interface ViolationType {
  id: string;
  name: string;
  category: string;
  description: string;
  legalBasis: string[];
  remedies: string[];
  caselaw: string[];
}

interface CourtRule {
  rule: string;
  description: string;
  citation: string;
}

interface Resource {
  name: string;
  type: string;
  url: string;
  description: string;
}

// Comprehensive state-specific data
const STATE_POLICIES: Record<string, StatePolicy> = {
  'California': {
    state: 'California',
    manualUrl: 'https://www.cdss.ca.gov/inforesources/child-welfare',
    lastUpdated: '2024-11',
    keyRegulations: [
      {
        id: 'ca-wic-300',
        title: 'Grounds for Jurisdiction',
        citation: 'Cal. Welf. & Inst. Code § 300',
        category: 'Jurisdiction',
        summary: 'Defines when juvenile court may take jurisdiction over a child.',
        fullText: 'A child comes within the jurisdiction of the juvenile court if: (a) The child has suffered, or there is substantial risk of serious physical harm inflicted nonaccidentally; (b) Sexual abuse; (c) Mental suffering; (d) Failure to protect; (e) Severe physical abuse to sibling; (f) Death of another child due to abuse; (g) Left without provision for support; (h) Freed for adoption; (i) Cruelty; (j) Abuse of sibling.',
        relatedViolations: ['fourthAmendment', 'fourteenthAmendment', 'noPhysicalEvidence'],
        penalties: 'Removal of child, reunification services required',
        exceptions: ['Reasonable discipline', 'Religious practices', 'Financial inability alone']
      },
      {
        id: 'ca-wic-361',
        title: 'Removal Requirements',
        citation: 'Cal. Welf. & Inst. Code § 361',
        category: 'Removal',
        summary: 'Clear and convincing evidence required for removal; reasonable efforts mandatory.',
        fullText: 'A dependent child shall not be taken from the physical custody of parents unless: (1) Substantial danger to physical health, safety, protection, or physical or emotional well-being; (2) No reasonable means to protect without removal; (3) Reasonable efforts were made to prevent removal.',
        relatedViolations: ['noReasonableEfforts', 'noSafetyPlan', 'fourteenthAmendment'],
        penalties: 'Improper removal subject to appeal',
        exceptions: ['Immediate danger', 'Previous removals', 'Sexual abuse']
      },
      {
        id: 'ca-wic-16501',
        title: 'Reasonable Efforts Required',
        citation: 'Cal. Welf. & Inst. Code § 16501',
        category: 'Services',
        summary: 'Agency must make active efforts to prevent removal and facilitate reunification.',
        fullText: 'Reasonable efforts means the exercise of due diligence by the county welfare department to use appropriate and available services to meet the needs of the child and the family.',
        relatedViolations: ['noReasonableEfforts', 'noServicesOffered', 'inadequateCasePlan'],
        penalties: 'Case dismissal, immediate return of child',
        exceptions: ['Aggravated circumstances under WIC 361.5(b)']
      },
      {
        id: 'ca-wic-361.5',
        title: 'Reunification Services',
        citation: 'Cal. Welf. & Inst. Code § 361.5',
        category: 'Services',
        summary: 'Parents entitled to reunification services unless specific exceptions apply.',
        fullText: 'Family reunification services shall be provided to parents unless court finds by clear and convincing evidence specified circumstances under subsection (b), including severe sexual abuse, torture, murder of sibling, previous termination of parental rights.',
        relatedViolations: ['noServicesOffered', 'inadequateCasePlan', 'noReasonableEfforts'],
        penalties: 'Must provide services, extend timeline',
        exceptions: ['Murder of another child', 'Torture', 'Severe sexual abuse', 'Prior TPR']
      },
      {
        id: 'ca-wic-16507',
        title: 'Relative Placement Preference',
        citation: 'Cal. Welf. & Inst. Code § 16507',
        category: 'Placement',
        summary: 'Preferential consideration must be given to relatives for placement.',
        fullText: 'When a child is removed, the county shall search for, identify, and provide information to all adult relatives within 30 days of removal.',
        relatedViolations: ['noRelativePlacement', 'inappropriatePlacement', 'separatedSiblings'],
        penalties: 'Change of placement, damages',
        exceptions: ['Relative not suitable', 'Safety concerns', 'Geographic impracticality']
      }
    ],
    timelines: [
      {
        event: 'Initial Hearing (Detention)',
        deadline: 'Next judicial day after removal',
        citation: 'Cal. Welf. & Inst. Code § 315',
        consequences: 'Child must be returned if hearing not held'
      },
      {
        event: 'Jurisdictional Hearing',
        deadline: '15 court days (if detained)',
        citation: 'Cal. Welf. & Inst. Code § 334',
        consequences: 'Child must be returned if not held timely'
      },
      {
        event: 'Dispositional Hearing',
        deadline: '10 court days after jurisdiction',
        citation: 'Cal. Welf. & Inst. Code § 358',
        consequences: 'Services delayed, case timeline extended'
      },
      {
        event: '6-Month Review',
        deadline: '6 months from dispositional',
        citation: 'Cal. Welf. & Inst. Code § 366.21(e)',
        consequences: 'Return child or extend services'
      },
      {
        event: '12-Month Review',
        deadline: '12 months from child entering care',
        citation: 'Cal. Welf. & Inst. Code § 366.21(f)',
        consequences: 'Must return, extend, or set 366.26'
      },
      {
        event: '18-Month Permanency',
        deadline: '18 months from removal',
        citation: 'Cal. Welf. & Inst. Code § 366.22',
        consequences: 'Return, adoption, guardianship, or APPLA'
      }
    ],
    specificViolations: [
      {
        id: 'ca-no-warrant-entry',
        name: 'Warrantless Home Entry',
        category: 'Constitutional',
        description: 'CPS entered home without warrant, consent, or exigent circumstances',
        legalBasis: ['4th Amendment U.S. Constitution', 'People v. Ramey (1976) 16 Cal.3d 263'],
        remedies: ['Motion to suppress evidence', 'Motion to dismiss', '§1983 civil rights action'],
        caselaw: [
          'Calabretta v. Floyd (9th Cir. 1999) - Prior parental consent required',
          'Rogers v. County of San Joaquin (9th Cir. 2017) - Exigency required',
          'Wallis v. Spencer (9th Cir. 1999) - Anonymous tip insufficient'
        ]
      },
      {
        id: 'ca-asfa-timeline',
        name: 'ASFA Timeline Violation',
        category: 'Procedural',
        description: 'Child in care beyond 15 of 22 months without permanency plan',
        legalBasis: ['42 U.S.C. § 675(5)(C)', 'Cal. Welf. & Inst. Code § 366.21'],
        remedies: ['Immediate return', 'Extraordinary case extension', 'Writ petition'],
        caselaw: [
          'In re Marilyn H. (1993) - Reasonable services required',
          'In re Aryanna C. (2005) - Timeline strictly enforced'
        ]
      },
      {
        id: 'ca-icwa-violation',
        name: 'ICWA Notice Failure',
        category: 'Procedural',
        description: 'Failed to inquire about or notify tribes of Indian heritage',
        legalBasis: ['25 U.S.C. § 1912', 'Cal. Welf. & Inst. Code § 224.2'],
        remedies: ['Case reversal', 'New trial', 'Tribe intervention'],
        caselaw: [
          'In re Isaiah W. (2016) - Strict compliance required',
          'In re H.A. (2002) - Notice defects require reversal'
        ]
      }
    ],
    courtRules: [
      {
        rule: 'Cal. Rules of Court, Rule 5.668',
        description: 'Requirements for detention hearing',
        citation: 'Must find prima facie case for detention'
      },
      {
        rule: 'Cal. Rules of Court, Rule 5.695',
        description: 'Reasonable efforts findings required',
        citation: 'Court must make specific findings on record'
      }
    ],
    resources: [
      {
        name: 'California Child Welfare Policy Manual',
        type: 'Manual',
        url: 'https://www.cdss.ca.gov/inforesources/child-welfare',
        description: 'Official state CPS policies and procedures'
      },
      {
        name: 'Judicial Council Forms',
        type: 'Forms',
        url: 'https://www.courts.ca.gov/forms.htm',
        description: 'Official court forms for dependency cases'
      }
    ]
  },
  
  'Texas': {
    state: 'Texas',
    manualUrl: 'https://www.dfps.texas.gov/handbooks/',
    lastUpdated: '2024-11',
    keyRegulations: [
      {
        id: 'tx-fam-262.104',
        title: 'Emergency Removal Without Court Order',
        citation: 'Tex. Fam. Code § 262.104',
        category: 'Removal',
        summary: 'Child may be removed without court order only in immediate danger.',
        fullText: 'Emergency removal authorized only when: (1) Immediate danger to physical health or safety; (2) Imminent risk of sexual abuse or trafficking; (3) Parent is using controlled substance causing impairment.',
        relatedViolations: ['fourthAmendment', 'noReasonableEfforts', 'improperInvestigation'],
        penalties: 'Immediate return, damages under §1983',
        exceptions: ['Clear imminent danger', 'No time to get order']
      },
      {
        id: 'tx-fam-263.306',
        title: 'Permanency Hearing Timeline',
        citation: 'Tex. Fam. Code § 263.306',
        category: 'Timeline',
        summary: 'Dismissal required if child in DFPS care 12 months without final order.',
        fullText: 'Court shall dismiss suit and order return of child if trial on merits not completed within 12 months of filing, unless extraordinary circumstances.',
        relatedViolations: ['missedDeadlines', 'noReasonableEfforts'],
        penalties: 'Mandatory dismissal and return',
        exceptions: ['Court finds extraordinary circumstances', 'Only one 180-day extension allowed']
      },
      {
        id: 'tx-fam-262.201',
        title: 'Adversary Hearing Required',
        citation: 'Tex. Fam. Code § 262.201',
        category: 'Due Process',
        summary: 'Full adversary hearing required within 14 days of emergency removal.',
        fullText: 'Not later than 14th day after removal, court shall hold full adversary hearing and render temporary orders. Parent has right to present evidence.',
        relatedViolations: ['fourteenthAmendment', 'deniedLegalCounsel', 'noWrittenNotice'],
        penalties: 'Return of child if hearing not timely held',
        exceptions: ['Parent agrees to extension', 'Cannot locate parent']
      }
    ],
    timelines: [
      {
        event: 'Emergency Removal Hearing',
        deadline: 'Next business day (1 day)',
        citation: 'Tex. Fam. Code § 262.108',
        consequences: 'Child must be returned immediately'
      },
      {
        event: 'Adversary Hearing',
        deadline: '14 days from removal',
        citation: 'Tex. Fam. Code § 262.201',
        consequences: 'Immediate return of child required'
      },
      {
        event: 'Status Hearing',
        deadline: 'Every 90 days',
        citation: 'Tex. Fam. Code § 263.201',
        consequences: 'Case review, service plan updates'
      },
      {
        event: 'Final Order (Dismissal Deadline)',
        deadline: '12 months from filing',
        citation: 'Tex. Fam. Code § 263.401',
        consequences: 'Mandatory dismissal unless extraordinary circumstances'
      }
    ],
    specificViolations: [
      {
        id: 'tx-12-month-rule',
        name: '12-Month Dismissal Rule Violation',
        category: 'Procedural',
        description: 'Child in care beyond 12 months without final order',
        legalBasis: ['Tex. Fam. Code § 263.401', 'In re J.O.A. (2004)'],
        remedies: ['Motion to dismiss', 'Immediate return of child'],
        caselaw: [
          'In re J.O.A. (2004) - Dismissal mandatory absent extraordinary circumstances',
          'In re J.F.C. (2017) - Extension limited to 180 days'
        ]
      }
    ],
    courtRules: [],
    resources: [
      {
        name: 'Texas DFPS Child Protective Services Handbook',
        type: 'Manual',
        url: 'https://www.dfps.texas.gov/handbooks/CPS/',
        description: 'Official CPS investigation and case management policies'
      }
    ]
  },

  'New York': {
    state: 'New York',
    manualUrl: 'https://ocfs.ny.gov/programs/cps/',
    lastUpdated: '2024-11',
    keyRegulations: [
      {
        id: 'ny-fca-1022',
        title: 'Initial Appearance',
        citation: 'N.Y. Fam. Ct. Act § 1022',
        category: 'Due Process',
        summary: 'Initial appearance must be held promptly, usually within 24 hours.',
        fullText: 'Upon filing of petition, court shall issue summons requiring appearance of parent. If child removed, initial appearance shall be held same or next day.',
        relatedViolations: ['fourteenthAmendment', 'noWrittenNotice'],
        penalties: 'Return of child',
        exceptions: ['Emergency circumstances', 'Cannot locate parent']
      },
      {
        id: 'ny-fca-1027',
        title: 'Right to Counsel',
        citation: 'N.Y. Fam. Ct. Act § 1027',
        category: 'Rights',
        summary: 'Parents have absolute right to appointed counsel in abuse/neglect proceedings.',
        fullText: 'Respondent shall have right to counsel at proceeding. Court shall advise of right and shall assign counsel if unable to afford counsel.',
        relatedViolations: ['deniedLegalCounsel', 'fourteenthAmendment'],
        penalties: 'Reversal of orders, new hearing',
        exceptions: ['Knowing and intelligent waiver']
      },
      {
        id: 'ny-ssl-384-b',
        title: 'Reasonable Efforts',
        citation: 'N.Y. Soc. Serv. Law § 384-b',
        category: 'Services',
        summary: 'Reasonable efforts required to prevent removal and facilitate reunification.',
        fullText: 'Agency shall make reasonable efforts to prevent or eliminate need for removal. If removal necessary, reasonable efforts shall be made to make it possible for child to return home.',
        relatedViolations: ['noReasonableEfforts', 'noServicesOffered'],
        penalties: 'Return of child, extension of services',
        exceptions: ['Aggravated circumstances', 'Prior termination of parental rights']
      }
    ],
    timelines: [
      {
        event: 'Initial Appearance',
        deadline: 'Same or next day after removal',
        citation: 'N.Y. Fam. Ct. Act § 1022',
        consequences: 'Child must be returned'
      },
      {
        event: 'Fact-Finding Hearing',
        deadline: '14 days (if detained)',
        citation: 'N.Y. Fam. Ct. Act § 1037',
        consequences: 'Child returned if not held timely'
      },
      {
        event: 'Permanency Hearing',
        deadline: '8 months from removal',
        citation: 'N.Y. Fam. Ct. Act § 1089',
        consequences: 'Case plan review, reunification decision'
      }
    ],
    specificViolations: [],
    courtRules: [],
    resources: [
      {
        name: 'New York OCFS Child Protective Services Manual',
        type: 'Manual',
        url: 'https://ocfs.ny.gov/programs/cps/policies/',
        description: 'Official policies and procedures for CPS investigations'
      }
    ]
  },

  'Florida': {
    state: 'Florida',
    manualUrl: 'https://www.myflfamilies.com/service-programs/child-family-well-being/child-welfare/',
    lastUpdated: '2024-11',
    keyRegulations: [
      {
        id: 'fl-stat-39.401',
        title: 'Taking Child into Custody',
        citation: 'Fla. Stat. § 39.401',
        category: 'Removal',
        summary: 'Child may be taken into custody only with court order or in emergency.',
        fullText: 'Authorized person may take child into custody without court order when: (1) There are reasonable grounds to believe child is suffering from imminent danger; (2) Probable cause of abuse, abandonment, or neglect and immediate removal necessary.',
        relatedViolations: ['fourthAmendment', 'noReasonableEfforts'],
        penalties: 'Suppression of evidence, return of child',
        exceptions: ['Imminent danger', 'No time to secure court order']
      },
      {
        id: 'fl-stat-39.521',
        title: 'Disposition Hearing',
        citation: 'Fla. Stat. § 39.521',
        category: 'Timeline',
        summary: 'Disposition must be held within 30 days of adjudication.',
        fullText: 'Court shall hold disposition hearing within 30 days of adjudication or plea. Court shall determine whether child should be returned home or placed in out-of-home care.',
        relatedViolations: ['missedDeadlines', 'fourteenthAmendment'],
        penalties: 'Dismissal possible',
        exceptions: ['Good cause shown']
      }
    ],
    timelines: [
      {
        event: 'Shelter Hearing',
        deadline: '24 hours (excluding weekends/holidays)',
        citation: 'Fla. Stat. § 39.402',
        consequences: 'Child must be released'
      },
      {
        event: 'Arraignment Hearing',
        deadline: '28 days from shelter hearing',
        citation: 'Fla. Stat. § 39.506',
        consequences: 'Petition dismissed'
      },
      {
        event: 'Adjudicatory Hearing',
        deadline: '30 days from arraignment (if detained)',
        citation: 'Fla. Stat. § 39.508',
        consequences: 'Child released'
      }
    ],
    specificViolations: [],
    courtRules: [],
    resources: []
  },

  'Illinois': {
    state: 'Illinois',
    manualUrl: 'https://www2.illinois.gov/dcfs/aboutus/notices/Pages/default.aspx',
    lastUpdated: '2024-11',
    keyRegulations: [
      {
        id: 'il-705-405-2-4',
        title: 'Temporary Custody Hearing',
        citation: '705 ILCS 405/2-4',
        category: 'Due Process',
        summary: 'Temporary custody hearing must be held within 48 hours of removal.',
        fullText: 'When minor is placed in shelter care, court shall hold temporary custody hearing within 48 hours (excluding weekends and holidays) to determine whether minor should remain in custody.',
        relatedViolations: ['fourteenthAmendment', 'missedDeadlines'],
        penalties: 'Immediate release of minor',
        exceptions: ['Weekends and court holidays excluded']
      },
      {
        id: 'il-705-405-2-10',
        title: 'Adjudicatory Hearing Timeline',
        citation: '705 ILCS 405/2-10',
        category: 'Timeline',
        summary: 'Adjudication must commence within 90 days of petition filing.',
        fullText: 'Court shall commence adjudicatory hearing within 90 days of filing of petition unless continued for good cause.',
        relatedViolations: ['missedDeadlines', 'fourteenthAmendment'],
        penalties: 'Dismissal of petition',
        exceptions: ['Good cause shown', 'Parent requests continuance']
      }
    ],
    timelines: [
      {
        event: 'Temporary Custody Hearing',
        deadline: '48 hours (excluding weekends/holidays)',
        citation: '705 ILCS 405/2-4',
        consequences: 'Minor must be released'
      },
      {
        event: 'Adjudicatory Hearing',
        deadline: '90 days from petition',
        citation: '705 ILCS 405/2-10',
        consequences: 'Petition dismissed'
      }
    ],
    specificViolations: [],
    courtRules: [],
    resources: []
  }
};

// Add abbreviated data for remaining states
const ADDITIONAL_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'Colorado', 'Connecticut',
  'Delaware', 'Georgia', 'Hawaii', 'Idaho', 'Indiana', 'Iowa', 'Kansas',
  'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
];

// Add placeholder data for remaining states
ADDITIONAL_STATES.forEach(state => {
  if (!STATE_POLICIES[state]) {
    STATE_POLICIES[state] = {
      state,
      manualUrl: `https://www.childwelfare.gov/organizations/?CWIGFunctionsaction=rols:main.dspList&rolType=Custom&RS_ID=${state}`,
      lastUpdated: '2024-11',
      keyRegulations: [
        {
          id: `${state.toLowerCase()}-general`,
          title: 'General CPS Authority',
          citation: 'See state-specific child welfare statutes',
          category: 'General',
          summary: 'State child protective services laws and regulations.',
          fullText: 'Refer to state-specific child welfare manual and statutes.',
          relatedViolations: [],
          penalties: 'Varies by violation',
          exceptions: []
        }
      ],
      timelines: [],
      specificViolations: [],
      courtRules: [],
      resources: [
        {
          name: `${state} Child Welfare Services`,
          type: 'Manual',
          url: `https://www.childwelfare.gov/organizations/?CWIGFunctionsaction=rols:main.dspList&rolType=Custom&RS_ID=${state}`,
          description: `${state} state CPS policies and procedures`
        }
      ]
    };
  }
});

export function CPSPolicyEngine({ userState, violations, onViolationFound }: PolicyEngineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState(userState || 'California');

  const stateData = STATE_POLICIES[selectedState] || STATE_POLICIES['California'];

  // Search and filter logic
  const filteredRegulations = useMemo(() => {
    let results = stateData.keyRegulations;

    if (selectedCategory !== 'all') {
      results = results.filter(r => r.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.summary.toLowerCase().includes(query) ||
        r.citation.toLowerCase().includes(query) ||
        r.fullText.toLowerCase().includes(query)
      );
    }

    return results;
  }, [stateData, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(stateData.keyRegulations.map(r => r.category));
    return ['all', ...Array.from(cats)];
  }, [stateData]);

  // Cross-reference violations with regulations
  const violationCrossReferences = useMemo(() => {
    const refs: Record<string, Regulation[]> = {};
    
    Object.keys(violations).forEach(violationKey => {
      if (violations[violationKey]) {
        refs[violationKey] = stateData.keyRegulations.filter(reg =>
          reg.relatedViolations.includes(violationKey)
        );
      }
    });

    return refs;
  }, [violations, stateData]);

  const activeViolationCount = Object.values(violations).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="flex items-center gap-2">
          <Book className="size-6" />
          CPS Manual & Policy Engine
        </h2>
        <p className="text-muted-foreground mt-2">
          Search state-specific CPS regulations, timelines, and cross-reference with your violations
        </p>
      </div>

      {/* State Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-5" />
            Select State
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Object.keys(STATE_POLICIES).sort().map(state => (
              <Button
                key={state}
                variant={selectedState === state ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedState(state)}
                className="justify-start"
              >
                {state}
              </Button>
            ))}
          </div>
          
          <Alert className="mt-4">
            <AlertCircle className="size-4" />
            <AlertDescription>
              <strong>{selectedState}</strong> selected. Showing regulations and policies for {selectedState}.
              <br />
              <span className="text-xs">Last updated: {stateData.lastUpdated}</span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Violation Cross-Reference Alert */}
      {activeViolationCount > 0 && (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            <strong>{activeViolationCount} violation(s)</strong> detected in your case. 
            See cross-references below to find relevant {selectedState} regulations.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="regulations" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="regulations">
            <Scale className="size-4 mr-2" />
            Regulations
          </TabsTrigger>
          <TabsTrigger value="timelines">
            <Clock className="size-4 mr-2" />
            Timelines
          </TabsTrigger>
          <TabsTrigger value="violations">
            <AlertCircle className="size-4 mr-2" />
            Violations
          </TabsTrigger>
          <TabsTrigger value="cross-ref">
            <Shield className="size-4 mr-2" />
            Cross-Ref
          </TabsTrigger>
          <TabsTrigger value="caselaw">
            <Gavel className="size-4 mr-2" />
            Case Law
          </TabsTrigger>
          <TabsTrigger value="resources">
            <BookOpen className="size-4 mr-2" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* REGULATIONS TAB */}
        <TabsContent value="regulations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Regulations</CardTitle>
              <CardDescription>
                Search {selectedState} CPS regulations, statutes, and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search regulations, citations, keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </Button>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Category:</span>
                {categories.map(cat => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>

              <Separator />

              {/* Results */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {filteredRegulations.length} regulation(s) found
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="size-4 mr-2" />
                    Export Results
                  </Button>
                </div>

                <ScrollArea className="h-[600px]">
                  <div className="space-y-4 pr-4">
                    {filteredRegulations.map(reg => (
                      <Card key={reg.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{reg.title}</CardTitle>
                              <CardDescription className="mt-1">
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  {reg.citation}
                                </code>
                                <Badge variant="secondary" className="ml-2">
                                  {reg.category}
                                </Badge>
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="font-medium text-sm mb-1">Summary:</p>
                            <p className="text-sm text-muted-foreground">{reg.summary}</p>
                          </div>

                          <div>
                            <p className="font-medium text-sm mb-1">Full Text:</p>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                              {reg.fullText}
                            </p>
                          </div>

                          {reg.relatedViolations.length > 0 && (
                            <div>
                              <p className="font-medium text-sm mb-2">Related Violations:</p>
                              <div className="flex flex-wrap gap-2">
                                {reg.relatedViolations.map(v => (
                                  <Badge 
                                    key={v} 
                                    variant={violations[v] ? 'destructive' : 'outline'}
                                  >
                                    {violations[v] && <CheckCircle className="size-3 mr-1" />}
                                    {v.replace(/([A-Z])/g, ' $1').trim()}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="font-medium text-sm mb-1">Penalties for Violation:</p>
                            <p className="text-sm text-muted-foreground">{reg.penalties}</p>
                          </div>

                          {reg.exceptions.length > 0 && (
                            <div>
                              <p className="font-medium text-sm mb-1">Exceptions:</p>
                              <ul className="text-sm text-muted-foreground list-disc list-inside">
                                {reg.exceptions.map((ex, idx) => (
                                  <li key={idx}>{ex}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TIMELINES TAB */}
        <TabsContent value="timelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                {selectedState} CPS Case Timelines
              </CardTitle>
              <CardDescription>
                Critical deadlines and timeline requirements in {selectedState} CPS cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertCircle className="size-4" />
                <AlertDescription>
                  Missing these deadlines can result in case dismissal or immediate return of children.
                  Track your timeline in the Timeline tab.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {stateData.timelines.map((timeline, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary text-primary-foreground rounded-full size-10 flex items-center justify-center font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{timeline.event}</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="destructive">{timeline.deadline}</Badge>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {timeline.citation}
                              </code>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <strong>Consequences:</strong> {timeline.consequences}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VIOLATIONS TAB */}
        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="size-5" />
                {selectedState}-Specific Violations
              </CardTitle>
              <CardDescription>
                Common violations in {selectedState} CPS cases with legal basis and remedies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stateData.specificViolations.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    State-specific violations are being compiled for {selectedState}. 
                    Check the general Violations tab for common violation types.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {stateData.specificViolations.map(violation => (
                    <Card key={violation.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{violation.name}</CardTitle>
                        <CardDescription>
                          <Badge>{violation.category}</Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="font-medium text-sm mb-1">Description:</p>
                          <p className="text-sm text-muted-foreground">{violation.description}</p>
                        </div>

                        <div>
                          <p className="font-medium text-sm mb-2">Legal Basis:</p>
                          <div className="space-y-1">
                            {violation.legalBasis.map((basis, idx) => (
                              <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                <ArrowRight className="size-3" />
                                <code className="bg-muted px-2 py-1 rounded text-xs">{basis}</code>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="font-medium text-sm mb-2">Available Remedies:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            {violation.remedies.map((remedy, idx) => (
                              <li key={idx}>{remedy}</li>
                            ))}
                          </ul>
                        </div>

                        {violation.caselaw.length > 0 && (
                          <div>
                            <p className="font-medium text-sm mb-2">Relevant Case Law:</p>
                            <div className="space-y-2">
                              {violation.caselaw.map((caseItem, idx) => (
                                <div key={idx} className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                  {caseItem}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button
                          size="sm"
                          onClick={() => onViolationFound?.(violation.id, violation.name)}
                        >
                          <CheckCircle className="size-4 mr-2" />
                          Mark This Violation in My Case
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CROSS-REFERENCE TAB */}
        <TabsContent value="cross-ref" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5" />
                Your Violations × {selectedState} Regulations
              </CardTitle>
              <CardDescription>
                Cross-reference your identified violations with applicable {selectedState} laws
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeViolationCount === 0 ? (
                <Alert>
                  <AlertDescription>
                    No violations checked yet. Go to the Violations tab to identify violations in your case,
                    then return here to see relevant {selectedState} regulations.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {Object.entries(violationCrossReferences).map(([violationKey, regulations]) => (
                    regulations.length > 0 && (
                      <div key={violationKey}>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="destructive" className="text-sm">
                            {violationKey.replace(/([A-Z])/g, ' $1').trim()}
                          </Badge>
                          <ArrowRight className="size-4" />
                          <span className="text-sm text-muted-foreground">
                            {regulations.length} regulation(s) found
                          </span>
                        </div>

                        <div className="space-y-3 ml-4 border-l-2 border-muted pl-4">
                          {regulations.map(reg => (
                            <Card key={reg.id}>
                              <CardHeader>
                                <CardTitle className="text-base">{reg.title}</CardTitle>
                                <CardDescription>
                                  <code className="text-xs">{reg.citation}</code>
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <p className="text-sm text-muted-foreground">{reg.summary}</p>
                                <div>
                                  <p className="text-sm font-medium">What You Can Do:</p>
                                  <p className="text-sm text-muted-foreground">{reg.penalties}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CASE LAW TAB */}
        <TabsContent value="caselaw">
          <CourtListenerSearch 
            userState={selectedState}
            violations={violations}
          />
          <CourtListenerGuide />
        </TabsContent>

        {/* RESOURCES TAB */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5" />
                {selectedState} CPS Resources
              </CardTitle>
              <CardDescription>
                Official manuals, forms, and resources for {selectedState}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Official Manual */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <FileText className="size-8 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">Official {selectedState} CPS Manual</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Complete policies and procedures used by CPS workers in {selectedState}
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <a href={stateData.manualUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="size-4 mr-2" />
                            View Official Manual
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Resources */}
                {stateData.resources.map((resource, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <BookOpen className="size-6 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{resource.name}</h3>
                          <Badge variant="secondary" className="mb-2">{resource.type}</Badge>
                          <p className="text-sm text-muted-foreground mb-3">
                            {resource.description}
                          </p>
                          <Button variant="outline" size="sm" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="size-4 mr-2" />
                              Access Resource
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Court Rules */}
                {stateData.courtRules.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Gavel className="size-5" />
                      Court Rules
                    </h3>
                    <div className="space-y-2">
                      {stateData.courtRules.map((rule, idx) => (
                        <Card key={idx}>
                          <CardContent className="pt-4">
                            <code className="text-sm font-medium">{rule.rule}</code>
                            <p className="text-sm text-muted-foreground mt-2">{rule.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Legal Disclaimer */}
      <Alert>
        <AlertCircle className="size-4" />
        <AlertDescription className="text-xs">
          <strong>Legal Information Notice:</strong> This policy engine provides legal information about {selectedState} 
          CPS regulations. It is NOT legal advice. Laws change frequently. Always consult with a licensed attorney in {selectedState} 
          about your specific case. Do not rely solely on this information for legal decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
}
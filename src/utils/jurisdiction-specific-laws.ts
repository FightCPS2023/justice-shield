/**
 * Jurisdiction-Specific CPS Laws Database
 * 
 * State-by-state CPS statutes, standards, timelines, and procedures
 * for sophisticated jurisdiction-aware legal analysis.
 */

// ============================================================================
// STATE-SPECIFIC CPS LAWS
// ============================================================================

export interface StateRemovalLaw {
  statute: string;
  standard: string;
  whoCanRemove: string[];
  timeForHearing: string;
  warrantRequired: boolean;
  exigencyException: boolean;
}

export interface StateAdjudicationLaw {
  statute: string;
  standardOfProof: 'preponderance' | 'clear and convincing' | 'beyond reasonable doubt';
  timelineRequirements: string;
  definitions: {
    abuse: string;
    neglect: string;
    dependency: string;
  };
}

export interface StateTerminationLaw {
  statute: string;
  standardOfProof: 'clear and convincing' | 'beyond reasonable doubt';
  grounds: string[];
  bestInterestRequired: boolean;
  timelineASFA: string;
}

export interface StateSpecificLaws {
  state: string;
  removal: StateRemovalLaw;
  adjudication: StateAdjudicationLaw;
  termination: StateTerminationLaw;
  rightToCounsel: {
    dependency: boolean;
    termination: boolean;
    statute?: string;
  };
  reasonableEfforts: {
    statute: string;
    preRemovalRequired: boolean;
    exceptions: string[];
  };
  visitationRights: {
    statute?: string;
    minimumRequired: boolean;
    restrictions: string;
  };
  kinshipPreference: {
    statute?: string;
    mandatory: boolean;
    priority: string[];
  };
  appealRights: {
    timeframe: string;
    interlocutoryAppeals: boolean;
  };
  specialProvisions?: string[];
}

// ============================================================================
// COMPREHENSIVE STATE DATABASE
// ============================================================================

export const STATE_CPS_LAWS: Record<string, StateSpecificLaws> = {
  
  // MISSISSIPPI
  mississippi: {
    state: 'Mississippi',
    removal: {
      statute: 'Miss. Code Ann. § 43-21-301',
      standard: 'Immediate and urgent necessity to protect child',
      whoCanRemove: ['Law enforcement', 'CPS with court approval', 'Medical personnel in emergencies'],
      timeForHearing: '72 hours excluding weekends and holidays',
      warrantRequired: false,
      exigencyException: true
    },
    adjudication: {
      statute: 'Miss. Code Ann. § 43-21-303',
      standardOfProof: 'clear and convincing',
      timelineRequirements: 'Adjudicatory hearing within reasonable time after petition filed',
      definitions: {
        abuse: 'Intentional harm or threat of harm to child\'s health or welfare through non-accidental injury, sexual abuse/exploitation, or negligent treatment',
        neglect: 'Negligent treatment or maltreatment including failure to provide adequate food, clothing, shelter, medical care, or supervision',
        dependency: 'Child without proper care, custody, or support; or child in custody of person unfit by reason of cruelty, mental incapacity, immorality or depravity'
      }
    },
    termination: {
      statute: 'Miss. Code Ann. § 93-15-103 to 93-15-119',
      standardOfProof: 'clear and convincing',
      grounds: [
        'Abandonment',
        'Chronic abuse or neglect',
        'Parent mental illness or deficiency unlikely to change',
        'Imprisonment interfering with parenting',
        'Substantial and continuous neglect',
        'Parent fault or refusal to adjust',
        'Termination in child\'s best interest'
      ],
      bestInterestRequired: true,
      timelineASFA: '15 of 22 months, but Mississippi requires best interest finding separate from grounds'
    },
    rightToCounsel: {
      dependency: true,
      termination: true,
      statute: 'Miss. Code Ann. § 43-21-201'
    },
    reasonableEfforts: {
      statute: 'Miss. Code Ann. § 43-15-13',
      preRemovalRequired: true,
      exceptions: [
        'Aggravated circumstances',
        'Parent previously terminated on another child',
        'Parent caused serious bodily injury',
        'Parent murdered/manslaughtered another child'
      ]
    },
    visitationRights: {
      statute: 'Miss. Code Ann. § 43-15-13(2)',
      minimumRequired: true,
      restrictions: 'Court must order visitation unless contrary to child safety; minimum of monthly contact required'
    },
    kinshipPreference: {
      statute: 'Miss. Code Ann. § 43-15-13',
      mandatory: true,
      priority: ['Relative placement', 'Placement with person significant relationship to child', 'Other appropriate placement']
    },
    appealRights: {
      timeframe: '30 days from final order',
      interlocutoryAppeals: true
    },
    specialProvisions: [
      'Grandparent visitation rights under separate statute',
      'Post-adoption contact agreements permitted',
      'Aggravated circumstances include torture, chronic abuse, sexual abuse'
    ]
  },

  // CALIFORNIA
  california: {
    state: 'California',
    removal: {
      statute: 'Cal. Welf. & Inst. Code § 305-306',
      standard: 'Immediate danger to child or substantial risk if returned home',
      whoCanRemove: ['Peace officer', 'Social worker', 'Physician/surgeon'],
      timeForHearing: 'Next judicial day after taken into custody (typically within 48 hours)',
      warrantRequired: false,
      exigencyException: true
    },
    adjudication: {
      statute: 'Cal. Welf. & Inst. Code § 300',
      standardOfProof: 'preponderance',
      timelineRequirements: 'Jurisdictional hearing within 30 days of detention; dispositional hearing combined or separate',
      definitions: {
        abuse: 'Physical injury inflicted by other than accidental means; sexual abuse; willful cruelty or unjustifiable punishment',
        neglect: 'Failure to protect from severe physical harm; failure to provide adequate food, clothing, shelter, medical treatment; willful failure to provide support',
        dependency: 'Child who is a person described in § 300 (various grounds including abuse, neglect, abandonment, etc.)'
      }
    },
    termination: {
      statute: 'Cal. Welf. & Inst. Code § 366.26',
      standardOfProof: 'clear and convincing',
      grounds: [
        'Parent abandoned child',
        'Parent failed to reunify within time limits',
        'Parent convicted of serious felony',
        'Parent caused death or serious injury to another child',
        'Child has been in care 15 of 22 months',
        'Parent severe substance abuse'
      ],
      bestInterestRequired: true,
      timelineASFA: '12 month reunification period (18 months for children under 3); permanency hearing at 12 months'
    },
    rightToCounsel: {
      dependency: true,
      termination: true,
      statute: 'Cal. Welf. & Inst. Code § 317'
    },
    reasonableEfforts: {
      statute: 'Cal. Welf. & Inst. Code § 361.5',
      preRemovalRequired: true,
      exceptions: [
        'Parent caused death of another child',
        'Parent subjected child to severe physical harm',
        'Parent has history of extensive, abusive, chronic use of drugs or alcohol and resisted treatment',
        'Parent terminated on sibling',
        'Child under 3 subjected to severe physical harm by parent'
      ]
    },
    visitationRights: {
      statute: 'Cal. Welf. & Inst. Code § 362.1',
      minimumRequired: true,
      restrictions: 'Visitation shall be as frequent as possible, consistent with child well-being'
    },
    kinshipPreference: {
      statute: 'Cal. Welf. & Inst. Code § 361.3',
      mandatory: true,
      priority: [
        'Placement with relative receives preferential consideration',
        'Must consider relative placement before non-relative',
        'Relative defined broadly to include extended family members'
      ]
    },
    appealRights: {
      timeframe: '60 days from notice of order (writ review in some circumstances)',
      interlocutoryAppeals: true
    },
    specialProvisions: [
      'California has writ review process for certain orders',
      'ICWA-plus protections for Native American children',
      'Psychotropic medication restrictions for foster children',
      'De facto parent status allows certain non-parents to participate'
    ]
  },

  // TEXAS
  texas: {
    state: 'Texas',
    removal: {
      statute: 'Tex. Fam. Code § 262.101-262.116',
      standard: 'Immediate danger to physical health or safety OR victim of sexual abuse AND removal is necessary to protect child',
      whoCanRemove: ['Law enforcement', 'Juvenile probation officer with agreement of CPS'],
      timeForHearing: 'No later than first working day after removal (adversarial hearing within 14 days)',
      warrantRequired: true,
      exigencyException: true
    },
    adjudication: {
      statute: 'Tex. Fam. Code § 262.201',
      standardOfProof: 'preponderance',
      timelineRequirements: 'Status hearing within 60 days; final order within 12 months (with 6-month extensions)',
      definitions: {
        abuse: 'Mental, emotional injury to child resulting in observable impairment; causing/permitting physical injury; failure to make reasonable effort to prevent sexual conduct; compelling/encouraging sexual conduct or deviate sexual intercourse',
        neglect: 'Placing child in/failing to remove from situations that substantial risk of physical/emotional harm; failure to seek/provide medical care; leaving child in situation that substantial risk of harm',
        dependency: 'Child without parental care or support'
      }
    },
    termination: {
      statute: 'Tex. Fam. Code § 161.001',
      standardOfProof: 'clear and convincing',
      grounds: [
        'Voluntary relinquishment',
        'Parent knowingly placed/allowed child in conditions endangering physical/emotional well-being',
        'Engaged in conduct/knowingly placed child with persons who engaged in conduct endangering child',
        'Parent convicted of various offenses',
        'Constructive abandonment (failed to comply with court order for one year)',
        'Parent unable to provide child with minimum standard of care due to mental/emotional illness or deficiency',
        'Parent used controlled substance in a manner that endangered child'
      ],
      bestInterestRequired: true,
      timelineASFA: 'Texas has own timeline - typically 12 months for final order, with possible 6-month extensions'
    },
    rightToCounsel: {
      dependency: true,
      termination: true,
      statute: 'Tex. Fam. Code § 107.013'
    },
    reasonableEfforts: {
      statute: 'Tex. Fam. Code § 262.2015',
      preRemovalRequired: true,
      exceptions: [
        'Return of child likely to result in further abuse/neglect',
        'Parent subjected child to aggravated circumstances',
        'Parent is registered sex offender',
        'Parent violated conditions of court order regarding child',
        'Parent failed to comply with court-ordered services'
      ]
    },
    visitationRights: {
      statute: 'Tex. Fam. Code § 263.106',
      minimumRequired: true,
      restrictions: 'Court shall order reasonable visitation unless visitation would endanger child; at least monthly contact required'
    },
    kinshipPreference: {
      statute: 'Tex. Fam. Code § 261.307',
      mandatory: false,
      priority: [
        'Preference for relative placement when appropriate',
        'CPS must search for relatives',
        'Relative notification required'
      ]
    },
    appealRights: {
      timeframe: '30 days from final order; accelerated appeals in some cases',
      interlocutoryAppeals: true
    },
    specialProvisions: [
      'Texas has strict timelines (dismissal at 12 months unless extension)',
      'Parent must be offered Family Service Plan',
      'Court can appoint amicus attorney in addition to guardian ad litem',
      'Parent can request jury trial on some issues'
    ]
  },

  // FLORIDA
  florida: {
    state: 'Florida',
    removal: {
      statute: 'Fla. Stat. § 39.401',
      standard: 'Probable cause that child has been abandoned, abused, or neglected OR child is in imminent danger',
      whoCanRemove: ['Law enforcement', 'Authorized agent of DCF'],
      timeForHearing: 'Within 24 hours (shelter hearing)',
      warrantRequired: false,
      exigencyException: true
    },
    adjudication: {
      statute: 'Fla. Stat. § 39.507',
      standardOfProof: 'preponderance',
      timelineRequirements: 'Arraignment within 28 days; adjudicatory hearing within 30 days of arraignment',
      definitions: {
        abuse: 'Intentional infliction of physical or mental injury; intentional act that could reasonably result in injury; active encouragement of any person to commit act that results in injury; sexual battery, exploitation, or harm',
        neglect: 'Failure or omission to provide child with care, supervision, and services necessary to maintain physical and mental health; failure to make reasonable effort to protect child from abuse/neglect by another; failure of caregiver to make reasonable effort to provide necessary treatment',
        dependency: 'Child has been abandoned; environment is injurious to welfare; child is suffering from ongoing abuse/neglect; parent/caregiver materially violated case plan'
      }
    },
    termination: {
      statute: 'Fla. Stat. § 39.806',
      standardOfProof: 'clear and convincing',
      grounds: [
        'Voluntary surrender',
        'Abandonment',
        'Chronic abuse',
        'Sexual battery',
        'Imprisonment',
        'Egregious conduct (murder, manslaughter, aiding suicide of another child)',
        'Termination of parental rights on sibling',
        'Failure to substantially comply with case plan',
        'Parent incapacitated due to substance abuse'
      ],
      bestInterestRequired: true,
      timelineASFA: '12 months from child entering care; permanency hearing at 12 months'
    },
    rightToCounsel: {
      dependency: true,
      termination: true,
      statute: 'Fla. Stat. § 39.013(9)'
    },
    reasonableEfforts: {
      statute: 'Fla. Stat. § 39.521',
      preRemovalRequired: true,
      exceptions: [
        'Parent caused death or serious bodily injury to child or another child',
        'Parental rights to sibling terminated involuntarily',
        'Child was abandoned',
        'Parent committed sexual battery or sex offense involving child',
        'Parent\'s rights to sibling terminated and parent failed to substantially comply with case plan'
      ]
    },
    visitationRights: {
      statute: 'Fla. Stat. § 39.0139',
      minimumRequired: true,
      restrictions: 'Parent entitled to regular contact unless court finds visitation contrary to child welfare'
    },
    kinshipPreference: {
      statute: 'Fla. Stat. § 39.5085',
      mandatory: true,
      priority: [
        'Relative or fictive kin placement prioritized',
        'DCF must search for relatives',
        'Relative must be considered before non-relative placement'
      ]
    },
    appealRights: {
      timeframe: '30 days from final order',
      interlocutoryAppeals: true
    },
    specialProvisions: [
      'Florida has judicial review hearings every 6 months',
      'Case plan must include projected timeline',
      'Guardian ad litem program is robust',
      'Parent can request mediation'
    ]
  },

  // NEW YORK
  newYork: {
    state: 'New York',
    removal: {
      statute: 'N.Y. Fam. Ct. Act § 1024',
      standard: 'Immediate and substantial danger to child',
      whoCanRemove: ['Peace officer', 'CPS with court order', 'Any person with court order'],
      timeForHearing: 'Next court day (initial hearing); probable cause hearing within 3 days',
      warrantRequired: true,
      exigencyException: true
    },
    adjudication: {
      statute: 'N.Y. Fam. Ct. Act § 1046',
      standardOfProof: 'preponderance',
      timelineRequirements: 'Fact-finding hearing within 60 days of initial appearance; dispositional hearing separate',
      definitions: {
        abuse: 'Parent inflicts or allows infliction of physical injury by other than accidental means which causes substantial risk of death, serious/protracted disfigurement, protracted impairment, or loss of bodily organ; creates substantial risk of such injury; commits sex offense against child',
        neglect: 'Failure to provide minimum degree of care in supplying adequate food, clothing, shelter, education, medical care; abandonment; allowing child to engage in conduct harmful to child',
        dependency: 'Not used in New York; only abuse and neglect petitions'
      }
    },
    termination: {
      statute: 'N.Y. Soc. Serv. Law § 384-b',
      standardOfProof: 'clear and convincing',
      grounds: [
        'Permanent neglect (agency made diligent efforts; parent failed to plan for child\'s future despite assistance)',
        'Severe abuse',
        'Repeated abuse',
        'Mental illness (unable to provide care; condition unlikely to improve)',
        'Mental retardation or developmental disability (unable to provide care)',
        'Abandonment'
      ],
      bestInterestRequired: true,
      timelineASFA: 'New York uses "permanency hearing" at 8 months; concurrent planning required'
    },
    rightToCounsel: {
      dependency: true,
      termination: true,
      statute: 'N.Y. Fam. Ct. Act § 262'
    },
    reasonableEfforts: {
      statute: 'N.Y. Soc. Serv. Law § 358-a',
      preRemovalRequired: true,
      exceptions: [
        'Aggravated circumstances',
        'Parent previously involuntarily terminated on another child',
        'Parent committed murder/manslaughter of another child',
        'Severe or repeated abuse'
      ]
    },
    visitationRights: {
      statute: 'N.Y. Soc. Serv. Law § 384-b(7)(f)',
      minimumRequired: true,
      restrictions: 'Regular and meaningful contact required unless contrary to child best interests'
    },
    kinshipPreference: {
      statute: 'N.Y. Soc. Serv. Law § 383-c',
      mandatory: true,
      priority: [
        'Relative placement given preference',
        'Must conduct relative search within 30 days',
        'Kinship guardianship assistance program available'
      ]
    },
    appealRights: {
      timeframe: '30 days from final order',
      interlocutoryAppeals: false
    },
    specialProvisions: [
      'New York has strong focus on preventive services',
      'Kinship guardianship subsidies available',
      'Court may order genetic testing',
      'Permanency hearings required every 6 months after initial permanency hearing'
    ]
  }
};

// ============================================================================
// HELPER FUNCTIONS FOR JURISDICTION-SPECIFIC ANALYSIS
// ============================================================================

/**
 * Get state-specific removal laws
 */
export function getRemovalLawsForState(state: string): StateRemovalLaw | null {
  const stateLaws = STATE_CPS_LAWS[state.toLowerCase().replace(/\s/g, '')];
  return stateLaws?.removal || null;
}

/**
 * Get state-specific adjudication laws
 */
export function getAdjudicationLawsForState(state: string): StateAdjudicationLaw | null {
  const stateLaws = STATE_CPS_LAWS[state.toLowerCase().replace(/\s/g, '')];
  return stateLaws?.adjudication || null;
}

/**
 * Get state-specific termination laws
 */
export function getTerminationLawsForState(state: string): StateTerminationLaw | null {
  const stateLaws = STATE_CPS_LAWS[state.toLowerCase().replace(/\s/g, '')];
  return stateLaws?.termination || null;
}

/**
 * Check if removal hearing timeline was violated
 */
export function checkRemovalHearingTimeline(
  state: string,
  removalDate: Date,
  hearingDate: Date
): {
  compliant: boolean;
  requiredTimeline: string;
  actualTimeline: string;
  violation: boolean;
} {
  const removalLaws = getRemovalLawsForState(state);
  if (!removalLaws) {
    return {
      compliant: false,
      requiredTimeline: 'Unknown',
      actualTimeline: 'Unknown',
      violation: false
    };
  }

  const hoursDiff = (hearingDate.getTime() - removalDate.getTime()) / (1000 * 60 * 60);
  const requiredHours = removalLaws.timeForHearing.includes('24') ? 24 : 
                       removalLaws.timeForHearing.includes('48') ? 48 :
                       removalLaws.timeForHearing.includes('72') ? 72 : 0;

  return {
    compliant: hoursDiff <= requiredHours,
    requiredTimeline: removalLaws.timeForHearing,
    actualTimeline: `${Math.round(hoursDiff)} hours`,
    violation: hoursDiff > requiredHours
  };
}

/**
 * Analyze whether state law was violated
 */
export function analyzeStateLawCompliance(
  state: string,
  violationType: 'removal' | 'adjudication' | 'termination' | 'reasonable_efforts',
  facts: any
): {
  lawCited: string;
  violation: boolean;
  analysis: string;
  remedies: string[];
} {
  const stateLaws = STATE_CPS_LAWS[state.toLowerCase().replace(/\s/g, '')];
  
  if (!stateLaws) {
    return {
      lawCited: 'Unknown',
      violation: false,
      analysis: `State law for ${state} not in database. General federal law applies.`,
      remedies: []
    };
  }

  let lawCited = '';
  let violation = false;
  let analysis = '';
  let remedies: string[] = [];

  switch (violationType) {
    case 'removal':
      lawCited = stateLaws.removal.statute;
      analysis = `${state} requires: ${stateLaws.removal.standard}. `;
      analysis += `Hearing must occur within ${stateLaws.removal.timeForHearing}. `;
      analysis += stateLaws.removal.warrantRequired ? 'Warrant generally required unless exigent circumstances. ' : 'Warrant not required for emergency removal. ';
      
      if (facts.noHearingWithinTimeline) {
        violation = true;
        analysis += '\n\nVIOLATION: Hearing was not held within required timeline. This violates state law and constitutional due process.';
        remedies.push('File emergency motion to enforce hearing timeline');
        remedies.push('Object on record to timeline violation');
        remedies.push('Motion to dismiss for failure to comply with statutory requirements');
      }
      break;

    case 'adjudication':
      lawCited = stateLaws.adjudication.statute;
      analysis = `${state} uses ${stateLaws.adjudication.standardOfProof} evidence standard for adjudication. `;
      analysis += `Timeline: ${stateLaws.adjudication.timelineRequirements}.`;
      
      if (facts.wrongStandard) {
        violation = true;
        analysis += `\n\nVIOLATION: Wrong standard of proof applied. ${state} requires ${stateLaws.adjudication.standardOfProof} evidence.`;
        remedies.push('Object to incorrect burden of proof');
        remedies.push('Request jury instruction on correct standard');
        remedies.push('Raise on appeal if adjudication entered');
      }
      break;

    case 'termination':
      lawCited = stateLaws.termination.statute;
      analysis = `${state} requires ${stateLaws.termination.standardOfProof} evidence for termination. `;
      analysis += `Grounds for termination in ${state}:\n${stateLaws.termination.grounds.map((g, i) => `${i + 1}. ${g}`).join('\n')}`;
      
      if (stateLaws.termination.bestInterestRequired) {
        analysis += `\n\n${state} requires separate finding that termination is in child's best interest.`;
      }
      break;

    case 'reasonable_efforts':
      lawCited = stateLaws.reasonableEfforts.statute;
      analysis = `${state} requires reasonable efforts ${stateLaws.reasonableEfforts.preRemovalRequired ? 'before and after removal' : 'after removal'}. `;
      analysis += `\n\nExceptions in ${state}:\n${stateLaws.reasonableEfforts.exceptions.map((e, i) => `${i + 1}. ${e}`).join('\n')}`;
      
      if (facts.noServicesOffered && stateLaws.reasonableEfforts.preRemovalRequired) {
        violation = true;
        analysis += '\n\nVIOLATION: No services offered before removal and no exception applies.';
        remedies.push('Challenge reasonable efforts finding');
        remedies.push('Request specific services');
        remedies.push('File motion to compel reasonable efforts');
      }
      break;
  }

  return {
    lawCited,
    violation,
    analysis,
    remedies
  };
}

/**
 * Get all applicable laws for a state
 */
export function getCompleteLegalFramework(state: string): StateSpecificLaws | null {
  return STATE_CPS_LAWS[state.toLowerCase().replace(/\s/g, '')] || null;
}

/**
 * Compare laws across multiple states (for interstate cases)
 */
export function compareStateLaws(states: string[]): any {
  const comparison: any = {};
  
  states.forEach(state => {
    const laws = getCompleteLegalFramework(state);
    if (laws) {
      comparison[state] = {
        removalStandard: laws.removal.standard,
        adjudicationStandard: laws.adjudication.standardOfProof,
        terminationStandard: laws.termination.standardOfProof,
        rightToCounsel: laws.rightToCounsel,
        kinshipMandatory: laws.kinshipPreference.mandatory
      };
    }
  });

  return comparison;
}

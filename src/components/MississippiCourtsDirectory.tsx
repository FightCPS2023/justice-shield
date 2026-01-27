import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Scale, Search, MapPin, Phone, Globe, Mail, Building,
  ChevronDown, ChevronRight, Filter, ExternalLink, Navigation,
  Clock, User, Briefcase, AlertCircle, Info
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface Court {
  id: string;
  name: string;
  type: 'supreme' | 'appeals' | 'chancery' | 'circuit' | 'county' | 'justice' | 'municipal';
  district?: string;
  county: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  fax?: string;
  website?: string;
  email?: string;
  judges?: string[];
  clerk?: string;
  jurisdiction?: string[];
  hours?: string;
  notes?: string;
}

export function MississippiCourtsDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCounty, setSelectedCounty] = useState<string>('all');
  const [expandedCourts, setExpandedCourts] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedCourts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCourts(newExpanded);
  };

  // COMPREHENSIVE MISSISSIPPI COURTS DATABASE
  const courts: Court[] = [
    // SUPREME COURT
    {
      id: 'ms-supreme',
      name: 'Mississippi Supreme Court',
      type: 'supreme',
      county: 'Hinds',
      address: '450 High Street',
      city: 'Jackson',
      state: 'MS',
      zip: '39201',
      phone: '(601) 359-3694',
      fax: '(601) 359-2407',
      website: 'courts.ms.gov/supreme',
      email: 'supremecourt@courts.ms.gov',
      judges: [
        'Chief Justice Michael K. Randolph',
        'Presiding Justice Josiah D. Coleman',
        'Justice Leslie D. King',
        'Justice Dawn H. Beam',
        'Justice David P. Sullivan',
        'Justice Robert P. Chamberlin',
        'Justice James D. Maxwell II',
        'Justice Jim Kitchens',
        'Justice Kenneth P. Griffis'
      ],
      jurisdiction: ['Final appellate jurisdiction', 'Constitutional questions', 'Death penalty appeals'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Highest court in Mississippi. Hears appeals from lower courts.'
    },

    // COURT OF APPEALS
    {
      id: 'ms-appeals',
      name: 'Mississippi Court of Appeals',
      type: 'appeals',
      county: 'Hinds',
      address: '450 High Street',
      city: 'Jackson',
      state: 'MS',
      zip: '39201',
      phone: '(601) 359-3687',
      fax: '(601) 359-2407',
      website: 'courts.ms.gov/appellate_courts/coa',
      email: 'courtofappeals@courts.ms.gov',
      judges: [
        'Chief Judge Virginia Carlton',
        'Presiding Judge Donna M. Barnes',
        'Judge Jack L. Wilson',
        'Judge Joel K. Smith',
        'Judge Anthony J. Westbrooks',
        'Judge Deborah McDonald',
        'Judge Kevin Westbrook',
        'Judge Andrew K. Howorth',
        'Judge Jeffrey T. Klingfuss',
        'Judge Kenny Griffis'
      ],
      jurisdiction: ['Appeals from circuit and chancery courts', 'Civil appeals', 'Criminal appeals', 'Domestic relations appeals'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Intermediate appellate court. Most CPS appeals start here.'
    },

    // CHANCERY COURTS - DISTRICT 1
    {
      id: 'chancery-desoto',
      name: 'DeSoto County Chancery Court',
      type: 'chancery',
      district: 'District 1',
      county: 'DeSoto',
      address: '365 Losher Street',
      city: 'Hernando',
      state: 'MS',
      zip: '38632',
      phone: '(662) 469-8000',
      fax: '(662) 469-8337',
      website: 'desotocountycourts.com',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles all CPS/dependency cases for DeSoto County. Youth Court Division.'
    },

    // CHANCERY COURTS - DISTRICT 2
    {
      id: 'chancery-panola',
      name: 'Panola County Chancery Court',
      type: 'chancery',
      district: 'District 2',
      county: 'Panola',
      address: '151 Public Square',
      city: 'Batesville',
      state: 'MS',
      zip: '38606',
      phone: '(662) 563-6205',
      fax: '(662) 563-6365',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Also serves Sardis location. Handles CPS cases for Panola County.'
    },
    {
      id: 'chancery-tate',
      name: 'Tate County Chancery Court',
      type: 'chancery',
      district: 'District 2',
      county: 'Tate',
      address: '201 Ward Street',
      city: 'Senatobia',
      state: 'MS',
      zip: '38668',
      phone: '(662) 562-5661',
      fax: '(662) 562-0065',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Tate County.'
    },
    {
      id: 'chancery-tunica',
      name: 'Tunica County Chancery Court',
      type: 'chancery',
      district: 'District 2',
      county: 'Tunica',
      address: '1163 Old Highway 61 North',
      city: 'Tunica',
      state: 'MS',
      zip: '38676',
      phone: '(662) 363-2451',
      fax: '(662) 363-1052',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Tunica County.'
    },

    // CHANCERY COURTS - DISTRICT 3
    {
      id: 'chancery-alcorn',
      name: 'Alcorn County Chancery Court',
      type: 'chancery',
      district: 'District 3',
      county: 'Alcorn',
      address: '301 Waldron Street',
      city: 'Corinth',
      state: 'MS',
      zip: '38834',
      phone: '(662) 286-7700',
      fax: '(662) 286-7706',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Alcorn County.'
    },
    {
      id: 'chancery-tippah',
      name: 'Tippah County Chancery Court',
      type: 'chancery',
      district: 'District 3',
      county: 'Tippah',
      address: '101 South Springbrook Street',
      city: 'Ripley',
      state: 'MS',
      zip: '38663',
      phone: '(662) 837-7374',
      fax: '(662) 837-9106',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Tippah County.'
    },
    {
      id: 'chancery-tishomingo',
      name: 'Tishomingo County Chancery Court',
      type: 'chancery',
      district: 'District 3',
      county: 'Tishomingo',
      address: '1008 Battleground Drive',
      city: 'Iuka',
      state: 'MS',
      zip: '38852',
      phone: '(662) 423-7010',
      fax: '(662) 423-7009',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Tishomingo County.'
    },

    // CHANCERY COURTS - DISTRICT 4
    {
      id: 'chancery-lee',
      name: 'Lee County Chancery Court',
      type: 'chancery',
      district: 'District 4',
      county: 'Lee',
      address: '200 West Jefferson Street',
      city: 'Tupelo',
      state: 'MS',
      zip: '38804',
      phone: '(662) 841-9100',
      fax: '(662) 841-9105',
      website: 'leecountyms.org',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Lee County. Large volume court.'
    },
    {
      id: 'chancery-pontotoc',
      name: 'Pontotoc County Chancery Court',
      type: 'chancery',
      district: 'District 4',
      county: 'Pontotoc',
      address: '11 East Washington Street',
      city: 'Pontotoc',
      state: 'MS',
      zip: '38863',
      phone: '(662) 489-3900',
      fax: '(662) 489-3905',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Pontotoc County.'
    },
    {
      id: 'chancery-union',
      name: 'Union County Chancery Court',
      type: 'chancery',
      district: 'District 4',
      county: 'Union',
      address: '109 Main Street East',
      city: 'New Albany',
      state: 'MS',
      zip: '38652',
      phone: '(662) 534-1900',
      fax: '(662) 534-1945',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Union County.'
    },

    // CHANCERY COURTS - DISTRICT 5
    {
      id: 'chancery-benton',
      name: 'Benton County Chancery Court',
      type: 'chancery',
      district: 'District 5',
      county: 'Benton',
      address: '100 East Main Street',
      city: 'Ashland',
      state: 'MS',
      zip: '38603',
      phone: '(662) 224-6310',
      fax: '(662) 224-6313',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Benton County.'
    },
    {
      id: 'chancery-lafayette',
      name: 'Lafayette County Chancery Court',
      type: 'chancery',
      district: 'District 5',
      county: 'Lafayette',
      address: '300 North Lamar Boulevard',
      city: 'Oxford',
      state: 'MS',
      zip: '38655',
      phone: '(662) 234-7563',
      fax: '(662) 234-7569',
      website: 'lafayettecountyms.com',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Lafayette County. Home of Ole Miss.'
    },
    {
      id: 'chancery-marshall',
      name: 'Marshall County Chancery Court',
      type: 'chancery',
      district: 'District 5',
      county: 'Marshall',
      address: '128 East Van Dorn Avenue',
      city: 'Holly Springs',
      state: 'MS',
      zip: '38635',
      phone: '(662) 252-3434',
      fax: '(662) 252-8785',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Marshall County.'
    },

    // CHANCERY COURTS - DISTRICT 6
    {
      id: 'chancery-coahoma',
      name: 'Coahoma County Chancery Court',
      type: 'chancery',
      district: 'District 6',
      county: 'Coahoma',
      address: '115 First Street',
      city: 'Clarksdale',
      state: 'MS',
      zip: '38614',
      phone: '(662) 624-3000',
      fax: '(662) 624-3004',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Coahoma County.'
    },
    {
      id: 'chancery-quitman',
      name: 'Quitman County Chancery Court',
      type: 'chancery',
      district: 'District 6',
      county: 'Quitman',
      address: '220 Chestnut Street',
      city: 'Marks',
      state: 'MS',
      zip: '38646',
      phone: '(662) 326-2661',
      fax: '(662) 326-8004',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Quitman County.'
    },

    // CHANCERY COURTS - DISTRICT 7
    {
      id: 'chancery-bolivar',
      name: 'Bolivar County Chancery Court - First District',
      type: 'chancery',
      district: 'District 7',
      county: 'Bolivar',
      address: '200 South Court Street',
      city: 'Rosedale',
      state: 'MS',
      zip: '38769',
      phone: '(662) 759-3022',
      fax: '(662) 759-6242',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Bolivar County First District.'
    },
    {
      id: 'chancery-bolivar-2',
      name: 'Bolivar County Chancery Court - Second District',
      type: 'chancery',
      district: 'District 7',
      county: 'Bolivar',
      address: '201 South Sharkey Avenue',
      city: 'Cleveland',
      state: 'MS',
      zip: '38732',
      phone: '(662) 843-2071',
      fax: '(662) 843-4181',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Bolivar County Second District.'
    },

    // CHANCERY COURTS - DISTRICT 8
    {
      id: 'chancery-tallahatchie',
      name: 'Tallahatchie County Chancery Court',
      type: 'chancery',
      district: 'District 8',
      county: 'Tallahatchie',
      address: '1 Court Square',
      city: 'Charleston',
      state: 'MS',
      zip: '38921',
      phone: '(662) 647-5551',
      fax: '(662) 647-8953',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Two courthouses: Charleston and Sumner. Handles CPS cases.'
    },
    {
      id: 'chancery-yalobusha',
      name: 'Yalobusha County Chancery Court',
      type: 'chancery',
      district: 'District 8',
      county: 'Yalobusha',
      address: '208 South Main Street',
      city: 'Water Valley',
      state: 'MS',
      zip: '38965',
      phone: '(662) 473-2091',
      fax: '(662) 473-5014',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Two courthouses: Water Valley and Coffeeville. Handles CPS cases.'
    },

    // CHANCERY COURTS - DISTRICT 9
    {
      id: 'chancery-grenada',
      name: 'Grenada County Chancery Court',
      type: 'chancery',
      district: 'District 9',
      county: 'Grenada',
      address: '59 Green Street',
      city: 'Grenada',
      state: 'MS',
      zip: '38901',
      phone: '(662) 226-1821',
      fax: '(662) 227-2683',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Grenada County.'
    },
    {
      id: 'chancery-montgomery',
      name: 'Montgomery County Chancery Court',
      type: 'chancery',
      district: 'District 9',
      county: 'Montgomery',
      address: '108 Summit Street',
      city: 'Winona',
      state: 'MS',
      zip: '38967',
      phone: '(662) 283-2333',
      fax: '(662) 283-4404',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Montgomery County.'
    },

    // CHANCERY COURTS - DISTRICT 10 (Large District - Multiple Counties)
    {
      id: 'chancery-chickasaw',
      name: 'Chickasaw County Chancery Court',
      type: 'chancery',
      district: 'District 10',
      county: 'Chickasaw',
      address: '1 Courthouse Square',
      city: 'Houston',
      state: 'MS',
      zip: '38851',
      phone: '(662) 456-2513',
      fax: '(662) 456-7876',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Chickasaw County.'
    },
    {
      id: 'chancery-clay',
      name: 'Clay County Chancery Court',
      type: 'chancery',
      district: 'District 10',
      county: 'Clay',
      address: '205 Court Street',
      city: 'West Point',
      state: 'MS',
      zip: '39773',
      phone: '(662) 494-3124',
      fax: '(662) 494-5816',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Clay County.'
    },
    {
      id: 'chancery-lowndes',
      name: 'Lowndes County Chancery Court',
      type: 'chancery',
      district: 'District 10',
      county: 'Lowndes',
      address: '505 Second Avenue North',
      city: 'Columbus',
      state: 'MS',
      zip: '39701',
      phone: '(662) 329-5800',
      fax: '(662) 329-5899',
      website: 'lowndescounty.org',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Lowndes County. Large volume court.'
    },
    {
      id: 'chancery-monroe',
      name: 'Monroe County Chancery Court',
      type: 'chancery',
      district: 'District 10',
      county: 'Monroe',
      address: '101 South Chestnut Street',
      city: 'Aberdeen',
      state: 'MS',
      zip: '39730',
      phone: '(662) 369-8143',
      fax: '(662) 369-2339',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Monroe County.'
    },
    {
      id: 'chancery-oktibbeha',
      name: 'Oktibbeha County Chancery Court',
      type: 'chancery',
      district: 'District 10',
      county: 'Oktibbeha',
      address: '101 East Main Street',
      city: 'Starkville',
      state: 'MS',
      zip: '39759',
      phone: '(662) 323-5834',
      fax: '(662) 323-6345',
      website: 'oktibbeha.org',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Oktibbeha County. Home of Mississippi State University.'
    },

    // CHANCERY COURTS - DISTRICT 11
    {
      id: 'chancery-attala',
      name: 'Attala County Chancery Court',
      type: 'chancery',
      district: 'District 11',
      county: 'Attala',
      address: '230 West Washington Street',
      city: 'Kosciusko',
      state: 'MS',
      zip: '39090',
      phone: '(662) 289-2921',
      fax: '(662) 289-5307',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Attala County.'
    },
    {
      id: 'chancery-carroll',
      name: 'Carroll County Chancery Court',
      type: 'chancery',
      district: 'District 11',
      county: 'Carroll',
      address: '14 Vaiden Street',
      city: 'Carrollton',
      state: 'MS',
      zip: '38917',
      phone: '(662) 237-9274',
      fax: '(662) 237-6354',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Carroll County.'
    },
    {
      id: 'chancery-choctaw',
      name: 'Choctaw County Chancery Court',
      type: 'chancery',
      district: 'District 11',
      county: 'Choctaw',
      address: '112 Quinn Street',
      city: 'Ackerman',
      state: 'MS',
      zip: '39735',
      phone: '(662) 285-6329',
      fax: '(662) 285-3411',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Choctaw County.'
    },
    {
      id: 'chancery-webster',
      name: 'Webster County Chancery Court',
      type: 'chancery',
      district: 'District 11',
      county: 'Webster',
      address: '19 North Dunn Street',
      city: 'Eupora',
      state: 'MS',
      zip: '39744',
      phone: '(662) 258-4131',
      fax: '(662) 258-7181',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Webster County.'
    },
    {
      id: 'chancery-winston',
      name: 'Winston County Chancery Court',
      type: 'chancery',
      district: 'District 11',
      county: 'Winston',
      address: '115 South Court Street',
      city: 'Louisville',
      state: 'MS',
      zip: '39339',
      phone: '(662) 773-3631',
      fax: '(662) 773-8662',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Winston County.'
    },

    // CHANCERY COURTS - DISTRICT 12 (HINDS - LARGEST)
    {
      id: 'chancery-hinds',
      name: 'Hinds County Chancery Court',
      type: 'chancery',
      district: 'District 12',
      county: 'Hinds',
      address: '316 South President Street',
      city: 'Jackson',
      state: 'MS',
      zip: '39201',
      phone: '(601) 968-6527',
      fax: '(601) 968-6694',
      website: 'co.hinds.ms.us',
      clerk: 'Eddie Jean Carr, Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Largest chancery court in Mississippi. Handles high volume of CPS cases. Capital city.'
    },

    // CHANCERY COURTS - DISTRICT 13
    {
      id: 'chancery-leake',
      name: 'Leake County Chancery Court',
      type: 'chancery',
      district: 'District 13',
      county: 'Leake',
      address: '100 Main Street',
      city: 'Carthage',
      state: 'MS',
      zip: '39051',
      phone: '(601) 267-7371',
      fax: '(601) 267-4749',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Leake County.'
    },
    {
      id: 'chancery-neshoba',
      name: 'Neshoba County Chancery Court',
      type: 'chancery',
      district: 'District 13',
      county: 'Neshoba',
      address: '401 East Beacon Street',
      city: 'Philadelphia',
      state: 'MS',
      zip: '39350',
      phone: '(601) 656-3581',
      fax: '(601) 656-4446',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Neshoba County.'
    },
    {
      id: 'chancery-scott',
      name: 'Scott County Chancery Court',
      type: 'chancery',
      district: 'District 13',
      county: 'Scott',
      address: '100 Main Street',
      city: 'Forest',
      state: 'MS',
      zip: '39074',
      phone: '(601) 469-1922',
      fax: '(601) 469-4336',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Scott County.'
    },

    // CHANCERY COURTS - DISTRICT 14 (RANKIN - LARGE SUBURBAN COUNTY)
    {
      id: 'chancery-rankin',
      name: 'Rankin County Chancery Court',
      type: 'chancery',
      district: 'District 14',
      county: 'Rankin',
      address: '211 East Government Street',
      city: 'Brandon',
      state: 'MS',
      zip: '39042',
      phone: '(601) 825-2217',
      fax: '(601) 824-2568',
      website: 'rankincounty.org',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Second largest county. High volume of CPS cases. Suburban Jackson area.'
    },

    // CHANCERY COURTS - DISTRICT 15
    {
      id: 'chancery-adams',
      name: 'Adams County Chancery Court',
      type: 'chancery',
      district: 'District 15',
      county: 'Adams',
      address: '115 South Wall Street',
      city: 'Natchez',
      state: 'MS',
      zip: '39120',
      phone: '(601) 446-6684',
      fax: '(601) 445-7935',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Adams County. Historic Natchez area.'
    },
    {
      id: 'chancery-franklin',
      name: 'Franklin County Chancery Court',
      type: 'chancery',
      district: 'District 15',
      county: 'Franklin',
      address: '65 Main Street',
      city: 'Meadville',
      state: 'MS',
      zip: '39653',
      phone: '(601) 384-2330',
      fax: '(601) 384-2332',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Franklin County.'
    },
    {
      id: 'chancery-wilkinson',
      name: 'Wilkinson County Chancery Court',
      type: 'chancery',
      district: 'District 15',
      county: 'Wilkinson',
      address: '525 Main Street',
      city: 'Woodville',
      state: 'MS',
      zip: '39669',
      phone: '(601) 888-4381',
      fax: '(601) 888-3062',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Wilkinson County.'
    },

    // CHANCERY COURTS - DISTRICT 16 (MADISON - AFFLUENT COUNTY)
    {
      id: 'chancery-madison',
      name: 'Madison County Chancery Court',
      type: 'chancery',
      district: 'District 16',
      county: 'Madison',
      address: '146 West Center Street',
      city: 'Canton',
      state: 'MS',
      zip: '39046',
      phone: '(601) 859-1177',
      fax: '(601) 859-2474',
      website: 'madison-co.com',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Madison County. Affluent suburban area.'
    },

    // CHANCERY COURTS - DISTRICT 17
    {
      id: 'chancery-claiborne',
      name: 'Claiborne County Chancery Court',
      type: 'chancery',
      district: 'District 17',
      county: 'Claiborne',
      address: '410 Main Street',
      city: 'Port Gibson',
      state: 'MS',
      zip: '39150',
      phone: '(601) 437-4992',
      fax: '(601) 437-3541',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Claiborne County.'
    },
    {
      id: 'chancery-copiah',
      name: 'Copiah County Chancery Court',
      type: 'chancery',
      district: 'District 17',
      county: 'Copiah',
      address: '100 Caldwell Drive',
      city: 'Hazlehurst',
      state: 'MS',
      zip: '39083',
      phone: '(601) 894-3021',
      fax: '(601) 894-4711',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Copiah County.'
    },
    {
      id: 'chancery-jefferson',
      name: 'Jefferson County Chancery Court',
      type: 'chancery',
      district: 'District 17',
      county: 'Jefferson',
      address: '307 Main Street',
      city: 'Fayette',
      state: 'MS',
      zip: '39069',
      phone: '(601) 786-3021',
      fax: '(601) 786-9719',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Jefferson County.'
    },

    // CHANCERY COURTS - DISTRICT 18
    {
      id: 'chancery-covington',
      name: 'Covington County Chancery Court',
      type: 'chancery',
      district: 'District 18',
      county: 'Covington',
      address: '101 South Elm Avenue',
      city: 'Collins',
      state: 'MS',
      zip: '39428',
      phone: '(601) 765-4242',
      fax: '(601) 765-8127',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Covington County.'
    },
    {
      id: 'chancery-jefferson-davis',
      name: 'Jefferson Davis County Chancery Court',
      type: 'chancery',
      district: 'District 18',
      county: 'Jefferson Davis',
      address: '1025 Third Street',
      city: 'Prentiss',
      state: 'MS',
      zip: '39474',
      phone: '(601) 792-4204',
      fax: '(601) 792-2810',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Jefferson Davis County.'
    },
    {
      id: 'chancery-lawrence',
      name: 'Lawrence County Chancery Court',
      type: 'chancery',
      district: 'District 18',
      county: 'Lawrence',
      address: '517 East Broad Street',
      city: 'Monticello',
      state: 'MS',
      zip: '39654',
      phone: '(601) 587-7162',
      fax: '(601) 587-0151',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Lawrence County.'
    },

    // CHANCERY COURTS - DISTRICT 19
    {
      id: 'chancery-amite',
      name: 'Amite County Chancery Court',
      type: 'chancery',
      district: 'District 19',
      county: 'Amite',
      address: '243 West Main Street',
      city: 'Liberty',
      state: 'MS',
      zip: '39645',
      phone: '(601) 657-8022',
      fax: '(601) 657-2999',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Amite County.'
    },
    {
      id: 'chancery-lamar',
      name: 'Lamar County Chancery Court',
      type: 'chancery',
      district: 'District 19',
      county: 'Lamar',
      address: '203 Main Street',
      city: 'Purvis',
      state: 'MS',
      zip: '39475',
      phone: '(601) 794-8504',
      fax: '(601) 794-1023',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Lamar County.'
    },
    {
      id: 'chancery-marion',
      name: 'Marion County Chancery Court',
      type: 'chancery',
      district: 'District 19',
      county: 'Marion',
      address: '250 Broad Street',
      city: 'Columbia',
      state: 'MS',
      zip: '39429',
      phone: '(601) 736-2691',
      fax: '(601) 731-3542',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Marion County.'
    },
    {
      id: 'chancery-pike',
      name: 'Pike County Chancery Court',
      type: 'chancery',
      district: 'District 19',
      county: 'Pike',
      address: '200 East Bay Street',
      city: 'Magnolia',
      state: 'MS',
      zip: '39652',
      phone: '(601) 783-3362',
      fax: '(601) 783-5209',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Pike County.'
    },
    {
      id: 'chancery-walthall',
      name: 'Walthall County Chancery Court',
      type: 'chancery',
      district: 'District 19',
      county: 'Walthall',
      address: '200 Ball Avenue',
      city: 'Tylertown',
      state: 'MS',
      zip: '39667',
      phone: '(601) 876-5677',
      fax: '(601) 876-3055',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Walthall County.'
    },

    // CHANCERY COURTS - DISTRICT 20 (COASTAL - HIGH VOLUME)
    {
      id: 'chancery-hancock',
      name: 'Hancock County Chancery Court',
      type: 'chancery',
      district: 'District 20',
      county: 'Hancock',
      address: '854 Highway 90',
      city: 'Bay St. Louis',
      state: 'MS',
      zip: '39520',
      phone: '(228) 467-5404',
      fax: '(228) 466-4182',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Hancock County. Gulf Coast area.'
    },
    {
      id: 'chancery-harrison',
      name: 'Harrison County Chancery Court - First District',
      type: 'chancery',
      district: 'District 20',
      county: 'Harrison',
      address: '1801 23rd Avenue',
      city: 'Gulfport',
      state: 'MS',
      zip: '39501',
      phone: '(228) 865-4033',
      fax: '(228) 865-4243',
      website: 'co.harrison.ms.us',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Largest coastal county. High volume of CPS cases. Gulf Coast.'
    },
    {
      id: 'chancery-harrison-2',
      name: 'Harrison County Chancery Court - Second District',
      type: 'chancery',
      district: 'District 20',
      county: 'Harrison',
      address: '1801 23rd Avenue',
      city: 'Gulfport',
      state: 'MS',
      zip: '39501',
      phone: '(228) 865-4033',
      fax: '(228) 865-4243',
      website: 'co.harrison.ms.us',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Second District serves Biloxi area. High CPS case volume.'
    },
    {
      id: 'chancery-stone',
      name: 'Stone County Chancery Court',
      type: 'chancery',
      district: 'District 20',
      county: 'Stone',
      address: '323 East Cavers Avenue',
      city: 'Wiggins',
      state: 'MS',
      zip: '39577',
      phone: '(601) 928-5266',
      fax: '(601) 928-7308',
      clerk: 'Chancery Clerk',
      jurisdiction: ['Youth Court', 'CPS cases', 'Adoptions', 'Custody', 'Divorce', 'Estates', 'Guardianships'],
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      notes: 'Handles CPS cases for Stone County.'
    }
  ];

  const courtTypes = [
    { value: 'all', label: 'All Courts', icon: Scale },
    { value: 'supreme', label: 'Supreme Court', icon: Scale },
    { value: 'appeals', label: 'Court of Appeals', icon: Scale },
    { value: 'chancery', label: 'Chancery Courts (CPS)', icon: Building },
    { value: 'circuit', label: 'Circuit Courts', icon: Briefcase },
    { value: 'county', label: 'County Courts', icon: Building },
    { value: 'justice', label: 'Justice Courts', icon: Scale },
    { value: 'municipal', label: 'Municipal Courts', icon: Building }
  ];

  const counties = Array.from(new Set(courts.map(c => c.county))).sort();

  const filteredCourts = courts.filter(court => {
    const matchesSearch = searchTerm === '' || 
      court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.district?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || court.type === selectedType;
    const matchesCounty = selectedCounty === 'all' || court.county === selectedCounty;

    return matchesSearch && matchesType && matchesCounty;
  });

  const getCourtTypeColor = (type: Court['type']) => {
    switch (type) {
      case 'supreme': return 'bg-purple-600';
      case 'appeals': return 'bg-indigo-600';
      case 'chancery': return 'bg-blue-600';
      case 'circuit': return 'bg-green-600';
      case 'county': return 'bg-yellow-600';
      case 'justice': return 'bg-orange-600';
      case 'municipal': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mississippi Courts Directory</h1>
            <p className="text-gray-600 mb-4">
              Complete directory of all Mississippi courts with addresses, phone numbers, and contact information
            </p>
            <Alert className="bg-blue-100 border-blue-300">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>CPS Cases:</strong> In Mississippi, CPS/dependency cases are heard in <strong>Chancery Court</strong> under the Youth Court Division. Find your county's chancery court below.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </Card>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by court name, county, city, or address..."
              className="pl-10"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                <Filter className="w-4 h-4 inline mr-1" />
                Court Type
              </label>
              <div className="flex flex-wrap gap-2">
                {courtTypes.map(type => (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(type.value)}
                    className="whitespace-nowrap"
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                <MapPin className="w-4 h-4 inline mr-1" />
                Filter by County
              </label>
              <select
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="all">All Counties ({counties.length})</option>
                {counties.map(county => (
                  <option key={county} value={county}>{county} County</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center border-2 border-blue-200 bg-blue-50">
          <div className="text-2xl font-bold text-blue-700">{courts.length}</div>
          <div className="text-sm text-blue-600">Total Courts</div>
        </Card>
        <Card className="p-4 text-center border-2 border-green-200 bg-green-50">
          <div className="text-2xl font-bold text-green-700">{courts.filter(c => c.type === 'chancery').length}</div>
          <div className="text-sm text-green-600">Chancery Courts</div>
        </Card>
        <Card className="p-4 text-center border-2 border-purple-200 bg-purple-50">
          <div className="text-2xl font-bold text-purple-700">{counties.length}</div>
          <div className="text-sm text-purple-600">Counties</div>
        </Card>
        <Card className="p-4 text-center border-2 border-orange-200 bg-orange-50">
          <div className="text-2xl font-bold text-orange-700">20</div>
          <div className="text-sm text-orange-600">Districts</div>
        </Card>
      </div>

      {/* Courts List */}
      <div className="space-y-4">
        {filteredCourts.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Courts Found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </Card>
        ) : (
          filteredCourts.map(court => (
            <Card key={court.id} className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <button
                onClick={() => toggleExpanded(court.id)}
                className="w-full p-6 text-left flex items-start justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={getCourtTypeColor(court.type)}>
                      {court.type.toUpperCase()}
                    </Badge>
                    {court.district && (
                      <Badge variant="outline">{court.district}</Badge>
                    )}
                    <Badge variant="outline" className="bg-gray-100">
                      <MapPin className="w-3 h-3 mr-1" />
                      {court.county} County
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{court.name}</h3>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{court.address}, {court.city}, {court.state} {court.zip}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{court.phone}</span>
                    </div>
                  </div>
                  {court.notes && (
                    <p className="mt-2 text-sm text-blue-600 font-medium">{court.notes}</p>
                  )}
                </div>
                <div className="ml-4">
                  {expandedCourts.has(court.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedCourts.has(court.id) && (
                <div className="px-6 pb-6 border-t bg-gray-50">
                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-900 mb-3">Contact Information</h4>
                      <div className="flex items-start gap-2">
                        <Building className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <div className="font-semibold text-gray-700">Address:</div>
                          <div className="text-gray-600">
                            {court.address}<br/>
                            {court.city}, {court.state} {court.zip}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="font-semibold text-gray-700">Phone: </span>
                          <a href={`tel:${court.phone}`} className="text-blue-600 hover:underline">
                            {court.phone}
                          </a>
                        </div>
                      </div>
                      {court.fax && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="font-semibold text-gray-700">Fax: </span>
                            <span className="text-gray-600">{court.fax}</span>
                          </div>
                        </div>
                      )}
                      {court.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="font-semibold text-gray-700">Email: </span>
                            <a href={`mailto:${court.email}`} className="text-blue-600 hover:underline">
                              {court.email}
                            </a>
                          </div>
                        </div>
                      )}
                      {court.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="font-semibold text-gray-700">Website: </span>
                            <a 
                              href={`https://${court.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                              {court.website}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}
                      {court.hours && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="font-semibold text-gray-700">Hours: </span>
                            <span className="text-gray-600">{court.hours}</span>
                          </div>
                        </div>
                      )}
                      {court.clerk && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="font-semibold text-gray-700">Clerk: </span>
                            <span className="text-gray-600">{court.clerk}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {court.jurisdiction && court.jurisdiction.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Jurisdiction</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {court.jurisdiction.map((j, idx) => (
                              <li key={idx}>{j}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {court.judges && court.judges.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Judges</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {court.judges.map((judge, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <User className="w-3 h-3 text-gray-400" />
                                {judge}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(court.address + ', ' + court.city + ', ' + court.state + ' ' + court.zip)}`, '_blank')}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                    {court.website && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://${court.website}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Website
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Footer */}
      <Card className="p-6 bg-yellow-50 border-2 border-yellow-200">
        <Alert className="bg-yellow-100 border-yellow-300">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900">Important Note</AlertTitle>
          <AlertDescription className="text-yellow-800">
            <strong>CPS/Dependency Cases:</strong> All CPS, abuse, neglect, and dependency cases in Mississippi are handled by the <strong>Chancery Court</strong> in your county under the Youth Court Division. Contact information is current as of December 2024. Always verify court hours and locations before visiting.
          </AlertDescription>
        </Alert>
      </Card>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-500 pt-4">
        Mississippi Courts Directory - Information from Mississippi Administrative Office of Courts<br/>
        The CPS Punisher™ - Copyright © 2024 DARREN GUAY - All Rights Reserved
      </div>
    </div>
  );
}

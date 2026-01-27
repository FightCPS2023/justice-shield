import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import {
  Users,
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Briefcase,
  Award,
  Star,
  ExternalLink,
  Filter,
  UserCheck,
  Scale,
  Shield,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { advocateApi, type Advocate as AdvocateType } from '../utils/communityApi';

interface Advocate {
  id: string;
  type: 'advocate' | 'attorney';
  name: string;
  credentials: string;
  photo?: string;
  email: string;
  phone: string;
  website?: string;
  state: string;
  county?: string;
  cities: string[];
  specializations: string[];
  about: string;
  yearsExperience?: number;
  barNumber?: string;
  rates?: string;
  availability: 'available' | 'limited' | 'full';
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  rating?: number;
  reviewCount?: number;
  verified: boolean;
  joinedDate: string;
}

interface AdvocateDirectoryProps {
  userState: string;
  onSignUp: () => void;
}

export function AdvocateDirectory({ userState, onSignUp }: AdvocateDirectoryProps) {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState(userState || '');
  const [filterType, setFilterType] = useState<'all' | 'advocate' | 'attorney'>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null);

  // Load advocates from backend
  useEffect(() => {
    loadAdvocates();
  }, []);

  const loadAdvocates = async () => {
    setIsLoading(true);
    
    try {
      const data = await advocateApi.getAll();
      setAdvocates(data);
      setFilteredAdvocates(data);
    } catch (error: any) {
      // Silently handle server errors - this is expected in demo mode
      console.log('ℹ️ Advocate directory in demo mode (server not deployed)');
      
      // Don't show error toasts for "Server not deployed yet"
      if (!error.message.includes('Server not deployed') && 
          !error.message.includes('Server is not responding')) {
        toast.error('Failed to load advocates. Please try again.');
      }
      
      // Fall back to empty array
      setAdvocates([]);
      setFilteredAdvocates([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter advocates
  useEffect(() => {
    let filtered = [...advocates];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    // Filter by state
    if (filterState) {
      filtered = filtered.filter(a => a.state === filterState);
    }

    // Filter by availability
    if (filterAvailability !== 'all') {
      filtered = filtered.filter(a => a.availability === filterAvailability);
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.about.toLowerCase().includes(query) ||
        a.specializations.some(s => s.toLowerCase().includes(query)) ||
        a.cities.some(c => c.toLowerCase().includes(query)) ||
        a.county?.toLowerCase().includes(query)
      );
    }

    setFilteredAdvocates(filtered);
  }, [advocates, filterType, filterState, filterAvailability, searchQuery]);

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge className="bg-green-500">Available</Badge>;
      case 'limited':
        return <Badge className="bg-yellow-500">Limited Availability</Badge>;
      case 'full':
        return <Badge className="bg-red-500">Fully Booked</Badge>;
      default:
        return null;
    }
  };

  const renderAdvocateCard = (advocate: Advocate) => (
    <Card
      key={advocate.id}
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => setSelectedAdvocate(advocate)}
    >
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Photo/ID Card Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-32 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-xl overflow-hidden border-4 border-white">
                {advocate.photo ? (
                  <ImageWithFallback
                    src={advocate.photo}
                    alt={advocate.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <Users className="w-16 h-16 text-gray-500" />
                  </div>
                )}
                
                {/* ID Card Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <div className="text-white text-xs font-bold">{advocate.type === 'attorney' ? 'ATTORNEY' : 'ADVOCATE'}</div>
                </div>
              </div>
              
              {advocate.verified && (
                <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1.5 shadow-lg">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Information Section */}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {advocate.type === 'attorney' ? (
                      <Scale className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Shield className="w-5 h-5 text-purple-600" />
                    )}
                    {advocate.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{advocate.credentials}</p>
                </div>
                {getAvailabilityBadge(advocate.availability)}
              </div>

              {/* Rating */}
              {advocate.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(advocate.rating!)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{advocate.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({advocate.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{advocate.state}</span>
              {advocate.county && <span className="text-muted-foreground">• {advocate.county}</span>}
            </div>

            {/* Specializations */}
            <div className="flex flex-wrap gap-1.5">
              {advocate.specializations.slice(0, 4).map((spec, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {advocate.specializations.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{advocate.specializations.length - 4} more
                </Badge>
              )}
            </div>

            {/* About (truncated) */}
            <p className="text-sm text-muted-foreground line-clamp-2">{advocate.about}</p>

            {/* Experience & Rates */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {advocate.yearsExperience && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{advocate.yearsExperience} years</span>
                </div>
              )}
              {advocate.rates && (
                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{advocate.rates}</span>
                </div>
              )}
            </div>

            {/* Contact Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `mailto:${advocate.email}`;
                }}
              >
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Email
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `tel:${advocate.phone}`;
                }}
              >
                <Phone className="w-3.5 h-3.5 mr-1.5" />
                Call
              </Button>
              {advocate.website && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(advocate.website, '_blank');
                  }}
                >
                  <Globe className="w-3.5 h-3.5 mr-1.5" />
                  Website
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Full Profile Modal
  const renderFullProfile = (advocate: Advocate) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl flex items-center gap-3">
                {advocate.type === 'attorney' ? (
                  <Scale className="w-6 h-6 text-blue-600" />
                ) : (
                  <Shield className="w-6 h-6 text-purple-600" />
                )}
                {advocate.name}
                {advocate.verified && (
                  <UserCheck className="w-5 h-5 text-blue-500" />
                )}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {advocate.credentials}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedAdvocate(null)}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ID Card & Contact */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* ID Card */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-48 h-60 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-2xl overflow-hidden border-4 border-white">
                  {advocate.photo ? (
                    <ImageWithFallback
                      src={advocate.photo}
                      alt={advocate.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                      <Users className="w-24 h-24 text-gray-500" />
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                    <div className="text-white">
                      <div className="text-xs font-bold mb-1">
                        {advocate.type === 'attorney' ? 'ATTORNEY' : 'ADVOCATE'}
                      </div>
                      <div className="text-xs opacity-90">
                        Member since {new Date(advocate.joinedDate).getFullYear()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-3">Contact Information</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a href={`mailto:${advocate.email}`} className="text-blue-600 hover:underline">
                      {advocate.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a href={`tel:${advocate.phone}`} className="text-blue-600 hover:underline">
                      {advocate.phone}
                    </a>
                  </div>
                  {advocate.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <a
                        href={advocate.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {advocate.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>
                      {advocate.county ? `${advocate.county}, ` : ''}
                      {advocate.state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              {advocate.socialMedia && (
                <div>
                  <h4 className="text-sm font-bold mb-2">Connect Online</h4>
                  <div className="flex gap-2">
                    {advocate.socialMedia.facebook && (
                      <a
                        href={advocate.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {advocate.socialMedia.twitter && (
                      <a
                        href={advocate.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {advocate.socialMedia.linkedin && (
                      <a
                        href={advocate.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {advocate.socialMedia.instagram && (
                      <a
                        href={advocate.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {advocate.socialMedia.youtube && (
                      <a
                        href={advocate.socialMedia.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <Youtube className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {getAvailabilityBadge(advocate.availability)}
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-2">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{advocate.about}</p>
          </div>

          {/* Professional Details */}
          <div className="grid md:grid-cols-2 gap-4">
            {advocate.yearsExperience && (
              <div>
                <h4 className="text-sm font-bold mb-1">Experience</h4>
                <p className="text-sm text-muted-foreground">{advocate.yearsExperience} years</p>
              </div>
            )}
            {advocate.barNumber && (
              <div>
                <h4 className="text-sm font-bold mb-1">Bar Number</h4>
                <p className="text-sm text-muted-foreground">{advocate.barNumber}</p>
              </div>
            )}
            {advocate.rates && (
              <div>
                <h4 className="text-sm font-bold mb-1">Rates</h4>
                <p className="text-sm text-muted-foreground">{advocate.rates}</p>
              </div>
            )}
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-lg font-bold mb-2">Service Areas</h3>
            <div className="flex flex-wrap gap-2">
              {advocate.cities.map((city, i) => (
                <Badge key={i} variant="secondary">
                  {city}
                </Badge>
              ))}
            </div>
          </div>

          {/* Specializations */}
          <div>
            <h3 className="text-lg font-bold mb-2">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {advocate.specializations.map((spec, i) => (
                <Badge key={i} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              size="lg"
              onClick={() => window.location.href = `mailto:${advocate.email}`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.location.href = `tel:${advocate.phone}`}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </Button>
            {advocate.website && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.open(advocate.website, '_blank')}
              >
                <Globe className="w-4 h-4 mr-2" />
                Visit Website
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Users className="w-7 h-7 text-blue-600" />
            CPS Advocate & Attorney Directory
          </CardTitle>
          <CardDescription className="text-base">
            Connect with verified advocates and attorneys who specialize in CPS defense. Find local help in your area.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <UserCheck className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-sm">
              <strong>Are you an advocate or attorney?</strong> Join our directory to help families fight CPS!{' '}
              <Button variant="link" size="sm" className="p-0 h-auto" onClick={onSignUp}>
                Sign up here →
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, specialization, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Type</label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="attorney">Attorneys Only</SelectItem>
                  <SelectItem value="advocate">Advocates Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block">State</label>
              <Select value={filterState || "all"} onValueChange={(val) => setFilterState(val === "all" ? "" : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="Texas">Texas</SelectItem>
                  <SelectItem value="California">California</SelectItem>
                  <SelectItem value="Florida">Florida</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  {/* Add all states */}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block">Availability</label>
              <Select value={filterAvailability} onValueChange={setFilterAvailability}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Availability</SelectItem>
                  <SelectItem value="available">Available Now</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {filteredAdvocates.length} {filteredAdvocates.length === 1 ? 'Professional' : 'Professionals'} Found
          </h3>
          <div className="flex gap-2">
            <Badge variant="outline">
              {filteredAdvocates.filter(a => a.type === 'attorney').length} Attorneys
            </Badge>
            <Badge variant="outline">
              {filteredAdvocates.filter(a => a.type === 'advocate').length} Advocates
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              Loading directory...
            </div>
          </Card>
        ) : filteredAdvocates.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-3">
              <Users className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="text-muted-foreground">
                No professionals found matching your criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterState('');
                  setFilterType('all');
                  setFilterAvailability('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAdvocates.map(advocate => renderAdvocateCard(advocate))}
          </div>
        )}
      </div>

      {/* Full Profile Modal */}
      {selectedAdvocate && renderFullProfile(selectedAdvocate)}
    </div>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import {
  Upload,
  UserPlus,
  Scale,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { advocateApi } from '../utils/communityApi';

interface AdvocateSignupProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AdvocateSignup({ onSuccess, onCancel }: AdvocateSignupProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'advocate' as 'advocate' | 'attorney',
    name: '',
    credentials: '',
    email: '',
    phone: '',
    website: '',
    state: '',
    county: '',
    cities: [] as string[],
    specializations: [] as string[],
    about: '',
    yearsExperience: '',
    barNumber: '',
    rates: '',
    availability: 'available' as 'available' | 'limited' | 'full',
    socialMedia: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      youtube: '',
    },
  });

  const [photo, setPhoto] = useState<string | null>(null);
  const [newCity, setNewCity] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSocialMedia = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value },
    }));
  };

  const addCity = () => {
    if (newCity.trim() && !formData.cities.includes(newCity.trim())) {
      setFormData(prev => ({ ...prev, cities: [...prev.cities, newCity.trim()] }));
      setNewCity('');
    }
  };

  const removeCity = (city: string) => {
    setFormData(prev => ({ ...prev, cities: prev.cities.filter(c => c !== city) }));
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()],
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== spec),
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        if (!formData.name || !formData.email || !formData.phone) {
          toast.error('Please fill in all required fields');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        return true;
      case 2:
        if (!formData.state || formData.cities.length === 0) {
          toast.error('Please select a state and add at least one city');
          return false;
        }
        return true;
      case 3:
        if (formData.specializations.length === 0 || !formData.about) {
          toast.error('Please add specializations and write an about section');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      // Submit to backend API
      const response = await advocateApi.create({
        ...formData,
        photo,
        yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : undefined,
      });

      toast.success(response.message);
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting advocate application:', error);
      toast.error(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonSpecializations = {
    advocate: [
      'Court Navigation',
      'Service Plan Completion',
      'Visitation Support',
      'Document Preparation',
      'Emotional Support',
      'Case Management',
    ],
    attorney: [
      'CPS Defense',
      'Termination Cases',
      'Reunification',
      'Appeals',
      '§1983 Civil Rights',
      'Constitutional Claims',
      'Emergency Hearings',
      'Dependency Petitions',
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <UserPlus className="w-7 h-7 text-blue-600" />
                Join Our Directory
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Help families fight CPS by listing your services in our professional directory
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= num
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
            </div>
            {num < 4 && (
              <div
                className={`w-12 h-1 ${
                  step > num ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Basic Information</CardTitle>
            <CardDescription>Tell us about yourself</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type Selection */}
            <div>
              <Label className="text-base font-bold mb-3 block">I am a/an: *</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    formData.type === 'advocate'
                      ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => updateField('type', 'advocate')}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-purple-600" />
                    <div>
                      <div className="font-bold">Parent Advocate</div>
                      <div className="text-xs text-muted-foreground">
                        Help families navigate CPS system
                      </div>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    formData.type === 'attorney'
                      ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => updateField('type', 'attorney')}
                >
                  <div className="flex items-center gap-3">
                    <Scale className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="font-bold">Attorney</div>
                      <div className="text-xs text-muted-foreground">
                        Licensed attorney specializing in CPS law
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <Label>Professional Photo (Optional)</Label>
              <div className="mt-2 flex items-start gap-4">
                <div className="w-32 h-40 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {photo ? (
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="mb-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a professional photo for your ID card. Max 5MB. JPG or PNG.
                  </p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <Label>Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="John Smith"
              />
            </div>

            {/* Credentials */}
            <div>
              <Label>Credentials/Title *</Label>
              <Input
                value={formData.credentials}
                onChange={(e) => updateField('credentials', e.target.value)}
                placeholder={
                  formData.type === 'attorney'
                    ? 'J.D., Board Certified Family Law'
                    : 'Certified Parent Advocate, B.A. Social Work'
                }
              />
            </div>

            {/* Bar Number (Attorney only) */}
            {formData.type === 'attorney' && (
              <div>
                <Label>State Bar Number *</Label>
                <Input
                  value={formData.barNumber}
                  onChange={(e) => updateField('barNumber', e.target.value)}
                  placeholder="TX-12345678"
                />
              </div>
            )}

            {/* Contact */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label>Phone *</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <Label>Website (Optional)</Label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Experience & Rates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  value={formData.yearsExperience}
                  onChange={(e) => updateField('yearsExperience', e.target.value)}
                  placeholder="5"
                />
              </div>

              <div>
                <Label>Rates/Fees</Label>
                <Input
                  value={formData.rates}
                  onChange={(e) => updateField('rates', e.target.value)}
                  placeholder="$100-150/hr or Free"
                />
              </div>
            </div>

            <Button onClick={handleNext} className="w-full" size="lg">
              Continue to Step 2
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Service Areas */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Service Areas</CardTitle>
            <CardDescription>Where do you provide services?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* State */}
            <div>
              <Label>Primary State *</Label>
              <Select value={formData.state} onValueChange={(value) => updateField('state', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Texas">Texas</SelectItem>
                  <SelectItem value="California">California</SelectItem>
                  <SelectItem value="Florida">Florida</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  {/* Add all states */}
                </SelectContent>
              </Select>
            </div>

            {/* County */}
            <div>
              <Label>Primary County (Optional)</Label>
              <Input
                value={formData.county}
                onChange={(e) => updateField('county', e.target.value)}
                placeholder="Harris County"
              />
            </div>

            {/* Cities */}
            <div>
              <Label>Cities Served * (Add at least one)</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Enter city name"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCity();
                    }
                  }}
                />
                <Button onClick={addCity} type="button">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.cities.map((city) => (
                  <Badge key={city} variant="secondary" className="pl-3 pr-1.5 py-1">
                    {city}
                    <button
                      onClick={() => removeCity(city)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <Label>Current Availability</Label>
              <Select
                value={formData.availability}
                onValueChange={(value: any) => updateField('availability', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available - Accepting New Clients</SelectItem>
                  <SelectItem value="limited">Limited - Few Openings</SelectItem>
                  <SelectItem value="full">Full - Not Accepting New Clients</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continue to Step 3
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Expertise */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Expertise & About</CardTitle>
            <CardDescription>Tell families what you specialize in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Specializations */}
            <div>
              <Label>Specializations * (Add at least one)</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="Enter specialization"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSpecialization();
                    }
                  }}
                />
                <Button onClick={addSpecialization} type="button">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Quick add common specializations:</p>
                <div className="flex flex-wrap gap-1.5">
                  {commonSpecializations[formData.type].map((spec) => (
                    <Badge
                      key={spec}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                      onClick={() => {
                        if (!formData.specializations.includes(spec)) {
                          setFormData(prev => ({
                            ...prev,
                            specializations: [...prev.specializations, spec],
                          }));
                        }
                      }}
                    >
                      + {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.specializations.map((spec) => (
                  <Badge key={spec} className="pl-3 pr-1.5 py-1.5">
                    {spec}
                    <button
                      onClick={() => removeSpecialization(spec)}
                      className="ml-2 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* About */}
            <div>
              <Label>About You * (Minimum 100 characters)</Label>
              <Textarea
                value={formData.about}
                onChange={(e) => updateField('about', e.target.value)}
                placeholder="Tell families about your background, experience, and approach to CPS defense. Why are you passionate about helping families? What makes you uniquely qualified?"
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.about.length} / 100 characters minimum
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continue to Step 4
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Social Media & Review */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Social Media & Review</CardTitle>
            <CardDescription>Add your social profiles (optional) and review your listing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Social Media */}
            <div className="space-y-3">
              <Label>Social Media Links (Optional)</Label>
              
              <div>
                <label className="text-xs text-muted-foreground">Facebook</label>
                <Input
                  type="url"
                  value={formData.socialMedia.facebook}
                  onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourprofile"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">LinkedIn</label>
                <Input
                  type="url"
                  value={formData.socialMedia.linkedin}
                  onChange={(e) => updateSocialMedia('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Twitter</label>
                <Input
                  type="url"
                  value={formData.socialMedia.twitter}
                  onChange={(e) => updateSocialMedia('twitter', e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Instagram</label>
                <Input
                  type="url"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">YouTube</label>
                <Input
                  type="url"
                  value={formData.socialMedia.youtube}
                  onChange={(e) => updateSocialMedia('youtube', e.target.value)}
                  placeholder="https://youtube.com/yourchannel"
                />
              </div>
            </div>

            {/* Review Summary */}
            <Alert>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription>
                <strong>Review your information before submitting:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>✓ Type: {formData.type === 'attorney' ? 'Attorney' : 'Advocate'}</li>
                  <li>✓ Name: {formData.name}</li>
                  <li>✓ Email: {formData.email}</li>
                  <li>✓ Service Area: {formData.cities.join(', ')}, {formData.state}</li>
                  <li>✓ Specializations: {formData.specializations.length}</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Terms */}
            <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-xs">
                <strong>By submitting, you agree to:</strong>
                <ul className="mt-1 ml-4 list-disc space-y-0.5">
                  <li>Provide accurate and truthful information</li>
                  <li>Maintain professional standards</li>
                  <li>Respond to client inquiries within 48 hours</li>
                  <li>Update your availability status regularly</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
                <p className="mt-2">
                  Your listing will be reviewed and activated within 24-48 hours.
                </p>
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
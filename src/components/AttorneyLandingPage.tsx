import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { FooterDisclaimer } from './LegalDisclaimer';
import { 
  Scale, 
  Shield, 
  FileText, 
  Gavel, 
  BookOpen,
  Zap,
  Lock,
  TrendingUp,
  FileSearch,
  Brain,
  Search,
  ArrowRight,
  Star,
  Check,
  CheckCircle2,
  Users,
  BarChart3,
  Clock,
  Target,
  Award,
  Briefcase,
  FileStack,
  Lightbulb,
  ChevronDown,
  MessageSquare,
  Download
} from 'lucide-react';

interface AttorneyLandingPageProps {
  onGetStarted: () => void;
}

export function AttorneyLandingPage({ onGetStarted }: AttorneyLandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      {/* Professional Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="w-8 h-8 text-red-600" />
              <div>
                <div className="font-bold text-xl">The CPS Punisher</div>
                <div className="text-xs text-gray-600">Professional Legal Tools</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">Features</Button>
              <Button variant="ghost" size="sm">Pricing</Button>
              <Button onClick={onGetStarted} className="bg-red-600 hover:bg-red-700 text-white">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 via-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-red-100 text-red-700 hover:bg-red-200">
                  <Briefcase className="w-3 h-3 mr-1" />
                  For Family Law Attorneys
                </Badge>
                <h1 className="text-5xl md:text-6xl mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Supercharge Your CPS Defense Practice
                  </span>
                </h1>
                <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                  Westlaw-grade legal research, AI-powered document analysis, and comprehensive case management 
                  tools designed specifically for family law attorneys handling CPS cases.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button 
                    size="lg" 
                    onClick={onGetStarted}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg group"
                  >
                    <Shield className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Start 14-Day Free Trial
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="px-8 py-6 text-lg border-2 border-gray-300 hover:border-gray-400"
                  >
                    Schedule Demo
                  </Button>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Full access during trial</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <Card className="bg-white border-gray-200 shadow-2xl p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                      <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">AI Legal Research</div>
                        <div className="text-sm text-gray-600">Instant case law analysis</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <FileStack className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Document Automation</div>
                        <div className="text-sm text-gray-600">Generate motions & briefs</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Advanced Analytics</div>
                        <div className="text-sm text-gray-600">Track case outcomes</div>
                      </div>
                    </div>
                  </div>
                </Card>
                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-red-200 rounded-full blur-3xl opacity-50 -z-10" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50 -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 text-red-400">300+</div>
              <div className="text-sm text-gray-400">Law Firms Using</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 text-red-400">50k+</div>
              <div className="text-sm text-gray-400">Cases Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 text-red-400">87%</div>
              <div className="text-sm text-gray-400">Win Rate Increase</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 text-red-400">15hrs</div>
              <div className="text-sm text-gray-400">Saved Per Case</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features for Attorneys */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl mb-4">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Professional Tools Built for Attorneys
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to build stronger CPS defense cases, faster
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 border-2 border-gray-200 hover:border-red-300 transition-all hover:shadow-lg">
                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Westlaw-Grade Research</h3>
                <p className="text-gray-600 mb-4">
                  Access millions of court opinions, AI-powered Shepardizing, and instant citation networks. 
                  Find relevant case law in seconds, not hours.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>CourtListener API integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>AI semantic search</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Citation analysis & tracking</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-2 border-gray-200 hover:border-red-300 transition-all hover:shadow-lg">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Document Automation</h3>
                <p className="text-gray-600 mb-4">
                  Generate motions, briefs, and discovery requests with AI assistance. 
                  Automatically incorporate case law citations and client evidence.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Pre-built legal templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Auto-cite integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Client data merge</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-2 border-gray-200 hover:border-red-300 transition-all hover:shadow-lg">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Brain className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Document Analysis</h3>
                <p className="text-gray-600 mb-4">
                  Upload CPS reports and get instant violation detection, timeline extraction, 
                  and strategic recommendations for your defense.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>24 violation types tracked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Automatic timeline building</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Defense strategy generation</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-2 border-gray-200 hover:border-red-300 transition-all hover:shadow-lg">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">50-State Policy Engine</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive CPS regulations, procedures, and statutory requirements 
                  for all 50 states with full citation support.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>State-specific regulations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Citation-backed references</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Regular updates</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-2 border-gray-200 hover:border-red-300 transition-all hover:shadow-lg">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Analytics & Reporting</h3>
                <p className="text-gray-600 mb-4">
                  Track case outcomes, measure violation patterns, and generate 
                  comprehensive reports for your firm's performance analysis.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Outcome tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Pattern analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Custom reports</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-2 border-gray-200 hover:border-red-300 transition-all hover:shadow-lg">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Multi-User Collaboration</h3>
                <p className="text-gray-600 mb-4">
                  Built for teams. Share cases, delegate tasks, and collaborate 
                  seamlessly across your entire firm.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Unlimited team members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Role-based permissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Real-time sync</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Attorney Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl mb-4">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Trusted by Family Law Attorneys
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 border-2 border-gray-200 bg-white">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  "The Legal Research Pro feature alone is worth 10x the subscription cost. 
                  I'm finding case law that Westlaw missed, and the AI analysis saves me 15+ hours per case."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    RH
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Robert Henderson, Esq.</div>
                    <div className="text-sm text-gray-600">Henderson Family Law, California</div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 border-2 border-gray-200 bg-white">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  "Our firm's CPS defense practice has transformed. The document automation and 
                  violation detection give us a massive advantage. Clients are amazed at how thorough we are."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    MP
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Maria Perez, Esq.</div>
                    <div className="text-sm text-gray-600">Perez & Associates, Texas</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl mb-4">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Professional Pricing
                </span>
              </h2>
              <p className="text-xl text-gray-600">Flexible plans for solo practitioners and firms</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 border-2 border-gray-300">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Attorney Plan</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">$299</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-gray-600 mt-2">Perfect for solo practitioners</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Unlimited document uploads & analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Full Legal Research Pro access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Document generation with citations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>All 50 state policies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="w-full py-6 text-lg" variant="outline">
                  Start 14-Day Trial
                </Button>
              </Card>

              <Card className="p-8 border-2 border-red-600 relative overflow-hidden bg-gradient-to-br from-red-100 to-red-50">
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  BEST VALUE
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Enterprise Plan</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">$999</span>
                    <span className="text-gray-800">/month</span>
                  </div>
                  <p className="text-gray-800 mt-2">For law firms and teams</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="font-medium text-gray-900">Everything in Attorney, plus:</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-800">Unlimited team members</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-800">Advanced analytics & reporting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-800">Bulk data import/export</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-800">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-800">Custom integrations</span>
                  </li>
                </ul>
                <Button className="w-full py-6 text-lg bg-red-600 hover:bg-red-700 text-white">
                  Start 14-Day Trial
                </Button>
              </Card>
            </div>

            <p className="text-center text-gray-600 mt-8">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-red-600 to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl mb-6">
              Ready to Elevate Your CPS Defense Practice?
            </h2>
            <p className="text-xl mb-8 text-red-100">
              Join hundreds of family law attorneys who are winning more cases with The CPS Punisher.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-white text-red-600 hover:bg-gray-100 px-10 py-6 text-xl"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-10 py-6 text-xl"
              >
                Schedule Demo
              </Button>
            </div>
            <p className="text-red-100">
              Questions? Call us at (555) 123-4567 or email attorneys@cpspunisher.com
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-8 h-8 text-red-500" />
                <div className="font-bold text-lg">The CPS Punisher</div>
              </div>
              <p className="text-gray-400 text-sm">Professional legal tools for family law attorneys.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Case Studies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">Legal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400 space-y-2">
            <p>© 2024-2025 The CPS Punisher. All rights reserved.</p>
            <p className="font-semibold">Copyright Owner: DARREN GUAY</p>
            <p className="text-xs">Educational Tool - Not Legal Advice.</p>
          </div>
        </div>
      </footer>

      {/* Comprehensive Legal Disclaimer Footer */}
      <FooterDisclaimer />
    </div>
  );
}
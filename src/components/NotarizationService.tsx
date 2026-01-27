import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  FileCheck,
  Shield,
  Clock,
  DollarSign,
  CheckCircle2,
  ExternalLink,
  Video,
  Lock,
  Star,
  AlertCircle,
  FileText,
  Smartphone,
  Globe,
  Award,
  ChevronRight,
  HelpCircle,
  Calendar
} from 'lucide-react';

interface NotarizationServiceProps {
  onClose?: () => void;
}

export function NotarizationService({ onClose }: NotarizationServiceProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const notarizationServices = [
    {
      id: 'notarize',
      name: 'Notarize.com',
      rating: 4.8,
      reviews: 12500,
      price: '$25',
      time: '15 minutes',
      available: '24/7',
      logo: '🔷',
      url: 'https://www.notarize.com',
      features: [
        'Legal in all 50 states',
        'Available 24/7/365',
        'Average 15-min completion',
        'Bank-level security',
        'Court-admissible',
        'Mobile & desktop friendly',
        'Trusted by major law firms',
        'ID verification included'
      ],
      bestFor: 'Court documents, affidavits, custody papers',
      description: 'Industry leader in online notarization, trusted by Fortune 500 companies and legal professionals nationwide.',
      verified: true
    },
    {
      id: 'proof',
      name: 'Proof.com',
      rating: 4.7,
      reviews: 8200,
      price: '$25',
      time: '10 minutes',
      available: '24/7',
      logo: '✓',
      url: 'https://www.proof.com',
      features: [
        'Real-time video notarization',
        'Blockchain-secured records',
        'Multi-language support',
        'Electronic seal & signature',
        'Instant PDF delivery',
        'Audit trail included',
        'MISMO certified',
        'Veteran-owned business'
      ],
      bestFor: 'Federal documents, sworn statements',
      description: 'Advanced blockchain technology ensures permanent, tamper-proof notarization records.',
      verified: true
    },
    {
      id: 'notarycam',
      name: 'NotaryCam',
      rating: 4.6,
      reviews: 6800,
      price: '$25-$99',
      time: '5-15 minutes',
      available: '24/7',
      logo: '📹',
      url: 'https://www.notarycam.com',
      features: [
        'Live video notary sessions',
        'Compliant in all states',
        'Same-day service',
        'Business account options',
        'Bulk document discounts',
        'API integration available',
        'Premium support',
        '10-year record retention'
      ],
      bestFor: 'Multiple documents, business accounts',
      description: 'Flexible pricing for individuals and legal professionals handling multiple cases.',
      verified: true
    }
  ];

  const commonDocumentsForNotarization = [
    'Affidavits & Sworn Statements',
    'Custody Modification Petitions',
    'Court Motions & Briefs',
    'Power of Attorney Documents',
    'Parental Consent Forms',
    'Character Reference Letters',
    'Income & Employment Verification',
    'Home Study Declarations',
    'Travel Permission Letters',
    'Medical Authorization Forms'
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Upload Your Document',
      description: 'Upload the document you need notarized (PDF format recommended)',
      icon: FileText
    },
    {
      step: 2,
      title: 'Verify Your Identity',
      description: 'Provide a valid government-issued photo ID for verification',
      icon: Shield
    },
    {
      step: 3,
      title: 'Meet Notary via Video',
      description: 'Connect with a licensed notary through secure video call',
      icon: Video
    },
    {
      step: 4,
      title: 'Sign & Get Notarized',
      description: 'Sign your document electronically while the notary witnesses and seals it',
      icon: FileCheck
    }
  ];

  const handleSelectService = (serviceId: string, url: string) => {
    setSelectedService(serviceId);
    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="bg-blue-600/10 border-blue-600/30 text-blue-400 mb-4">
            <FileCheck className="w-3 h-3 mr-1" />
            Online Notarization Services
          </Badge>
          <h1 className="text-4xl md:text-5xl mb-4">
            <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              Get Your CPS Documents Notarized Online
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Legal, secure, and available 24/7. Connect with licensed notaries from anywhere in the United States.
          </p>
        </div>

        {/* Why Online Notarization Alert */}
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-950/20 border-blue-600/30 p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Why Online Notarization for CPS Cases?</h3>
              <p className="text-gray-300 mb-3">
                When dealing with CPS proceedings, many documents require notarization including affidavits, sworn statements, 
                custody petitions, and federal civil rights claims. Online notarization is legally recognized in all 50 states 
                and provides the same legal validity as in-person notarization.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="bg-blue-600/10 border-blue-600/30 text-blue-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Legally Binding
                </Badge>
                <Badge variant="outline" className="bg-blue-600/10 border-blue-600/30 text-blue-300">
                  <Shield className="w-3 h-3 mr-1" />
                  Court Admissible
                </Badge>
                <Badge variant="outline" className="bg-blue-600/10 border-blue-600/30 text-blue-300">
                  <Clock className="w-3 h-3 mr-1" />
                  Available 24/7
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-3xl mb-8 text-center">
            <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              How Online Notarization Works
            </span>
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((item) => (
              <Card key={item.step} className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 p-6 text-center">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-400 mb-2">Step {item.step}</div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Notarization Services */}
        <div className="mb-12">
          <h2 className="text-3xl mb-8 text-center">
            <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              Recommended Online Notary Services
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {notarizationServices.map((service) => (
              <Card 
                key={service.id}
                className={`bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-600/50 transition-all p-6 ${
                  selectedService === service.id ? 'border-blue-600 ring-2 ring-blue-600/50' : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{service.logo}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        {service.name}
                        {service.verified && (
                          <Badge variant="outline" className="bg-green-600/10 border-green-600/30 text-green-400 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < Math.floor(service.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">{service.rating} ({service.reviews.toLocaleString()} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4">{service.description}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-800/50 rounded p-2 text-center">
                    <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-400">Price</div>
                    <div className="text-sm font-semibold text-white">{service.price}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2 text-center">
                    <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-400">Time</div>
                    <div className="text-sm font-semibold text-white">{service.time}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2 text-center">
                    <Calendar className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-400">Available</div>
                    <div className="text-sm font-semibold text-white">{service.available}</div>
                  </div>
                </div>

                {/* Best For */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-400 mb-2">BEST FOR:</div>
                  <p className="text-sm text-white">{service.bestFor}</p>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 mb-2">FEATURES:</div>
                  <ul className="space-y-1.5">
                    {service.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectService(service.id, service.url)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  Visit {service.name}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Common Documents */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 p-8 mb-8">
          <h2 className="text-2xl mb-6 text-center">
            <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              Common CPS Documents Requiring Notarization
            </span>
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {commonDocumentsForNotarization.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-gray-800/50 rounded p-3">
                <FileCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300">{doc}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 p-6">
            <Lock className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Bank-Level Security</h3>
            <p className="text-gray-400 text-sm">
              256-bit encryption, secure video connections, and tamper-proof digital seals protect your sensitive documents.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 p-6">
            <Globe className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Valid in All 50 States</h3>
            <p className="text-gray-400 text-sm">
              Online notarizations are legally recognized nationwide and accepted by all courts, government agencies, and institutions.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 p-6">
            <Clock className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Available 24/7/365</h3>
            <p className="text-gray-400 text-sm">
              Need a document notarized at midnight or on weekends? Online notaries are available around the clock.
            </p>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 p-8 mb-8">
          <h2 className="text-2xl mb-6 text-center">
            <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Is online notarization legally valid for CPS court documents?",
                a: "Yes! Online notarization is legally recognized in all 50 states and produces documents that are court-admissible. The Securing and Enabling Commerce Online (SECURE) Notarization Act authorizes remote online notarization nationwide."
              },
              {
                q: "What do I need to get a document notarized online?",
                a: "You need: (1) A valid government-issued photo ID (driver's license, passport, state ID), (2) Your document in digital format (PDF recommended), (3) A device with camera and microphone, and (4) Stable internet connection."
              },
              {
                q: "How much does online notarization cost?",
                a: "Most services charge $25 per notarization for standard documents. Some services offer bulk discounts or subscription plans if you need multiple documents notarized regularly."
              },
              {
                q: "Can I use online notarization for federal Section 1983 lawsuits?",
                a: "Yes! Online notarized documents are accepted in federal courts. Your affidavits, declarations, and sworn statements will be legally binding and court-admissible."
              },
              {
                q: "How long does the process take?",
                a: "Most online notarizations are completed in 10-15 minutes. You'll receive your notarized document immediately via email in PDF format with the official notary seal."
              }
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-gray-700 last:border-0 pb-4 last:pb-0">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Important Note */}
        <Card className="bg-gradient-to-br from-red-900/20 to-red-950/20 border-red-600/30 p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Important Reminders</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Read your document carefully before signing - you cannot make changes after notarization</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Have your photo ID ready - the notary will verify your identity via video call</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Save multiple copies of your notarized documents in secure locations</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Consult with your attorney before notarizing legal documents for your CPS case</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Back Button */}
        {onClose && (
          <div className="text-center">
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
            >
              Back to Dashboard
            </Button>
          </div>
        )}

        {/* Copyright */}
        <div className="text-center mt-12 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500">
            © 2024-2025 The CPS Punisher. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Copyright Owner: DARREN GUAY
          </p>
          <p className="text-xs text-gray-600 mt-2">
            <Shield className="w-3 h-3 inline mr-1" />
            These are independent third-party services. The CPS Punisher is not affiliated with any notary service.
          </p>
        </div>
      </div>
    </div>
  );
}

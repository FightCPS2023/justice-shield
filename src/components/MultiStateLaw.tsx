import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Map, Scale, BookOpen, AlertCircle, CheckCircle2, Lock, Crown } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function MultiStateLaw() {
  const { isAttorney } = useSubscription();
  const [state1, setState1] = useState('Texas');
  const [state2, setState2] = useState('California');
  const [compareCategory, setCompareCategory] = useState('removal');

  if (!isAttorney) {
    return (
      <Card className="p-8 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl mb-2">Attorney Suite Feature</h3>
        <p className="text-muted-foreground mb-4">
          Multi-State Law Comparison is available exclusively for Attorney Suite subscribers.
        </p>
        <Button>
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Attorney Suite
        </Button>
      </Card>
    );
  }

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  const categories = [
    { value: 'removal', label: 'Emergency Removal Standards', icon: AlertCircle },
    { value: 'burden', label: 'Burden of Proof', icon: Scale },
    { value: 'reasonable-efforts', label: 'Reasonable Efforts Requirements', icon: CheckCircle2 },
    { value: 'termination', label: 'Termination of Parental Rights', icon: AlertCircle },
    { value: 'visitation', label: 'Visitation Rights', icon: CheckCircle2 },
    { value: 'appeals', label: 'Appeal Deadlines & Procedures', icon: BookOpen },
    { value: 'ada', label: 'ADA Accommodation Requirements', icon: CheckCircle2 }
  ];

  // Mock comparison data
  const comparisonData: any = {
    removal: {
      Texas: {
        standard: 'Immediate Danger',
        statute: 'Texas Family Code § 262.104',
        details: 'CPS may remove a child without a court order if there is an immediate danger to the physical health or safety of the child.',
        warrantRequired: false,
        courtApprovalTimeframe: '1 business day (emergency hearing)',
        exigentCircumstances: 'Required - Must show child would be injured before warrant obtained',
        parentNoticeRequired: true,
        appealRights: 'Immediate appeal to district court'
      },
      California: {
        standard: 'Immediate Danger + No Reasonable Means',
        statute: 'California Welfare & Institutions Code § 305',
        details: 'Officer may take child into temporary custody without warrant when there is immediate danger and no time to petition the court.',
        warrantRequired: false,
        courtApprovalTimeframe: 'Within 48 hours (excluding weekends)',
        exigentCircumstances: 'Required - Must show no reasonable means to protect child',
        parentNoticeRequired: true,
        appealRights: 'Writ petition to appellate court'
      }
    },
    burden: {
      Texas: {
        removalHearing: 'Preponderance of Evidence',
        adjudication: 'Preponderance of Evidence',
        termination: 'Clear and Convincing Evidence',
        statute: 'Texas Family Code § 161.001',
        shiftingBurden: 'Burden on CPS to prove allegations; burden shifts to parent to prove reunification at permanency stage'
      },
      California: {
        removalHearing: 'Prima Facie Case',
        adjudication: 'Preponderance of Evidence',
        termination: 'Clear and Convincing Evidence',
        statute: 'Cal. Welf. & Inst. Code § 361.5',
        shiftingBurden: 'CPS has burden initially; at 18-month review, burden may shift to parent'
      }
    }
  };

  const currentComparison = comparisonData[compareCategory];
  const data1 = currentComparison?.[state1];
  const data2 = currentComparison?.[state2];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <Map className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="mb-2 text-green-900 flex items-center gap-2">
              Multi-State Law Comparison Engine
              <Badge className="bg-green-600 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Attorney Suite
              </Badge>
            </div>
            <p className="text-sm text-green-800">
              Compare CPS statutes, procedures, and requirements across different jurisdictions. Essential 
              for attorneys practicing in multiple states or handling interstate cases.
            </p>
          </div>
        </div>
      </Card>

      {/* Selection Controls */}
      <Card className="p-5">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm mb-2 block">State 1</label>
            <Select value={state1} onValueChange={setState1}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {states.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm mb-2 block">State 2</label>
            <Select value={state2} onValueChange={setState2}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {states.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm mb-2 block">Category</label>
            <Select value={compareCategory} onValueChange={setCompareCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Comparison Results */}
      {compareCategory === 'removal' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* State 1 */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xl">{state1}</div>
              <Badge variant="outline">{data1?.statute}</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Removal Standard</div>
                <div className="font-semibold">{data1?.standard}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Statutory Authority</div>
                <div className="text-sm">{data1?.statute}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Details</div>
                <p className="text-sm">{data1?.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Warrant Required?</div>
                  <Badge variant={data1?.warrantRequired ? 'default' : 'destructive'}>
                    {data1?.warrantRequired ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Parent Notice?</div>
                  <Badge variant={data1?.parentNoticeRequired ? 'default' : 'destructive'}>
                    {data1?.parentNoticeRequired ? 'Required' : 'Not Required'}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Court Approval Timeframe</div>
                <div className="text-sm">{data1?.courtApprovalTimeframe}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Exigent Circumstances</div>
                <div className="text-sm">{data1?.exigentCircumstances}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Appeal Rights</div>
                <div className="text-sm">{data1?.appealRights}</div>
              </div>
            </div>
          </Card>

          {/* State 2 */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xl">{state2}</div>
              <Badge variant="outline">{data2?.statute}</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Removal Standard</div>
                <div className="font-semibold">{data2?.standard}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Statutory Authority</div>
                <div className="text-sm">{data2?.statute}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Details</div>
                <p className="text-sm">{data2?.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Warrant Required?</div>
                  <Badge variant={data2?.warrantRequired ? 'default' : 'destructive'}>
                    {data2?.warrantRequired ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Parent Notice?</div>
                  <Badge variant={data2?.parentNoticeRequired ? 'default' : 'destructive'}>
                    {data2?.parentNoticeRequired ? 'Required' : 'Not Required'}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Court Approval Timeframe</div>
                <div className="text-sm">{data2?.courtApprovalTimeframe}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Exigent Circumstances</div>
                <div className="text-sm">{data2?.exigentCircumstances}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Appeal Rights</div>
                <div className="text-sm">{data2?.appealRights}</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {compareCategory === 'burden' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* State 1 - Burden of Proof */}
          <Card className="p-6">
            <div className="mb-4">
              <div className="text-xl mb-2">{state1}</div>
              <Badge variant="outline">{data1?.statute}</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Removal Hearing</div>
                <Badge className="bg-blue-100 text-blue-800">{data1?.removalHearing}</Badge>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Adjudication</div>
                <Badge className="bg-green-100 text-green-800">{data1?.adjudication}</Badge>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Termination of Parental Rights</div>
                <Badge className="bg-red-100 text-red-800">{data1?.termination}</Badge>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">Burden Shifting</div>
                <p className="text-sm">{data1?.shiftingBurden}</p>
              </div>
            </div>
          </Card>

          {/* State 2 - Burden of Proof */}
          <Card className="p-6">
            <div className="mb-4">
              <div className="text-xl mb-2">{state2}</div>
              <Badge variant="outline">{data2?.statute}</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Removal Hearing</div>
                <Badge className="bg-blue-100 text-blue-800">{data2?.removalHearing}</Badge>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Adjudication</div>
                <Badge className="bg-green-100 text-green-800">{data2?.adjudication}</Badge>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Termination of Parental Rights</div>
                <Badge className="bg-red-100 text-red-800">{data2?.termination}</Badge>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">Burden Shifting</div>
                <p className="text-sm">{data2?.shiftingBurden}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Key Differences Summary */}
      <Card className="p-6 bg-amber-50 border-amber-200">
        <div className="mb-3 flex items-center gap-2 text-amber-900">
          <AlertCircle className="w-5 h-5" />
          <span>Key Differences Summary</span>
        </div>
        <div className="space-y-2 text-sm text-amber-800">
          {compareCategory === 'removal' && (
            <>
              <p>• <strong>Standard:</strong> {state1} requires "{data1?.standard}" while {state2} requires "{data2?.standard}"</p>
              <p>• <strong>Timeframe:</strong> {state1} requires court approval within {data1?.courtApprovalTimeframe} vs. {state2}'s {data2?.courtApprovalTimeframe}</p>
              <p>• <strong>Both states</strong> do not require warrants for emergency removals, but require demonstration of exigent circumstances</p>
            </>
          )}
          {compareCategory === 'burden' && (
            <>
              <p>• <strong>Removal Stage:</strong> {state1} uses {data1?.removalHearing} vs. {state2}'s {data2?.removalHearing}</p>
              <p>• <strong>Termination:</strong> Both states require {data1?.termination} for TPR</p>
              <p>• <strong>Burden Shifting:</strong> Significant differences in when/how burden shifts between agency and parent</p>
            </>
          )}
        </div>
      </Card>

      {/* Practice Note */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="mb-3 flex items-center gap-2 text-blue-900">
          <Scale className="w-5 h-5" />
          <span>Practice Note</span>
        </div>
        <p className="text-sm text-blue-800">
          This comparison tool is for informational and research purposes only. Always verify current 
          statutes, case law, and local court rules in your jurisdiction. Laws change frequently and 
          may have been amended since this data was compiled. Consult primary sources before relying 
          on this information.
        </p>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, UserPlus, Globe } from 'lucide-react';
import { AdvocateDirectory } from './AdvocateDirectory';
import { AdvocateSignup } from './AdvocateSignup';
import { ResourceLinks } from './ResourceLinks';

interface CommunityHubProps {
  userState: string;
}

export function CommunityHub({ userState }: CommunityHubProps) {
  const [showSignup, setShowSignup] = useState(false);

  if (showSignup) {
    return (
      <AdvocateSignup
        onSuccess={() => {
          setShowSignup(false);
        }}
        onCancel={() => setShowSignup(false)}
      />
    );
  }

  return (
    <Tabs defaultValue="directory" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="directory" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Find Help</span>
          <span className="sm:hidden">Directory</span>
        </TabsTrigger>
        <TabsTrigger value="signup" className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Join Directory</span>
          <span className="sm:hidden">Join</span>
        </TabsTrigger>
        <TabsTrigger value="resources" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">Resource Links</span>
          <span className="sm:hidden">Links</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="directory" className="mt-6">
        <AdvocateDirectory userState={userState} onSignUp={() => setShowSignup(true)} />
      </TabsContent>

      <TabsContent value="signup" className="mt-6">
        <AdvocateSignup
          onSuccess={() => {
            // Optionally switch back to directory tab
          }}
          onCancel={() => {
            // Stay on current tab
          }}
        />
      </TabsContent>

      <TabsContent value="resources" className="mt-6">
        <ResourceLinks userState={userState} />
      </TabsContent>
    </Tabs>
  );
}

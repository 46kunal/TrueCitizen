import { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { IssueCard } from "../IssueCard";
import { Bell, ArrowLeft } from "lucide-react";
import trueCitizenLogo from "@/assets/remove all white bac.png";
import { supabase } from '@/supabase';
import { Skeleton } from '../ui/skeleton';
import { IssueDetails } from '../IssueDetails';
import { Button } from '../ui/button';
import { IssueProgress } from '../IssueProgress'; 
import { IssueUpdates } from '../IssueUpdates'; // <-- ADD THIS IMPORT

// Define a type for comments that includes the user's role
type Comment = {
  id: string;
  created_at: string;
  content: string;
  users: {
    role: 'citizen' | 'admin';
  } | null;
};

// Define a type that combines an issue with its comments
// We keep this structure, but the initial fetch will simplify the data
type IssueWithComments = {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  location_lat: number | null;
  location_long: number | null;
  status: 'pending' | 'assigned' | 'resolved';
  created_at: string;
  comments: Comment[]; // This will be an empty array on the list view initial fetch
};

interface TrackScreenProps {
  filter?: 'reported' | 'resolved';
}

export const TrackScreen = ({ filter }: TrackScreenProps) => {
  const [myIssues, setMyIssues] = useState<IssueWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<IssueWithComments | null>(null);

  // Function to fetch the detailed issue data (including comments) when a card is clicked
  const fetchIssueDetails = async (issueId: string): Promise<IssueWithComments | null> => {
    const { data, error } = await supabase
        .from('issues')
        .select(`
            *,
            comments (
                id,
                created_at,
                content,
                users ( role )
            )
        `)
        .eq('id', issueId)
        .single();
    
    if (error) {
        console.error("Error fetching issue details:", error.message);
        return null;
    }
    return data as IssueWithComments;
  };
  
  const handleIssueClick = async (issue: IssueWithComments) => {
    // Only open the detail view if we are not actively filtering by resolved (to simplify UI for now)
    if (filter !== 'resolved') {
        const details = await fetchIssueDetails(issue.id);
        if (details) {
            setSelectedIssue(details);
        }
    }
  }

  useEffect(() => {
    const fetchMyIssues = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        let query = supabase
          .from('issues')
          .select(`*`) // FIX: SIMPLIFIED SELECT - only fetch the base issue data to prevent RLS errors
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (filter) {
            if (filter === 'resolved') {
                query = query.eq('status', 'resolved');
            }
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching user's issues:", error.message);
        } else {
          // Map data to the correct type, adding an empty comments array
          const issuesWithEmptyComments = (data || []).map(issue => ({
              ...issue,
              comments: [] as Comment[]
          }));
          setMyIssues(issuesWithEmptyComments as IssueWithComments[]);
        }
      }
      setLoading(false);
    };

    fetchMyIssues();
  }, [filter]);

  return (
    <div className="min-h-screen gradient-background pb-24">
      <div className="px-4 pt-6 pb-4 bg-white/50">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
            <img src={trueCitizenLogo} alt="Logo" className="h-10 w-10"/>
            <h1 className="text-xl font-bold text-foreground">My Issues</h1>
          </div>
          <Button variant="ghost" size="icon"><Bell className="h-6 w-6" /></Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {selectedIssue ? (
            <IssueDetails issue={selectedIssue} onBack={() => setSelectedIssue(null)} />
        ) : (
          <>
            <h2 className="text-2xl font-bold">
                {filter === 'resolved' ? 'Resolved Issues' : 'All My Issues'}
            </h2>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : myIssues.length > 0 ? (
              myIssues.map((issue) => (
                <div key={issue.id} className="cursor-pointer" onClick={() => handleIssueClick(issue)}>
                    <IssueCard 
                        title={issue.title}
                        description={issue.description}
                        location={issue.location_lat ? `${issue.location_lat.toFixed(2)}, ${issue.location_long?.toFixed(2)}` : 'N/A'}
                        status={issue.status}
                        image={issue.image_url || undefined}
                        date={new Date(issue.created_at).toLocaleDateString()}
                    />
                    <IssueProgress status={issue.status} />
                    <IssueUpdates status={issue.status} createdAt={issue.created_at} />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center pt-8">You haven't reported any issues yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
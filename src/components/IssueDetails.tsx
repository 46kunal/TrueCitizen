import { useState } from 'react';
import { Card } from "./ui/card";
import { IssueCard } from "./IssueCard";
import { ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from '@/supabase';
import { Skeleton } from './ui/skeleton';

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
interface IssueWithComments {
    id: string;
    title: string;
    description: string;
    category: string;
    image_url: string | null;
    location_lat: number | null;
    location_long: number | null;
    status: 'pending' | 'assigned' | 'resolved';
    created_at: string;
    comments: Comment[];
}

interface IssueDetailsProps {
    issue: IssueWithComments;
    onBack: () => void;
}

export const IssueDetails = ({ issue, onBack }: IssueDetailsProps) => {
    const [feedback, setFeedback] = useState<'confirmed' | 'reopened' | null>(null);

    const handleFeedback = async (status: 'confirmed' | 'reopened') => {
        setFeedback(status);
        
        if (status === 'reopened') {
          const { error } = await supabase
            .from('issues')
            .update({ status: 'pending' })
            .eq('id', issue.id);
    
          if (error) {
            console.error("Error reopening issue:", error);
            setFeedback(null);
          }
        }
    };
    
    return (
        <Card className="bg-white/70 p-4 rounded-lg space-y-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-6 w-6"/>
            </Button>
            <IssueCard 
                title={issue.title}
                description={issue.description}
                location={issue.location_lat ? `${issue.location_lat.toFixed(2)}, ${issue.location_long?.toFixed(2)}` : 'N/A'}
                status={issue.status}
                image={issue.image_url || undefined}
                date={new Date(issue.created_at).toLocaleDateString()}
            />
            
            {issue.comments && issue.comments.length > 0 && (
                <div>
                    <h4 className="font-bold mb-2">Updates</h4>
                    <div className="space-y-2">
                        {issue.comments.map((comment) => (
                            <div key={comment.id} className={`flex items-start gap-3 p-2 rounded-lg ${comment.users?.role === 'admin' ? 'bg-blue-100' : ''}`}>
                                <MessageSquare className={`h-4 w-4 mt-1 flex-shrink-0 ${comment.users?.role === 'admin' ? 'text-blue-600' : 'text-gray-500'}`} />
                                <p className="text-sm">{comment.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {issue.status === 'resolved' && (
                <div className="border-t pt-3 mt-3">
                    <h4 className="font-semibold text-sm mb-2">Is this issue resolved?</h4>
                    {!feedback ? (
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleFeedback('confirmed')}>
                                <ThumbsUp className="h-4 w-4 mr-2"/> Yes, it's fixed!
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleFeedback('reopened')}>
                                <ThumbsDown className="h-4 w-4 mr-2"/> No, reopen please.
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm font-medium" style={{color: feedback === 'confirmed' ? 'green' : 'red'}}>
                            {feedback === 'confirmed' ? "Thank you for your feedback!" : "This issue has been reopened."}
                        </p>
                    )}
                </div>
            )}
        </Card>
    );
};
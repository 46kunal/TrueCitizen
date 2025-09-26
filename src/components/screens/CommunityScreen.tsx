import { useState, useEffect, useCallback } from "react";
import { Map, List, MapPin, ThumbsUp, MessageSquare, ArrowLeft, Filter, SortAsc } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { supabase } from "@/supabase";
import { Skeleton } from "../ui/skeleton";
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";

// Jharkhand Coordinates: Ranchi
const JHARKHAND_COORDS = { lat: 23.3441, lng: 85.3096 };

const categories = [
  "all", 
  "road",
  "garbage",
  "streetlight",
  "water",
  "other",
];

type SortOption = "date_desc" | "upvotes_desc";
type FilterOption = "all" | "road" | "garbage" | "streetlight" | "water" | "other";

// Extend the Issue type to include the upvote count and comments
type CommunityIssue = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  location_lat: number;
  location_long: number;
  created_at: string;
  upvote_count: number;
  comments: Comment[];
  category: FilterOption;
};

type Comment = {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
};

// Map View Component
const MapView = ({ issues, userLocation }: { issues: CommunityIssue[], userLocation: { lat: number, lng: number } | null }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  // Use Jharkhand coordinates if user location is null
  const center = userLocation || JHARKHAND_COORDS;

  if (!isLoaded) {
    return <Skeleton className="h-96 w-full rounded-lg" />;
  }
  
  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={14}
        options={{ streetViewControl: false, mapTypeControl: false }}
      >
        <MarkerF position={center} />
        {issues.map(issue => {
          if (issue.location_lat && issue.location_long) {
            return (
              <MarkerF 
                key={issue.id} 
                position={{ lat: issue.location_lat, lng: issue.location_long }}
                title={issue.title}
              />
            )
          }
          return null;
        })}
      </GoogleMap>
    </div>
  );
};

// List View Component
// FIX 1: Renamed onSelectIssue to onIssueSelect in the prop interface
const ListView = ({ issues, setIssues, loading, onIssueSelect, sortOption, setSortOption, filterOption, setFilterOption }: 
  { 
    issues: CommunityIssue[], 
    setIssues: React.Dispatch<React.SetStateAction<CommunityIssue[]>>, 
    loading: boolean, 
    onIssueSelect: (issue: CommunityIssue) => void, // FIX 2: Corrected the prop name here
    sortOption: SortOption,
    setSortOption: (sort: SortOption) => void,
    filterOption: FilterOption,
    setFilterOption: (filter: FilterOption) => void,
  }) => {
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

   useEffect(() => {
    const fetchUserVotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
       if(user) {
        setUserId(user.id)
        const { data: votesData, error: votesError } = await supabase
          .from('upvotes')
          .select('issue_id')
          .eq('user_id', user.id);

        if (votesError) {
          console.error("Error fetching user votes:", votesError.message);
        } else {
          setUserVotes(new Set(votesData.map(v => v.issue_id)));
        }
      }
    }
    fetchUserVotes()
   }, [])


  const handleVote = async (issueId: string) => {
    if (!userId) return;

    const hasVoted = userVotes.has(issueId);
    
    const newVotes = new Set(userVotes);
    setIssues(prevIssues => prevIssues.map(issue => {
        if (issue.id === issueId) {
            return { ...issue, upvote_count: issue.upvote_count + (hasVoted ? -1 : 1) };
        }
        return issue;
    }));

    if (hasVoted) {
        newVotes.delete(issueId);
        setUserVotes(newVotes);
        await supabase.from('upvotes').delete().match({ user_id: userId, issue_id: issueId });
    } else {
        newVotes.add(issueId);
        setUserVotes(newVotes);
        await supabase.from('upvotes').insert({ user_id: userId, issue_id: issueId });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  // Filter issues based on selected category before rendering
  const filteredIssues = issues.filter(issue => 
    filterOption === 'all' || issue.category === filterOption
  );

  return (
    <div className="space-y-4">
      {/* Filter and Sort Controls */}
      <div className="flex justify-between items-center gap-3">
        {/* Filter by Category */}
        <div className="flex items-center gap-2 flex-1">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select onValueChange={setFilterOption} value={filterOption}>
            <SelectTrigger className="h-9 w-full bg-white/90">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Sort By */}
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <Select onValueChange={setSortOption} value={sortOption}>
            <SelectTrigger className="h-9 w-32 bg-white/90">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Newest</SelectItem>
              <SelectItem value="upvotes_desc">Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Separator />

      {filteredIssues.length > 0 ? (
        filteredIssues.map((issue) => (
          <Card key={issue.id} className="gradient-card shadow-card p-4 hover:shadow-lg transition-shadow duration-300">
            <div className="flex gap-3 items-center">
              {/* FIX 3: Called the correct prop name: onIssueSelect */}
              <div className="flex-1 min-w-0" onClick={() => onIssueSelect(issue)}> 
                <h3 className="font-semibold text-foreground leading-tight mb-2">{issue.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {issue.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{issue.location_lat ? `${issue.location_lat.toFixed(2)}, ${issue.location_long?.toFixed(2)}` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{issue.comments.length}</span>
                    </div>
                    <Button
                      variant={userVotes.has(issue.id) ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleVote(issue.id); }}
                      className="h-8 px-3"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      {issue.upvote_count}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <p className="text-muted-foreground text-center pt-8">No issues found matching your criteria.</p>
      )}
    </div>
  );
};

const IssueDetailView = ({ issue, onBack }: { issue: CommunityIssue, onBack: () => void }) => {
    const [comments, setComments] = useState<Comment[]>(issue.comments);
    const [newComment, setNewComment] = useState("");
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const subscription = supabase
            .channel('public:comments')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `issue_id=eq.${issue.id}` }, (payload: { new: Comment }) => {
                setComments((prevComments) => [...prevComments, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [issue.id]);

    const handleCommentSubmit = async () => {
        if (!newComment.trim() || !userId) return;

        const { error } = await supabase.from('comments').insert({
            content: newComment,
            issue_id: issue.id,
            user_id: userId,
        });

        if (error) {
            console.error("Error submitting comment:", error.message);
        } else {
            setNewComment("");
        }
    };

    return (
        <div className="space-y-4">
            <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Card className="gradient-card shadow-card p-4 space-y-3">
                <h3 className="text-xl font-bold">{issue.title}</h3>
                <p className="text-sm text-muted-foreground">{issue.description}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{issue.location_lat ? `${issue.location_lat.toFixed(2)}, ${issue.location_long?.toFixed(2)}` : 'N/A'}</span>
                </div>
            </Card>

            <Card className="p-4 space-y-4">
                <h4 className="font-semibold text-lg">Comments</h4>
                <div className="max-h-60 overflow-y-auto space-y-3">
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className="bg-gray-100 p-2 rounded-lg">
                                <p className="text-sm">{comment.content}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No comments yet.</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Textarea 
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="resize-none"
                    />
                    <Button onClick={handleCommentSubmit}>Send</Button>
                </div>
            </Card>
        </div>
    );
};


// Main Community Screen Component
export const CommunityScreen = () => {
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<CommunityIssue | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');

  const fetchNearbyIssues = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('issues')
      .select(`
          id, title, description, image_url, location_lat, location_long, created_at, category, status,
          upvote_count:upvotes(count), comments(count)
      `)
      .limit(20); 

    // Apply Sorting
    if (sortOption === 'upvotes_desc') {
        query = query.order('upvote_count', { foreignTable: 'upvotes', ascending: false });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    const { data: issuesData, error } = await query;

    if (error) {
      console.error("Error fetching nearby issues (DIRECT SELECT):", error.message);
    } else if (issuesData) {
      
      const issuesWithFlattenedData = (issuesData as any[]).map((issue: any) => ({
        ...issue,
        upvote_count: issue.upvote_count[0]?.count || 0,
        comments: [], // Set empty array for list view
      }));
      
      setIssues(issuesWithFlattenedData as CommunityIssue[]);
    }
    setLoading(false);
  }, [sortOption]); // Re-run fetch when sort option changes

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation(JHARKHAND_COORDS); 
        }
      );
    } else {
      setUserLocation(JHARKHAND_COORDS);
    }
  }, []);

  useEffect(() => {
    fetchNearbyIssues();
  }, [fetchNearbyIssues]);

  return (
    <div className="min-h-screen gradient-background pb-20">
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-foreground">Nearby Issues</h1>
        <p className="text-muted-foreground">See what's happening around you</p>
      </div>

      <div className="px-6">
        {selectedIssue ? (
            <IssueDetailView issue={selectedIssue} onBack={() => setSelectedIssue(null)} />
        ) : (
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="list"><List className="h-4 w-4 mr-2" />List View</TabsTrigger>
                <TabsTrigger value="map"><Map className="h-4 w-4 mr-2" />Map View</TabsTrigger>
              </TabsList>
              <TabsContent value="list">
                  {/* FIX 4: Passed the correct prop name: onIssueSelect */}
                  <ListView 
                      issues={issues} 
                      setIssues={setIssues} 
                      loading={loading} 
                      onIssueSelect={setSelectedIssue} // FIX: Renamed prop here
                      sortOption={sortOption}
                      setSortOption={setSortOption}
                      filterOption={filterOption}
                      setFilterOption={setFilterOption}
                  />
              </TabsContent>
              <TabsContent value="map"><MapView issues={issues} userLocation={userLocation} /></TabsContent>
            </Tabs>
        )}
      </div>
    </div>
  );
};
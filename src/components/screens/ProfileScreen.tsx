import { useState, useEffect } from "react";
import { User, Shield, CheckCircle, Award, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { supabase } from "@/supabase";
import { Skeleton } from "../ui/skeleton";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

const chartConfig = {
  reported: {
    label: "Reported Issues",
    color: "hsl(var(--primary))",
  },
  resolved: {
    label: "Resolved Issues",
    color: "hsl(var(--secondary))",
  },
};

export const ProfileScreen = () => {
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
  const [stats, setStats] = useState({ issuesReported: 0, issuesResolved: 0, impactScore: 0 });
  const [loading, setLoading] = useState(true);
  const [issueHistory, setIssueHistory] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        // Fetch profile from 'users' table
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', authUser.id)
          .single();
        
        if (profileError) console.error("Error fetching profile", profileError);

        setUser({
          name: profileData?.name || authUser.email || 'Citizen',
          email: authUser.email || 'No email provided',
          avatar: authUser.user_metadata.avatar_url || '/placeholder.svg'
        });

        // Fetch user issues for stats and history
        const { data: issuesData, error: issuesError } = await supabase
          .from('issues')
          .select('status, created_at')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: true });
        
        if (issuesError) {
          console.error("Error fetching issues stats", issuesError);
        } else {
          const issuesReported = issuesData.length;
          const issuesResolved = issuesData.filter(i => i.status === 'resolved').length;
          setStats({
            issuesReported,
            issuesResolved,
            impactScore: (issuesResolved * 10) + issuesReported,
          });

          // Prepare data for the chart
          const data = issuesData.reduce((acc, issue) => {
            const date = new Date(issue.created_at).toLocaleDateString();
            const lastEntry = acc[acc.length - 1] || { date, reported: 0, resolved: 0 };
            
            // Start a new entry if the date is different
            if (lastEntry.date !== date) {
                acc.push({ date, reported: lastEntry.reported, resolved: lastEntry.resolved });
                lastEntry.date = date; // Update last entry to reflect the new day
            }

            if (issue.status === 'resolved') {
                lastEntry.resolved++;
            }
            lastEntry.reported++;
            
            return acc;
          }, []);
          setIssueHistory(data);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading || !user) {
    return (
       <div className="min-h-screen gradient-background pb-24 p-6">
         <Skeleton className="h-24 w-full mb-6" />
         <Skeleton className="h-32 w-full" />
       </div>
    );
  }

  return (
    <div className="min-h-screen gradient-background pb-24">
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Your civic engagement hub</p>
      </div>

      <div className="px-6 space-y-6">
        <Card className="gradient-card shadow-card p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="destructive" size="sm" className="w-full mt-4">
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </Card>

        <Card className="gradient-card shadow-card p-6">
          <h3 className="text-lg font-semibold mb-4">My Impact</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="cursor-pointer" onClick={() => (window as any).setAppState('track', { filter: 'reported' })}>
              <Shield className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.issuesReported}</p>
              <p className="text-xs text-muted-foreground">Reported</p>
            </div>
            <div className="cursor-pointer" onClick={() => (window as any).setAppState('track', { filter: 'resolved' })}>
              <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">{stats.issuesResolved}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
            <div>
              <Award className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{stats.impactScore}</p>
              <p className="text-xs text-muted-foreground">Impact Score</p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="p-6">
        <Card className="gradient-card shadow-card p-4">
            <CardHeader>
              <CardTitle>My Contribution Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="w-full aspect-[4/3] h-[250px] lg:h-[300px]">
                <LineChart
                  accessibilityLayer
                  data={issueHistory}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 5)}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey="reported"
                    type="natural"
                    stroke="var(--color-reported)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-reported)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                  <Line
                    dataKey="resolved"
                    type="natural"
                    stroke="var(--color-resolved)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-resolved)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { IssueCard } from "../IssueCard";
import { Bell, ArrowRight, ShieldCheck } from "lucide-react";
import { supabase } from "@/supabase";
import { Skeleton } from "../ui/skeleton";
import { Card } from "../ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Progress } from "../ui/progress";
import { useTranslation } from "react-i18next"; // i18n support
import { LanguageToggle } from "../LanguageToggle"; // Language Toggle component
import { NotificationSheet } from "../NotificationSheet"; // [New Import] - Assuming you created this file


interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  location_lat: number;
  location_long: number;
  status: "pending" | "assigned" | "resolved";
  created_at: string;
}

export const HomeScreen = ({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) => {
  const [userName, setUserName] = useState<string>("Citizen");
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [communityIssues, setCommunityIssues] = useState<Issue[]>([]);
  const [cityStats, setCityStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false); // [New State for Notification Sheet]

  const { t } = useTranslation(); // Initialize translation hook

  useEffect(() => {
    const fetchHomePageData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const [
        userProfileResponse,
        myIssuesResponse,
        communityIssuesResponse,
        cityStatsResponse,
      ] = await Promise.all([
        supabase.from("users").select("name").eq("id", user?.id).single(),
        supabase
          .from("issues")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("issues")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase.from("issues").select("status", { count: "exact" }),
      ]);

      if (userProfileResponse.data) {
        setUserName(
          userProfileResponse.data.name || user?.email || "Citizen"
        );
      } else if (user) {
        setUserName(user.user_metadata.full_name || user.email || "Citizen");
      }

      if (myIssuesResponse.data) {
        setMyIssues(myIssuesResponse.data as Issue[]);
      }

      if (communityIssuesResponse.data) {
        setCommunityIssues(communityIssuesResponse.data as Issue[]);
      }

      if (cityStatsResponse.count !== null) {
        const totalIssues = cityStatsResponse.count;
        const resolvedCount = cityStatsResponse.data.filter(
          (i) => i.status === "resolved"
        ).length;
        setCityStats({ totalIssues, resolvedIssues: resolvedCount });
      }

      setLoading(false);
    };

    fetchHomePageData();
  }, []);

  return (
    <div className="min-h-screen gradient-background pb-24">
      {/* [NEW COMPONENT] Notification Center Sheet */}
      <NotificationSheet 
          isOpen={isNotificationOpen} 
          onOpenChange={setIsNotificationOpen} 
      />

      {/* Header */}
      <div className="px-4 pt-6 pb-4 bg-white/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {t("welcome", { name: userName })}
            </h1>
            <p className="text-sm text-muted-foreground">Pune, Maharashtra</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            {/* [MODIFIED] Bell Button to open the Notification Sheet */}
            <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsNotificationOpen(true)} // Opens the Sheet
            >
              <Bell className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* City Stats */}
        <Card className="gradient-card shadow-card p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold">{t("cityImpact")}</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                {t("totalIssuesLabel")}:{" "}
                <span className="font-bold text-foreground">
                  {cityStats.totalIssues}
                </span>
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {t("resolvedIssuesLabel")}:{" "}
                <span className="font-bold text-foreground">
                  {cityStats.resolvedIssues}
                </span>
              </p>
              <Progress
                value={
                  cityStats.totalIssues > 0
                    ? (cityStats.resolvedIssues / cityStats.totalIssues) * 100
                    : 0
                }
                className="mt-3"
              />
            </div>
          </div>
        </Card>

        {/* My Issues */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">{t("myRecentIssues")}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.("track")}
            >
              {t("viewAll")} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {loading ? (
            <Skeleton className="h-28 w-full" />
          ) : myIssues.length > 0 ? (
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent className="flex snap-x snap-mandatory">
                {myIssues.map((issue) => (
                  <CarouselItem
                    key={issue.id}
                    className="min-w-[250px] max-w-[300px] px-2 snap-start"
                  >
                    <IssueCard
                      key={issue.id}
                      title={issue.title}
                      description={issue.description}
                      location={
                        issue.location_lat
                          ? `${issue.location_lat.toFixed(2)}, ${issue.location_long?.toFixed(
                              2
                            )}`
                          : "N/A"
                      }
                      status={issue.status}
                      image={issue.image_url || undefined}
                      date={new Date(issue.created_at).toLocaleDateString()}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          ) : (
            <Card className="bg-white/70 p-4 rounded-lg text-center">
              <p className="text-muted-foreground text-sm">
                {t("noIssuesReported")}
              </p>
              <Button
                onClick={() => onNavigate?.("report")}
                size="sm"
                className="mt-2"
              >
                {t("reportFirstIssue")}
              </Button>
            </Card>
          )}
        </div>

        {/* Community Issues */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {t("communityHotspots")}
          </h2>
          <div className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : communityIssues.length > 0 ? (
              communityIssues.slice(0, 3).map((issue) => (
                <IssueCard
                  key={issue.id}
                  title={issue.title}
                  description={issue.description}
                  location={
                    issue.location_lat
                      ? `${issue.location_lat.toFixed(2)}, ${issue.location_long?.toFixed(
                          2
                        )}`
                      : "N/A"
                  }
                  status={issue.status}
                  image={issue.image_url || undefined}
                  date={new Date(issue.created_at).toLocaleDateString()}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-center">
                {t("noCommunityIssues")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
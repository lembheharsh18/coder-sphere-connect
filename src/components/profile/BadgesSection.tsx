
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserBadges, getUserPoints } from '@/api/achievements';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AddBadgeDialog from './AddBadgeDialog';
import { Badge as BadgeType } from '@/types/badge';
import { format } from 'date-fns';

interface BadgesSectionProps {
  userId: string;
  isCurrentUser: boolean;
}

const BadgesSection = ({ userId, isCurrentUser }: BadgesSectionProps) => {
  const { toast } = useToast();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchBadges = async () => {
    setIsLoading(true);
    try {
      const data = await getUserBadges(userId);
      setBadges(data);
      
      // Fetch total points
      const points = await getUserPoints(userId);
      setTotalPoints(points);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, [userId, toast]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Achievements</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Total points: {totalPoints}
          </p>
        </div>
        {isCurrentUser && (
          <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
            Add Achievement
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading achievements...</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center w-32 text-center"
              >
                <div className="w-20 h-20 mb-2 rounded-full bg-secondary p-3 flex items-center justify-center relative">
                  <img
                    src={badge.image}
                    alt={badge.name}
                    className="max-w-full max-h-full"
                  />
                  {badge.points && badge.points > 0 && (
                    <div className="absolute -right-2 -top-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold">
                      +{badge.points}
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-sm">{badge.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {badge.description}
                </p>
                {badge.earnedDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(badge.earnedDate)}
                  </p>
                )}
              </div>
            ))}

            {badges.length === 0 && (
              <div className="w-full py-8 text-center text-muted-foreground">
                {isCurrentUser ? "You haven't added any achievements yet" : "No achievements added yet"}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <AddBadgeDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchBadges}
      />
    </Card>
  );
};

export default BadgesSection;

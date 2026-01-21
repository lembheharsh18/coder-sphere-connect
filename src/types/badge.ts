
export interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  userId: string;
  points?: number;  // Optional points associated with this badge
  earnedDate?: string; // When the badge was earned
}

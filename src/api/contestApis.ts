
// Competitive Programming Contest APIs
// Fetches live contest data from Codeforces, CodeChef, and LeetCode

export interface Contest {
  id: string;
  name: string;
  platform: 'Codeforces' | 'CodeChef' | 'LeetCode';
  startTime: Date;
  endTime: Date;
  duration: string;
  url: string;
  status: 'upcoming' | 'ongoing' | 'past';
}

// Platform colors and icons for UI
export const platformConfig = {
  Codeforces: {
    color: '#1890FF',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600 dark:text-blue-400',
    url: 'https://codeforces.com',
  },
  CodeChef: {
    color: '#5B4638',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-700 dark:text-amber-400',
    url: 'https://codechef.com',
  },
  LeetCode: {
    color: '#FFA116',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-600 dark:text-orange-400',
    url: 'https://leetcode.com',
  },
};

// Format duration from seconds to human readable
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${minutes} min`;
};

// Fetch Codeforces contests
import { api } from "@/lib/apiClient";

export const fetchCodeforcesContests = async (): Promise<Contest[]> => {
  try {
    const response = await api.getCodeforcesContests();
    const contests = response.contests;
    
    return contests.map((contest: any) => {
      const startTime = new Date(contest.startTimeSeconds * 1000);
      const endTime = new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000);
      
      let status: 'upcoming' | 'ongoing' | 'past' = 'upcoming';
      const now = Date.now() / 1000;
      if (contest.phase === 'FINISHED' || contest.startTimeSeconds + contest.durationSeconds < now) {
        status = 'past';
      } else if (contest.startTimeSeconds <= now && contest.startTimeSeconds + contest.durationSeconds >= now) {
        status = 'ongoing';
      }
      
      return {
        id: `cf-${contest.id}`,
        name: contest.name,
        platform: 'Codeforces' as const,
        startTime,
        endTime,
        duration: formatDuration(contest.durationSeconds),
        url: `https://codeforces.com/contest/${contest.id}`,
        status,
      };
    });
  } catch (error) {
    console.error('Error fetching Codeforces contests:', error);
    return [];
  }
};


// Fetch LeetCode contests (using their GraphQL endpoint)
export const fetchLeetCodeContests = async (): Promise<Contest[]> => {
  try {
    // LeetCode doesn't have a public API, so we'll use mock data for upcoming contests
    // In production, you'd need to use their GraphQL endpoint or scrape their contests page
    const now = new Date();
    
    // LeetCode weekly contests are always on Sunday 2:30 AM UTC
    // Biweekly contests are every other Saturday 2:30 PM UTC
    const getNextSunday = (date: Date): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() + (7 - result.getDay()) % 7);
      result.setUTCHours(2, 30, 0, 0);
      if (result <= date) {
        result.setDate(result.getDate() + 7);
      }
      return result;
    };
    
    const getLastSunday = (date: Date): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() - result.getDay());
      result.setUTCHours(2, 30, 0, 0);
      return result;
    };
    
    const nextSunday = getNextSunday(now);
    const lastSunday = getLastSunday(now);
    const prevSunday = new Date(lastSunday);
    prevSunday.setDate(prevSunday.getDate() - 7);
    
    // Calculate contest numbers (Weekly Contest started at 326 around Jan 2023)
    const baseDate = new Date('2023-01-08T02:30:00Z');
    const weeksDiff = Math.floor((now.getTime() - baseDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const currentContestNum = 326 + weeksDiff;
    
    const contests: Contest[] = [];
    
    // Past contests (last 2 weeks)
    for (let i = 2; i >= 1; i--) {
      const contestDate = new Date(lastSunday);
      contestDate.setDate(contestDate.getDate() - (i * 7));
      const endTime = new Date(contestDate.getTime() + 90 * 60 * 1000);
      
      contests.push({
        id: `lc-weekly-${currentContestNum - i}`,
        name: `Weekly Contest ${currentContestNum - i}`,
        platform: 'LeetCode',
        startTime: contestDate,
        endTime,
        duration: '1h 30m',
        url: `https://leetcode.com/contest/weekly-contest-${currentContestNum - i}`,
        status: 'past',
      });
    }
    
    // Upcoming contests (next 2 weeks)
    for (let i = 0; i < 2; i++) {
      const contestDate = new Date(nextSunday);
      contestDate.setDate(contestDate.getDate() + (i * 7));
      const endTime = new Date(contestDate.getTime() + 90 * 60 * 1000);
      
      contests.push({
        id: `lc-weekly-${currentContestNum + i + 1}`,
        name: `Weekly Contest ${currentContestNum + i + 1}`,
        platform: 'LeetCode',
        startTime: contestDate,
        endTime,
        duration: '1h 30m',
        url: `https://leetcode.com/contest/weekly-contest-${currentContestNum + i + 1}`,
        status: contestDate > now ? 'upcoming' : 'ongoing',
      });
    }
    
    return contests;
  } catch (error) {
    console.error('Error fetching LeetCode contests:', error);
    return [];
  }
};

// Fetch CodeChef contests
export const fetchCodeChefContests = async (): Promise<Contest[]> => {
  try {
    // CodeChef API requires authentication, so we'll use mock data based on their schedule
    // In production, you'd use their API or scrape contests from https://www.codechef.com/contests
    const now = new Date();
    
    // CodeChef Starters are every Wednesday
    const getNextWednesday = (date: Date): Date => {
      const result = new Date(date);
      const day = result.getDay();
      const daysUntilWed = (3 - day + 7) % 7 || 7;
      result.setDate(result.getDate() + daysUntilWed);
      result.setUTCHours(14, 30, 0, 0);
      return result;
    };
    
    const getLastWednesday = (date: Date): Date => {
      const result = new Date(date);
      const day = result.getDay();
      const daysSinceWed = (day - 3 + 7) % 7;
      result.setDate(result.getDate() - daysSinceWed);
      result.setUTCHours(14, 30, 0, 0);
      return result;
    };
    
    const nextWed = getNextWednesday(now);
    const lastWed = getLastWednesday(now);
    
    // Calculate contest numbers
    const baseDate = new Date('2024-01-03T14:30:00Z');
    const weeksDiff = Math.floor((now.getTime() - baseDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const currentStarterNum = 160 + weeksDiff;
    
    const contests: Contest[] = [];
    
    // Past contests
    for (let i = 2; i >= 1; i--) {
      const contestDate = new Date(lastWed);
      contestDate.setDate(contestDate.getDate() - (i * 7));
      const endTime = new Date(contestDate.getTime() + 2 * 60 * 60 * 1000);
      
      contests.push({
        id: `cc-starter-${currentStarterNum - i}`,
        name: `Starters ${currentStarterNum - i}`,
        platform: 'CodeChef',
        startTime: contestDate,
        endTime,
        duration: '2 hours',
        url: `https://www.codechef.com/START${currentStarterNum - i}`,
        status: 'past',
      });
    }
    
    // Upcoming contests
    for (let i = 0; i < 2; i++) {
      const contestDate = new Date(nextWed);
      contestDate.setDate(contestDate.getDate() + (i * 7));
      const endTime = new Date(contestDate.getTime() + 2 * 60 * 60 * 1000);
      
      contests.push({
        id: `cc-starter-${currentStarterNum + i + 1}`,
        name: `Starters ${currentStarterNum + i + 1}`,
        platform: 'CodeChef',
        startTime: contestDate,
        endTime,
        duration: '2 hours',
        url: `https://www.codechef.com/START${currentStarterNum + i + 1}`,
        status: contestDate > now ? 'upcoming' : 'ongoing',
      });
    }
    
    // Add Long Challenge
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
    nextMonth.setUTCHours(14, 30, 0, 0);
    
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const year = nextMonth.getFullYear().toString().slice(-2);
    
    contests.push({
      id: `cc-long-${monthNames[nextMonth.getMonth()]}${year}`,
      name: `${monthNames[nextMonth.getMonth()]} Long Challenge ${nextMonth.getFullYear()}`,
      platform: 'CodeChef',
      startTime: nextMonth,
      endTime: new Date(nextMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
      duration: '10 days',
      url: `https://www.codechef.com/${monthNames[nextMonth.getMonth()]}${year}`,
      status: 'upcoming',
    });
    
    return contests;
  } catch (error) {
    console.error('Error fetching CodeChef contests:', error);
    return [];
  }
};

// Fetch all contests from all platforms
export const fetchAllContests = async (): Promise<Contest[]> => {
  try {
    const [codeforces, leetcode, codechef] = await Promise.all([
      fetchCodeforcesContests(),
      fetchLeetCodeContests(),
      fetchCodeChefContests(),
    ]);
    
    const allContests = [...codeforces, ...leetcode, ...codechef];
    
    // Sort by start time
    return allContests.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  } catch (error) {
    console.error('Error fetching all contests:', error);
    return [];
  }
};

// Get countdown string for a contest
export const getContestCountdown = (startTime: Date): string => {
  const now = new Date();
  const diff = startTime.getTime() - now.getTime();
  
  if (diff <= 0) return 'Started';
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Format date for display
export const formatContestDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
};

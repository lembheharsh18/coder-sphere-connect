
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Skill {
  id: string;
  name: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsOfExperience?: number;
}

interface SkillsSectionProps {
  skills: Skill[];
}

const SkillsSection = ({ skills }: SkillsSectionProps) => {
  const getLevelPercentage = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 25;
      case 'INTERMEDIATE':
        return 50;
      case 'ADVANCED':
        return 75;
      case 'EXPERT':
        return 100;
      default:
        return 0;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-blue-500';
      case 'INTERMEDIATE':
        return 'bg-green-500';
      case 'ADVANCED':
        return 'bg-purple-500';
      case 'EXPERT':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skill) => (
            <div key={skill.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{skill.name}</span>
                <Badge variant="outline">{skill.level.toLowerCase()}</Badge>
              </div>
              <Progress 
                value={getLevelPercentage(skill.level)} 
                className={`h-2 ${getLevelColor(skill.level)}`}
              />
              {skill.yearsOfExperience && (
                <p className="text-xs text-muted-foreground">
                  {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'} of experience
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsSection;

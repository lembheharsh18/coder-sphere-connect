import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

const AppearanceSettings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const handleThemeChange = (value: string) => {
    setTheme(value as 'light' | 'dark' | 'system');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Appearance settings updated",
      description: "Your theme preferences have been saved.",
    });
  };

  return (
    <Card className="bg-white dark:bg-gray-900 text-black dark:text-white">
      <CardContent className="pt-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Theme</h3>
            <RadioGroup defaultValue={theme} onValueChange={handleThemeChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system">System</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Code Editor Theme</h3>
            <RadioGroup defaultValue="github">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="github" id="github" />
                <Label htmlFor="github">GitHub</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monokai" id="monokai" />
                <Label htmlFor="monokai">Monokai</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dracula" id="dracula" />
                <Label htmlFor="dracula">Dracula</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nord" id="nord" />
                <Label htmlFor="nord">Nord</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Button type="submit">Save Preferences</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;

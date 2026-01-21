
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Button3D } from '@/components/ui/button-3d';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  title: z.string().min(5, {
    message: 'Title must be at least 5 characters',
  }).max(100, {
    message: 'Title must not exceed 100 characters',
  }),
  content: z.string().min(10, {
    message: 'Content must be at least 10 characters',
  }).max(5000, {
    message: 'Content must not exceed 5000 characters',
  }),
});

interface CreateDiscussionFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
  isSubmitting: boolean;
}

const CreateDiscussionForm: React.FC<CreateDiscussionFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <div className="p-4 mb-6 border rounded-lg bg-accent/10 animate-fade-in">
      <h3 className="font-semibold text-lg mb-4 link-underline">Create New Discussion</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="animate-fade-in" style={{animationDelay: '100ms'}}>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Discussion title"
                    {...field}
                    disabled={isSubmitting}
                    className="hover-scale"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="animate-fade-in" style={{animationDelay: '200ms'}}>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share your thoughts, questions, or insights..."
                    className="min-h-32 resize-y hover-scale"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end animate-fade-in" style={{animationDelay: '300ms'}}>
            <Button3D type="submit" disabled={isSubmitting} depth={6} hoverScale>
              {isSubmitting ? 'Posting...' : 'Post Discussion'}
            </Button3D>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateDiscussionForm;

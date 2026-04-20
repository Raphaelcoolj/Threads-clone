"use client";

import { ThreadValidation } from "@/lib/validations/thread";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
// import { updateUser } from "@/lib/actions/user";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createThread } from "@/lib/actions/thread.actions";

interface Props {
  user: {
    id: string;
    name?: string | null;
    username?: string | null;
    image?: string | null;
    bio?: string | null;
  };
}


const PostThread = ({ userId }: { userId: string }) => {
  const { update } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread:'',
      accountId: userId,
    },
  });

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    await createThread({
      text: values.thread,
      author: userId,
      communityId: null,
      path: pathname,
    });

    router.push('/')

  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-10 flex flex-col justify-start gap-10"
      > 
      <FormField
        control={form.control}
        name="thread"
        render={({ field }) => (
            <FormItem className="w-full flex flex-col gap-3">
                <FormLabel className="text-base-semibold text-light-2">Content</FormLabel>
                <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1 ">
                    <Textarea
                        rows={15}
                        
                        {...field}
                    />
                </FormControl>
            </FormItem>
        )}
        />
        <Button type="submit" className="bg-primary-500">
          Post Thread
        </Button>
      </form>
    </Form>
);

}
export default PostThread;
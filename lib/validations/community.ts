import * as z from 'zod';

export const CommunityValidation = z.object({
    profile_photo: z.string().url().nonempty(),
    name: z.string().min(2).max(30),
    username: z.string().min(2).max(30),
    bio: z.string().min(3).max(1000),
    member1: z.string().optional(),
    member2: z.string().optional(),
    member3: z.string().optional(),
})

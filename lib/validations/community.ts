import * as z from 'zod';

export const CommunityValidation = z.object({
    profile_photo: z.string().min(1, "Profile photo is required"),
    name: z.string().min(2).max(30),
    username: z.string().min(2).max(30),
    bio: z.string().max(1000).optional().or(z.literal("")),
    type: z.enum(['public', 'private']),
    member1: z.string().optional(),
    member2: z.string().optional(),
    member3: z.string().optional(),
})

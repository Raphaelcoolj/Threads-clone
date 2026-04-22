"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import Image from "next/image";
import { IconCameraPlus, IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import { isBase64Image } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import { createCommunity } from "@/lib/actions/community.actions";
import { CommunityValidation } from "@/lib/validations/community";

interface Props {
  userId: string;
  communityDetails?: {
    id: string;
    name: string;
    username: string;
    image: string;
    bio: string;
    type: string;
  }
}

export default function CommunityForm({ userId, communityDetails }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const { startUpload } = useUploadThing("media");
  const router = useRouter();

  const form = useForm<z.infer<typeof CommunityValidation>>({
    resolver: zodResolver(CommunityValidation),
    defaultValues: {
      profile_photo: communityDetails?.image || "",
      name: communityDetails?.name || "",
      username: communityDetails?.username || "",
      bio: communityDetails?.bio || "",
      type: (communityDetails?.type as any) || "public",
    },
  });

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
       if (!file.type.includes("image")) return;

       setFiles([file]);

       const reader = new FileReader();
       reader.onload = (event) => {
          form.setValue("profile_photo", event.target?.result as string);
       };
       reader.readAsDataURL(file);
    }
 };

  const onSubmit = async (values: z.infer<typeof CommunityValidation>) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      let profileImageUrl = values.profile_photo;
      
      if (files.length > 0) {
        console.log("-> Uploading new community image...");
        const imgRes = await startUpload(files);
        console.log("-> UT Response:", imgRes);

        if (imgRes && imgRes.length > 0) {
          profileImageUrl = imgRes[0].url || (imgRes[0] as any).fileUrl || (imgRes[0] as any).appUrl;
        } else {
          throw new Error("Failed to upload community image. Please try again.");
        }
      }

      if (communityDetails) {
        // Update existing community
        await updateCommunityInfo(
          communityDetails.id,
          values.name,
          values.username,
          profileImageUrl
        );
        router.push(`/communities/${communityDetails.id}`);
      } else {
        // Create new community
        const memberUsernames = [values.member1, values.member2, values.member3].filter(Boolean) as string[];
        await createCommunity(
          values.name,
          values.username,
          profileImageUrl,
          values.bio,
          userId,
          memberUsernames,
          values.type
        );
        router.push("/communities");
      }

    } catch (err: any) {
      console.error("Community Operation Error:", err);
      setError(err.message || "Failed to process community operation");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
          <IconAlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-xs font-semibold uppercase">{error}</p>
        </div>
      )}

      <form 
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-start gap-10"
      >
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700">
             {form.watch("profile_photo") ? (
               <Image 
                 src={form.watch("profile_photo")} 
                 alt="community_profile" 
                 fill
                 className="object-cover"
               />
             ) : (
               <div className="flex h-full w-full items-center justify-center text-zinc-600">
                  <IconCameraPlus size={40} />
               </div>
             )}
             <input 
               type="file" 
               accept="image/*"
               onChange={handleImage}
               className="absolute inset-0 opacity-0 cursor-pointer z-10"
             />
          </div>
          <div className="flex-1 space-y-1">
             <h3 className="text-white font-bold text-lg">Community Logo</h3>
             <p className="text-zinc-500 text-xs uppercase font-black tracking-widest">
               {communityDetails ? "Optional to change" : "Required"}
             </p>
             {form.formState.errors.profile_photo && (
               <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">
                 {form.formState.errors.profile_photo.message}
               </p>
             )}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
           <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Privacy</label>
           <div className="flex gap-4">
              <label className="flex items-center gap-2 text-white">
                <input type="radio" {...form.register("type")} value="public" className="accent-primary-500" />
                Public
              </label>
              <label className="flex items-center gap-2 text-white">
                <input type="radio" {...form.register("type")} value="private" className="accent-primary-500" />
                Private
              </label>
           </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
           <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Community Handle <span className="text-primary-500">*</span></label>
           <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 font-black opacity-40">@</span>
               <input 
                 {...form.register("username")}
                 className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 pl-9 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                 placeholder="community_handle"
               />
           </div>
           {form.formState.errors.username && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.username.message}</p>}
        </div>

        <div className="flex flex-col gap-3 w-full">
           <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Community Name<span className="text-primary-500">*</span></label>
           <input 
             {...form.register("name")}
             className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
             placeholder="Display name of your group"
           />
           {form.formState.errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-3 w-full">
           <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Description</label>
           <textarea 
             rows={5}
             {...form.register("bio")}
             className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
             placeholder="What is this community about?"
           />
           {form.formState.errors.bio && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.bio.message}</p>}
        </div>

        <div className="flex flex-col gap-3 w-full">
           <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Add Members (Optional - up to 3)</label>
           <div className="flex flex-col gap-2">
              <input {...form.register("member1")} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white" placeholder="Username of member 1" />
              <input {...form.register("member2")} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white" placeholder="Username of member 2" />
              <input {...form.register("member3")} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white" placeholder="Username of member 3" />
           </div>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-xl text-black font-black uppercase tracking-[0.2em] transition-all ${
            isSubmitting ? 'bg-zinc-700 opacity-50 cursor-not-allowed' : 'bg-white hover:bg-zinc-100'
          }`}
        >
          {isSubmitting ? <IconLoader2 className="animate-spin mx-auto" /> : "Create Community"}
        </button>
      </form>
    </div>
  );
}

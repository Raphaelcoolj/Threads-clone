"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { updateUser } from "@/lib/actions/user";
import { IconCameraPlus, IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import { isBase64Image } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import { usePathname, useRouter } from "next/navigation";

// 🧩 Zod Schema matching Adrian's AccountProfile but with your optionality requirements
const formSchema = z.object({
  profile_photo: z.string().optional().or(z.literal("")),
  name: z.string().min(2, "Name must be at least 2 characters").max(30),
  username: z.string().min(2, "Username must be at least 2 characters").max(30),
  bio: z.string().max(1000).optional().or(z.literal("")),
});

interface Props {
  user: {
    id: string;
    name?: string | null;
    username?: string | null;
    image?: string | null;
    bio?: string | null;
  };
}

export default function OnboardingForm({ user }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const { startUpload } = useUploadThing("media");
  const { update } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profile_photo: user?.image || "",
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      console.log("1. Checking Image Upload...");
      let profileImageUrl = values.profile_photo;
      
      // Only upload if a new file was selected (files array is not empty)
      if (files.length > 0) {
        console.log("-> Uploading new image to UploadThing...");
        const imgRes = await startUpload(files);
        console.log("-> UploadThing Response:", imgRes);

        if (imgRes && imgRes.length > 0) {
          profileImageUrl = imgRes[0].url || (imgRes[0] as any).fileUrl || (imgRes[0] as any).appUrl;
        } else {
          throw new Error("The image was not uploaded correctly. Please try a different image or try again.");
        }
      }

      console.log("2. Starting DB Update...");
      await updateUser({
        userId: user.id,
        username: values.username,
        name: values.name,
        bio: values.bio || "",
        image: profileImageUrl,
        path: pathname,
      });

      console.log("2. Syncing Session & Redirecting...");
      
      // AWAIT the update so the auth cookie is actually saved before redirecting
      await update({
        user: {
          ...user,
          name: values.name,
          username: values.username,
          image: profileImageUrl,
          onboarded: true,
        }
      });

      if (pathname === "/profile/edit") {
        router.back();
      } else {
        router.push("/");
      }

    } catch (err: any) {
      console.error("Onboarding Error:", err);
      setError(err.message || "Failed to complete profile update");
      setIsSubmitting(false); // Only reset on error to prevent transition cancellation
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
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700">
             {form.watch("profile_photo") ? (
               <Image 
                 src={form.watch("profile_photo")} 
                 alt="profile" 
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
             <h3 className="text-white font-bold text-lg">Profile Picture</h3>
             <p className="text-zinc-500 text-xs uppercase font-black tracking-widest">Optional</p>
             {form.formState.errors.profile_photo && (
               <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">
                 {form.formState.errors.profile_photo.message}
               </p>
             )}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
           <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Username <span className="text-primary-500">*</span></label>
           <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 font-black opacity-40">@</span>
               <input 
                 {...form.register("username")}
                 className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 pl-9 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                 placeholder="choose_a_username"
               />
           </div>
           {form.formState.errors.username && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.username.message}</p>}
        </div>

        <div className="flex flex-col gap-3 w-full">
           <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Full Name<span className="text-primary-500">*</span></label>
           <input 
             {...form.register("name")}
             className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
             placeholder="Your full name"
           />
           {form.formState.errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-3 w-full">
           <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Biography (Optional)</label>
           <textarea 
             rows={5}
             {...form.register("bio")}
             className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
             placeholder="Short bio about yourself..."
           />
           {form.formState.errors.bio && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.bio.message}</p>}
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-xl text-black font-black uppercase tracking-[0.2em] transition-all ${
            isSubmitting ? 'bg-zinc-700 opacity-50 cursor-not-allowed' : 'bg-white hover:bg-zinc-100'
          }`}
        >
          {isSubmitting ? <IconLoader2 className="animate-spin mx-auto" /> : "Continue"}
        </button>
      </form>
    </div>
  );
}

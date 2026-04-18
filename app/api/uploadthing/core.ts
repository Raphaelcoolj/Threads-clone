import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  media: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      try {
        const session = await auth();
        if (!session?.user) throw new UploadThingError("Unauthorized");
        return { userId: session.user.id };
      } catch (error) {
        console.error("UT Middleware Error:", error);
        throw new UploadThingError("Authentication failed");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

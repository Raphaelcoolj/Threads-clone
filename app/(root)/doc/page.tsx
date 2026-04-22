import Mermaid from "@/components/shared/Mermaid";

const DocumentationPage = () => {
  const erDiagram = `
    erDiagram
      USER ||--o{ THREAD : creates
      USER ||--o{ COMMUNITY : creates
      USER ||--o{ THREAD : likes
      USER ||--o{ THREAD : reposts
      COMMUNITY ||--o{ THREAD : hosts
      COMMUNITY ||--o{ USER : members
      THREAD ||--o{ THREAD : replies
  `;

  const architectureDiagram = `
    graph TD
      Client[Client Browser / Next.js Components] -->|Server Actions| Actions[lib/actions/*.ts]
      Actions -->|Mongoose| Models[lib/models/*.ts]
      Models -->|Query| DB[(MongoDB Atlas)]
      Client -->|Auth| NextAuth[auth.ts]
      Client -->|Upload| UT[UploadThing]
  `;

  return (
    <section className="text-white p-6 sm:p-10 max-w-5xl mx-auto space-y-12">
      <header className="border-b border-zinc-800 pb-10">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary-500 to-purple-400 bg-clip-text text-transparent">
          System Documentation & Interview Guide
        </h1>
        <p className="mt-4 text-zinc-400 text-lg">
          A comprehensive guide to the Threads Clone architecture, data flow, and file-by-file logic.
        </p>
      </header>

      {/* 1. Tech Stack */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <span className="bg-primary-500/10 text-primary-500 p-2 rounded-lg text-sm">01</span>
          Technical Stack
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-2 p-5 rounded-xl border border-zinc-800">
            <h3 className="font-bold text-primary-500 mb-2">Frontend & Framework</h3>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• Next.js 15+ (App Router, Server Components)</li>
              <li>• React 19 (Hooks, Suspense, useTransition)</li>
              <li>• Tailwind CSS (Styling & Responsiveness)</li>
              <li>• Shadcn UI (Component Library)</li>
            </ul>
          </div>
          <div className="bg-dark-2 p-5 rounded-xl border border-zinc-800">
            <h3 className="font-bold text-primary-500 mb-2">Backend & Database</h3>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• Next.js Server Actions (Type-safe API)</li>
              <li>• MongoDB Atlas (NoSQL Hosting)</li>
              <li>• Mongoose (Object Modeling)</li>
              <li>• NextAuth.js (v5 Beta - Authentication)</li>
              <li>• UploadThing (Cloud Media Management)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Architecture Diagram */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <span className="bg-primary-500/10 text-primary-500 p-2 rounded-lg text-sm">02</span>
          System Architecture
        </h2>
        <Mermaid chart={architectureDiagram} />
      </div>

      {/* 3. Data Models */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <span className="bg-primary-500/10 text-primary-500 p-2 rounded-lg text-sm">03</span>
          Database Schema (ERD)
        </h2>
        <Mermaid chart={erDiagram} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-3 p-4 rounded-lg border border-zinc-800">
            <h4 className="font-bold text-zinc-200">User</h4>
            <p className="text-xs text-zinc-500">Threads, Communities, Onboarding status, Auth info.</p>
          </div>
          <div className="bg-dark-3 p-4 rounded-lg border border-zinc-800">
            <h4 className="font-bold text-zinc-200">Thread</h4>
            <p className="text-xs text-zinc-500">Text, Author, Parent (for replies), Children, Likes, Reposts.</p>
          </div>
          <div className="bg-dark-3 p-4 rounded-lg border border-zinc-800">
            <h4 className="font-bold text-zinc-200">Community</h4>
            <p className="text-xs text-zinc-500">Creator, Members, Threads, Privacy type (Public/Private).</p>
          </div>
        </div>
      </div>

      {/* 4. File Breakdown */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <span className="bg-primary-500/10 text-primary-500 p-2 rounded-lg text-sm">04</span>
          Detailed File Connections
        </h2>
        <div className="space-y-4">
          <div className="bg-dark-2 p-6 rounded-xl border border-zinc-800 space-y-4">
            <h3 className="text-xl font-bold text-white border-l-4 border-primary-500 pl-4">Core Logic (lib/actions)</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 text-sm">
                <span className="text-primary-400 font-mono">user.ts</span>: Handles <code>fetchUser</code>, <code>updateUser</code>, <code>getActivity</code>, and the logic for fetching user-specific posts vs comments.
              </div>
              <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 text-sm">
                <span className="text-primary-400 font-mono">thread.actions.ts</span>: The "engine" for content. Manages <code>createThread</code>, <code>toggleLike</code>, <code>repostThread</code>, and <b>recursive deletion</b>.
              </div>
              <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 text-sm">
                <span className="text-primary-400 font-mono">community.actions.ts</span>: Logic for groups, members, join requests, and community-specific post fetching.
              </div>
              <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 text-sm">
                <span className="text-primary-400 font-mono">admin.ts</span>: Privileged actions for management, including bulk fetching and forced deletions.
              </div>
            </div>
          </div>

          <div className="bg-dark-2 p-6 rounded-xl border border-zinc-800 space-y-4">
            <h3 className="text-xl font-bold text-white border-l-4 border-purple-500 pl-4">Components Architecture</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="p-2">
                <b>ThreadCard.tsx</b>: The most complex component. Handles rendering of original threads, comments, and repost labels. Manages optimistic-like UI transitions via <code>useTransition</code>.
              </div>
              <div className="p-2">
                <b>ThreadsTab.tsx</b>: A versatile tab component used in Profiles and Communities to toggle between "Threads" and "Replies".
              </div>
              <div className="p-2">
                <b>Searchbar.tsx</b>: Client-side component with 300ms <b>debounce</b> logic to prevent API spamming during searches.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Interview Prep Q&A */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <span className="bg-primary-500/10 text-primary-500 p-2 rounded-lg text-sm">05</span>
          Interview Preparation Q&A
        </h2>
        
        <div className="space-y-4">
          <details className="bg-dark-2 rounded-xl border border-zinc-800 group overflow-hidden">
            <summary className="p-5 font-bold cursor-pointer hover:bg-zinc-800/50 transition-colors list-none flex justify-between items-center">
              <span>Q: How do you handle deep nesting of comments in deletions?</span>
              <span className="text-primary-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-5 pt-0 text-sm text-zinc-400 border-t border-zinc-800">
              We use a recursive helper function <code>fetchAllChildThreads</code> in <code>thread.actions.ts</code>. It gathers all descendant IDs, then performs a <code>deleteMany</code> in the database. Finally, it pulls those IDs from the <code>threads</code> array of all affected Users and Communities.
            </div>
          </details>

          <details className="bg-dark-2 rounded-xl border border-zinc-800 group overflow-hidden">
            <summary className="p-5 font-bold cursor-pointer hover:bg-zinc-800/50 transition-colors list-none flex justify-between items-center">
              <span>Q: How does the application prevent un-onboarded users from accessing the app?</span>
              <span className="text-primary-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-5 pt-0 text-sm text-zinc-400 border-t border-zinc-800">
              In almost every main route (Home, Profile, Search), we fetch the user's status via <code>fetchUser(session.user.id)</code>. If <code>userInfo.onboarded</code> is false, we trigger a <code>redirect("/onboarding")</code>.
            </div>
          </details>

          <details className="bg-dark-2 rounded-xl border border-zinc-800 group overflow-hidden">
            <summary className="p-5 font-bold cursor-pointer hover:bg-zinc-800/50 transition-colors list-none flex justify-between items-center">
              <span>Q: Why use Server Actions instead of a REST API?</span>
              <span className="text-primary-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-5 pt-0 text-sm text-zinc-400 border-t border-zinc-800">
              Server Actions reduce boilerplate (no need for manual fetch/axios calls), provide end-to-end type safety with TypeScript, and handle the "Backend-for-Frontend" logic seamlessly within Next.js, allowing for easier <code>revalidatePath</code> calls to refresh data.
            </div>
          </details>

          <details className="bg-dark-2 rounded-xl border border-zinc-800 group overflow-hidden">
            <summary className="p-5 font-bold cursor-pointer hover:bg-zinc-800/50 transition-colors list-none flex justify-between items-center">
              <span>Q: How is the "Repost" functionality implemented?</span>
              <span className="text-primary-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-5 pt-0 text-sm text-zinc-400 border-t border-zinc-800">
              Reposts are stored as an array of User IDs on the Thread model. When a user reposts, their ID is added to that array. In the Profile view, we fetch threads where the user is either the author OR their ID exists in the reposts array.
            </div>
          </details>
        </div>
      </div>

      <footer className="pt-20 text-center text-zinc-600 text-[10px] uppercase tracking-widest">
        Threads Clone Documentation Cluster • Ready for Deployment
      </footer>
    </section>
  );
};

export default DocumentationPage;

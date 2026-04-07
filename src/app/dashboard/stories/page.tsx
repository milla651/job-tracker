import { getStories } from "@/app/actions/stories";
import { StoriesClient } from "./StoriesClient";

export const metadata = { title: "Story Bank — CareerOS" };

export default async function StoriesPage() {
  const stories = await getStories();

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StoriesClient initialStories={stories} />
      </div>
    </div>
  );
}

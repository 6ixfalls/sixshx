import Pagination from "~/components/ui/pagination";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export default async function Page() {
  return (
    <div className="w-auto">
      <Pagination
        total={10}
        classNames={{
          base: "mx-auto flex w-full justify-center",
          wrapper: "flex flex-row items-center gap-1",
          prev: cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "!bg-transparent hover:!bg-accent !ring-transparent after:content-['Previous'] flex !flex-row !w-auto gap-1 px-2.5",
          ),
          next: cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "!bg-transparent hover:!bg-accent !ring-transparent before:content-['Next'] flex !flex-row !w-auto gap-1 px-2.5",
          ),
          item: cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "!bg-transparent hover:!bg-accent !ring-transparent",
          ),
          cursor: cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "!text-transparent !bg-transparent !pointer-events-none !ring-transparent",
          ),
        }}
        showControls
      />
    </div>
  );
}

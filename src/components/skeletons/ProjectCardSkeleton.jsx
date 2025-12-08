import { Skeleton } from "../ui/Skeleton";

const ProjectCardSkeleton = () => {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      
      {/* HEADER: Badge + Members Count */}
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-6 w-24 rounded-full" /> {/* Badge typu */}
        <Skeleton className="h-4 w-16" />              {/* Licznik członków */}
      </div>

      {/* TITLE */}
      <Skeleton className="h-7 w-3/4 mb-2" /> 

      {/* AUTHOR INFO */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-6 w-6 rounded-full" />  {/* Avatar */}
        <Skeleton className="h-4 w-32" />              {/* Nazwa autora */}
      </div>

      {/* DESCRIPTION (3 linie tekstu) */}
      <div className="space-y-2 mb-6 flex-grow">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* TAGS */}
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-14 rounded-md" />
      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
        <Skeleton className="h-4 w-24" /> {/* Data */}
        <Skeleton className="h-4 w-20" /> {/* Link "Details" */}
      </div>
    </div>
  );
};

export default ProjectCardSkeleton;
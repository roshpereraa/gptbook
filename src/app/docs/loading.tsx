import { Bone } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <Bone className="h-3 w-24" />
      <Bone className="mt-3 h-9 w-2/3" />
      <Bone className="mt-4 h-4 w-full" />
      <Bone className="mt-2 h-4 w-5/6" />
      <Bone className="mt-10 h-5 w-40" />
      <Bone className="mt-3 h-4 w-full" />
      <Bone className="mt-2 h-4 w-4/5" />
    </div>
  );
}

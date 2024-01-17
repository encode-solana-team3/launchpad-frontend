import LaunchpadView from "@/components/LaunchpadView";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-x-4">
      <Link href="/create-spl-token">
        <Button>Step 1: Create a spl-token</Button>
      </Link>
      <Link href="/create">
        <Button>Step 2: Create a launchpad</Button>
      </Link>
      <LaunchpadView />
    </div>
  );
}

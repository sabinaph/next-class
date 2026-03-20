"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Clock } from "lucide-react";

interface WaitlistButtonProps {
  courseId: string;
  isWaitlisted: boolean;
}

export function WaitlistButton({ courseId, isWaitlisted }: WaitlistButtonProps) {
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(isWaitlisted);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: joined ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (!res.ok) throw new Error("Failed");
      setJoined(!joined);
    } catch (e) {
      alert("Could not update waitlist. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <Button
      variant={joined ? "outline" : "default"}
      className="w-full"
      onClick={handleJoin}
      disabled={joining}
    >
      {joining && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      <Clock className="h-4 w-4 mr-2" />
      {joined ? "Leave Waitlist" : "Join Waitlist"}
    </Button>
  );
}

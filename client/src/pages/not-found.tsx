import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold font-display text-white">404</h1>
        <p className="text-lg text-muted-foreground">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg" className="btn-gradient w-full">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    const { setAuthed } = await import("@/lib/auth");
    setAuthed(true);
    const sp = new URLSearchParams(location.search);
    const next = sp.get("next") || "/";
    navigate(next);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(99,102,241,0.25),transparent),radial-gradient(800px_400px_at_90%_10%,rgba(14,165,233,0.25),transparent)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="relative container mx-auto px-6 py-14 grid place-items-center">
        <Card className="w-full max-w-md border-slate-800 bg-slate-900/40 backdrop-blur-md text-slate-100">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-slate-300">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-400"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-300">
                  Password
                </label>
                <div className="flex gap-2">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-400"
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowPw((s) => !s)}
                    className="shrink-0"
                  >
                    {showPw ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <Link to="#" className="text-indigo-300 hover:text-indigo-200">
                  Forgot password?
                </Link>
              </div>
              {error && <p className="text-sm text-red-300">{error}</p>}
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative my-4 text-center text-xs text-slate-400">
                <span className="bg-slate-900/40 px-2 relative z-10">
                  or continue with
                </span>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-700" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="bg-slate-900/60 border-slate-700 text-slate-100"
                >
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="bg-slate-900/60 border-slate-700 text-slate-100"
                >
                  GitHub
                </Button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-400">
              Don’t have an account?{" "}
              <Link to="#" className="text-indigo-300 hover:text-indigo-200">
                Create one
              </Link>
            </p>
            <p className="mt-2 text-center text-xs text-slate-500">
              Back to{" "}
              <Link to="/" className="text-indigo-300 hover:text-indigo-200">
                Home
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

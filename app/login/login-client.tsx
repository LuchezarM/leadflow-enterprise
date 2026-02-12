// app/(auth)/login/page.tsx  (adjust the path to your route)
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginMascot } from "@/components/ui/auth/login-mascot";
import { Eye, EyeOff } from "lucide-react";

type Role = "admin" | "operator" | "viewer";

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
}

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const nextUrl = useMemo(() => sp.get("next") || "/app", [sp]);

  const [role, setRole] = useState<Role>("admin");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // mascot states
  const [pwFocused, setPwFocused] = useState(false);
  const [typing, setTyping] = useState(false);

  const login = async () => {
    setErr("");
    setLoading(true);

    if (password.trim() !== "demo") {
      setLoading(false);
      setErr('Wrong password. Use "demo".');
      return;
    }

    setCookie("lf_auth", "1");
    setCookie("lf_role", role);

    setLoading(false);
    router.push(nextUrl);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F4F2EE] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 👀 Mascot */}
        <LoginMascot
          follow={!pwFocused}
          coverEyes={pwFocused} // ✅ always cover on focus
          peek={pwFocused && showPw} // ✅ only one eye opens slightly when visible
          peekTextLen={password.length}
          peekEye="right"
          typing={typing}
        />

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Sign in
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Demo login for my LeadFlow portfolio build.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Password</div>

              <div className="relative">
                <Input
                  className="h-11 pr-11"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    setTyping(true);
                    clearTimeout((window as any).__lf_typing);
                    (window as any).__lf_typing = setTimeout(() => {
                      setTyping(false);
                    }, 350);
                  }}
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => setPwFocused(false)}
                  placeholder='Use "demo"'
                  onKeyDown={(e) => {
                    if (e.key === "Enter") login();
                  }}
                />

                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 transition"
                  onMouseDown={(e) => e.preventDefault()} // keep input focus
                  onClick={() => setShowPw((s) => !s)}
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {err ? <div className="text-xs text-red-600">{err}</div> : null}
              <div className="text-xs text-muted-foreground">
                Tip: password is <span className="font-medium">demo</span>
              </div>
            </div>

            <Button className="h-11 w-full" onClick={login} disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            <div className="text-xs text-muted-foreground">
              After login you’ll be redirected to:{" "}
              <span className="font-medium text-foreground">{nextUrl}</span>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground mt-8">
          LeadFlow • Minimal enterprise UI
        </div>
      </div>
    </div>
  );
}

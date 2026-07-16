import Image from "next/image";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#0F172A] via-[#1E3A5F] to-[#0C4A6E] p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/pwa-logo.jpg"
            alt="VAMS"
            width={64}
            height={64}
            className="rounded-full ring-2 ring-white/20"
            priority
          />
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">VAMS</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-white/60">
            ระบบบริหารจัดการ Control Valve
            <br />
            การประปาส่วนภูมิภาค เขต 10
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}

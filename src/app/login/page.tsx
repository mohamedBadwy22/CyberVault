import LoginForm from "../_components/LoginForm/LoginForm";
import { Shield, Landmark, Zap } from "lucide-react";

export default function login() {
  return (
    <>
      {/* MODIFIED: bg-blue-800 on mobile (white card floats on brand color);
          md:bg-transparent on desktop (oval provides visual interest instead) */}
      <div className="container mx-auto bg-blue-800 md:bg-transparent flex flex-col-reverse md:flex-row items-center justify-center min-h-screen gap-5">

        {/* MODIFIED: removed bg-gray-50 (redundant); w-full on mobile ensures
            the section — and the card inside — never collapses to a narrow width */}
        <section className="w-full md:w-auto">
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">

            {/* MODIFIED: responsive max-width ladder — fills full width on mobile,
                steps down beside the oval on md, scales back up on lg/xl */}
            <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md md:max-w-sm lg:max-w-md xl:max-w-lg xl:p-0">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">

                {/* UNCHANGED: heading and LoginForm component — zero modifications */}
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                  Sign in to your account
                </h1>
                <LoginForm />

              </div>
            </div>
          </div>
        </section>

        {/* MODIFIED: right column — decorative oval, hidden on mobile (blue container
            bg handles that viewport); visible on md+ as inclined translucent shape */}
        <div className="md:flex relative items-center justify-center md:w-96 lg:w-[28rem]">

          {/* MODIFIED: asymmetric border-radius creates organic oval shape;
              rotate-[-8deg] inclines it; bg-blue-800/25 = brand color at 25% opacity */}
          <div className="bg-blue-800/25 text-white rotate-[-8deg] md:p-10 p-3 w-full rounded-[60%_40%_40%_60%_/_60%_60%_40%_40%]">

            {/* MODIFIED: counter-rotate content so text stays upright inside the oval */}
            <div className="rotate-[8deg] flex flex-col gap-4">

              {/* Heading — dark blue for readability on light translucent background */}
              <h2 className="text-2xl font-extrabold tracking-tight md:text-blue-800">
                Secure. Simple. Smart.
              </h2>

              {/* Subtext — gray-600 for comfortable contrast on white/translucent bg */}
              <p className="md:text-gray-600 text-sm leading-relaxed">
                CyberVault gives you full control over your finances — manage
                accounts, transfer funds, and monitor transactions with confidence.
                Trusted digital banking, built for everyone.
              </p>

              {/* Feature highlight rows — icons + short text, no buttons */}
              <ul className="space-y-3">

                {/* Feature 1 — Security */}
                <li className="flex items-center gap-3">
                  <Shield className="w-4 h-4 shrink-0 text-white md:text-blue-700" />
                  <span className="md:text-gray-700 text-sm">
                    Bank-grade security protecting every transaction
                  </span>
                </li>

                {/* Feature 2 — Banking services */}
                <li className="flex items-center gap-3">
                  <Landmark className="w-4 h-4 shrink-0 text-white md:text-blue-700" />
                  <span className="md:text-gray-700 text-sm">
                    Full account management in one place
                  </span>
                </li>

                {/* Feature 3 — Speed */}
                <li className="flex items-center gap-3">
                  <Zap className="w-4 h-4 shrink-0 text-white md:text-blue-700" />
                  <span className="md:text-gray-700 text-sm">
                    Instant transfers and real-time balance updates
                  </span>
                </li>

              </ul>
            </div>
          </div>
        </div>

            
      </div>
    </>
  );
}

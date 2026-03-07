// pages/Legal.jsx
import { FileText, Lock, Cookie, Accessibility, UserCog } from 'lucide-react';

export default function Legal() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
            <div className="mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Legal & <span className="text-sky-400">Privacy</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl">
                    Everything you need to know about how we manage our platform, protect your data, and ensure compliance.
                </p>
            </div>

            <div className="space-y-6">
                <section id="terms" className="card p-6 md:p-8 flex gap-4 md:gap-6 items-start">
                    <div className="p-3 rounded-lg bg-slate-800 shrink-0 mt-1">
                        <FileText className="text-slate-300" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Terms of Service</h2>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                            By using our platform, you agree to our Terms of Service. This document outlines the rules, guidelines, and mutual agreements for utilizing our link management tools securely and responsibly.
                        </p>
                    </div>
                </section>

                <section id="privacy" className="card p-6 md:p-8 flex gap-4 md:gap-6 items-start">
                    <div className="p-3 rounded-lg bg-sky-500/10 shrink-0 mt-1">
                        <Lock className="text-sky-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Privacy Policy</h2>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                            Your privacy is our priority. Our Privacy Policy explains in detail how we collect, handle, and fiercely protect your data, ensuring complete transparency in our operations.
                        </p>
                    </div>
                </section>

                <section id="cookies" className="card p-6 md:p-8 flex gap-4 md:gap-6 items-start">
                    <div className="p-3 rounded-lg bg-emerald-500/10 shrink-0 mt-1">
                        <Cookie className="text-emerald-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Cookie Policy</h2>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                            We utilize cookies to enhance your browsing experience and improve our platform's functionality. Read our Cookie Policy to understand how these technologies are used and how you can manage your preferences.
                        </p>
                    </div>
                </section>

                <section id="accessibility" className="card p-6 md:p-8 flex gap-4 md:gap-6 items-start">
                    <div className="p-3 rounded-lg bg-purple-500/10 shrink-0 mt-1">
                        <Accessibility className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Accessibility Statement</h2>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                            We are dedicated to ensuring our platform is usable by everyone. Our Accessibility Statement details our ongoing commitment to meeting web accessibility standards and creating an inclusive digital environment.
                        </p>
                    </div>
                </section>

                <section id="manager" className="card p-6 md:p-8 flex gap-4 md:gap-6 items-start border border-sky-500/30">
                    <div className="p-3 rounded-lg bg-sky-500 shrink-0 mt-1">
                        <UserCog className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Privacy Manager</h2>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base mb-4">
                            Take control of your digital footprint. Our Privacy Manager tool provides you with the capability to easily review, manage, and update your personal data and privacy preferences at any time.
                        </p>
                        <button className="btn-secondary text-sm">Open Privacy Manager</button>
                    </div>
                </section>
            </div>
        </main>
    );
}

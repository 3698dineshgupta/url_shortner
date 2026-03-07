// pages/Support.jsx
import { LifeBuoy, Briefcase, Wrench, ShieldAlert } from 'lucide-react';

export default function Support() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
            <div className="mb-16 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    How can we <span className="text-sky-400">help?</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Whether you're looking for technical docs, enterprise sales, or need to report a malicious link, you're in the right place.
                </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
                <div id="helpdesk" className="card p-8 hover:border-sky-500/30 transition-colors">
                    <LifeBuoy size={28} className="text-sky-400 mb-4" />
                    <h2 className="text-xl font-bold text-white mb-3">Help Desk</h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        Find the answers you need, when you need them. Access our comprehensive Help Desk for step-by-step guides, troubleshooting tips, and frequently asked questions designed to help you get the most out of our platform.
                    </p>
                    <button className="text-sky-400 text-sm font-medium hover:text-sky-300">Visit Knowledge Base &rarr;</button>
                </div>

                <div id="sales" className="card p-8 hover:border-emerald-500/30 transition-colors">
                    <Briefcase size={28} className="text-emerald-400 mb-4" />
                    <h2 className="text-xl font-bold text-white mb-3">Contact Sales</h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        Ready to scale your link management strategy? Contact our Sales team to discuss enterprise features, bulk API usage, and custom solutions tailored to your organization's specific needs.
                    </p>
                    <a href="mailto:entrance.whiztest@gmail.com?subject=Sales Inquiry" className="text-emerald-400 text-sm font-medium hover:text-emerald-300">Contact Sales &rarr;</a>
                </div>

                <div id="techsupport" className="card p-8 hover:border-purple-500/30 transition-colors">
                    <Wrench size={28} className="text-purple-400 mb-4" />
                    <h2 className="text-xl font-bold text-white mb-3">Contact Support</h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        Need technical assistance? Our dedicated Contact Support team is here to help resolve any issues quickly and efficiently, ensuring your operations remain uninterrupted.
                    </p>
                    <a href="mailto:entrance.whiztest@gmail.com?subject=Technical Support" className="text-purple-400 text-sm font-medium hover:text-purple-300">Open a Ticket &rarr;</a>
                </div>

                <div id="abuse" className="card p-8 hover:border-red-500/30 transition-colors border-red-500/10">
                    <ShieldAlert size={28} className="text-red-400 mb-4" />
                    <h2 className="text-xl font-bold text-white mb-3">Report Abuse</h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        We are committed to maintaining a safe internet environment. If you encounter a short link that directs to malicious, harmful, or spam content, please report it immediately so our trust and safety team can take action.
                    </p>
                    <a href="mailto:entrance.whiztest@gmail.com?subject=Abuse Report" className="text-red-400 text-sm font-medium hover:text-red-300">Report a Link &rarr;</a>
                </div>
            </div>
        </main>
    );
}

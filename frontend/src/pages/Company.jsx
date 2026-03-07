// pages/Company.jsx
import { Building2, Mail } from 'lucide-react';

export default function Company() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    About <span className="text-sky-400">Us</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    We are on a mission to simplify how the world shares information.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Mission */}
                <div className="card p-8">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-6">
                        <Building2 size={24} className="text-sky-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                    <p className="text-slate-400 leading-relaxed">
                        We believe that link management should be effortless, secure, and insightful. By building modern, reliable tools, we empower businesses and individuals to connect with their audiences more effectively, bridging the gap between complex web addresses and human-readable links.
                    </p>
                    <p className="text-slate-400 leading-relaxed mt-4">
                        Founded with a focus on developer experience and enterprise scalability, Snip aims to be the invisible infrastructure powering your digital campaigns.
                    </p>
                </div>

                {/* Contact */}
                <div id="contact" className="card p-8 bg-slate-800/30">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
                        <Mail size={24} className="text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
                    <p className="text-slate-400 leading-relaxed mb-8">
                        Have a question, feedback, or just want to say hello? We'd love to hear from you. Our team is distributed globally but always ready to connect.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-300">
                            <Mail size={18} className="text-sky-400" />
                            <a href="mailto:entrance.whiztest@gmail.com" className="hover:text-sky-400 transition-colors">
                                entrance.whiztest@gmail.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

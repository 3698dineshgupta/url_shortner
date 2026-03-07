import { Link } from 'react-router-dom';
import { Link2 } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-slate-800/60 bg-slate-950/50 pt-16 pb-8 mt-auto">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded border border-sky-500/30 bg-sky-500/10 flex items-center justify-center">
                                <Link2 size={12} className="text-sky-400" strokeWidth={2.5} />
                            </div>
                            <span className="font-bold text-white text-md tracking-tight">snip</span>
                        </Link>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Transform long URLs into powerful short links with real-time analytics and lightning-fast redirects.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-medium text-sm mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/features" className="text-slate-400 hover:text-sky-400 transition-colors">Features</Link></li>
                            <li><Link to="/features#api" className="text-slate-400 hover:text-sky-400 transition-colors">Developer API</Link></li>
                            <li><Link to="/features#pricing" className="text-slate-400 hover:text-sky-400 transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-medium text-sm mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/resources#blog" className="text-slate-400 hover:text-sky-400 transition-colors">Blog</Link></li>
                            <li><Link to="/resources#process" className="text-slate-400 hover:text-sky-400 transition-colors">Our Process</Link></li>
                            <li><Link to="/resources#guides" className="text-slate-400 hover:text-sky-400 transition-colors">Guides</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-medium text-sm mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/company" className="text-slate-400 hover:text-sky-400 transition-colors">About Us</Link></li>
                            <li><Link to="/company#contact" className="text-slate-400 hover:text-sky-400 transition-colors">Contact</Link></li>
                            <li><Link to="/support" className="text-slate-400 hover:text-sky-400 transition-colors">Help Desk</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-medium text-sm mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/legal" className="text-slate-400 hover:text-sky-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/legal#terms" className="text-slate-400 hover:text-sky-400 transition-colors">Terms of Service</Link></li>
                            <li><Link to="/legal#cookies" className="text-slate-400 hover:text-sky-400 transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                        &copy; {new Date().getFullYear()} Snip. All rights reserved.
                    </p>
                    <div className="flex gap-4 text-xs text-slate-500">
                        <Link to="/support#abuse" className="hover:text-red-400 transition-colors">Report Abuse</Link>
                        <Link to="/legal#accessibility" className="hover:text-sky-400 transition-colors">Accessibility</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// pages/Resources.jsx
import { BookOpen, Terminal, CheckCircle } from 'lucide-react';

export default function Resources() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
            <div className="mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Resources & <span className="text-sky-400">Guides</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl">
                    Learn how to get the most out of Snip with our comprehensive tutorials, development guides, and architecture insights.
                </p>
            </div>

            <div className="space-y-12">
                {/* Blog Section */}
                <section id="blog" className="card p-8 border-t-4 border-t-sky-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-lg bg-sky-500/10">
                            <BookOpen className="text-sky-400" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Blog</h2>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                        Stay ahead of the curve with our dedicated Blog. Discover the latest industry trends, read in-depth tutorials on link management strategies, and get regular updates on new platform features designed to help you optimize your digital toolkit.
                    </p>
                    <div className="mt-6 flex gap-3">
                        <button className="btn-secondary text-sm">Coming Soon</button>
                    </div>
                </section>

                {/* Developer Section */}
                <section id="developers" className="card p-8 border-t-4 border-t-purple-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-lg bg-purple-500/10">
                            <Terminal className="text-purple-400" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">For Developers</h2>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                        Your gateway to seamless integration. Our comprehensive Developer Documentation provides everything you need—from API references and authentication guides to code examples—to quickly and reliably integrate our link management architecture into your projects.
                    </p>
                    <div className="mt-6 p-4 rounded-lg bg-slate-900 border border-slate-800 font-mono text-sm text-sky-300 overflow-x-auto">
                        POST /api/shorten
                        {"\n"}{"{"}
                        {"\n"}  "url": "https://example.com/long",
                        {"\n"}  "customCode": "my-promo"
                        {"\n"}{"}"}
                    </div>
                </section>

                {/* Proven Process Section */}
                <section id="process" className="card p-8 border-t-4 border-t-emerald-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-lg bg-emerald-500/10">
                            <CheckCircle className="text-emerald-400" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Our Proven Process</h2>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                        Quality and reliability are built into our DNA. Our Proven Process outlines the meticulous workflow behind our platform: from rigorous strategic planning and secure development to comprehensive testing and continuous deployment. We ensure our infrastructure remains robust, scalable, and secure.
                    </p>
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 rounded-lg bg-slate-800/50">
                            <h4 className="font-semibold text-white mb-1">1. Plan</h4>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-800/50">
                            <h4 className="font-semibold text-white mb-1">2. Build</h4>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-800/50">
                            <h4 className="font-semibold text-white mb-1">3. Test</h4>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-800/50">
                            <h4 className="font-semibold text-white mb-1">4. Scale</h4>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

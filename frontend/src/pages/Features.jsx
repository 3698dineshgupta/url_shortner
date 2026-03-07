// pages/Features.jsx
import { Link2, LayoutDashboard, Share2, BarChart2, QrCode, Code } from 'lucide-react';

const FEATURES = [
    {
        icon: Link2,
        title: 'Link Editor',
        desc: 'Transform your lengthy, complex URLs into clean, manageable short links in seconds. Our intuitive Link Editor empowers you to customize your links on the fly, allowing you to clearly define the destination while keeping your audience focused on a concise, professional-looking URL.',
        id: 'editor'
    },
    {
        icon: LayoutDashboard,
        title: 'Link Management',
        desc: 'Take complete control of your digital assets with our centralized Link Management dashboard. Effortlessly organize, edit, and oversee every link you\'ve ever created. Whether you\'re running a single campaign or managing hundreds of URLs, our streamlined interface ensures you always know exactly where your traffic is directed.',
        id: 'management'
    },
    {
        icon: Share2,
        title: 'Branded Links',
        desc: 'Maximize your brand\'s visibility and build instant trust with every share. Create custom branded links that replace generic domains with your company\'s identity. Branded links not only look more professional but have been proven to significantly increase click-through rates by giving your audience confidence in where they are navigating.',
        id: 'branded'
    },
    {
        icon: BarChart2,
        title: 'Short URL Tracking',
        desc: 'Data-driven decisions start with comprehensive analytics. Our Short URL Tracking provides real-time insights into your link performance. Monitor click volumes, analyze device usage, understand geographic distribution, and track referrers to see exactly how and where your audience is engaging with your content.',
        id: 'tracking'
    },
    {
        icon: QrCode,
        title: 'QR Code Generator',
        desc: 'Bridge the gap between your physical and digital presence. Every short link you create automatically generates a high-quality QR code. Instantly download and share these codes on print materials, presentations, or digital displays to provide a seamless, scan-and-go experience for mobile users.',
        id: 'qrcode'
    },
    {
        icon: Code,
        title: 'Short URL API',
        desc: 'Built for developers, by developers. Our robust Short URL API allows you to programmatically create, manage, and track short URLs directly within your own applications. Automate your link generation and integrate our powerful infrastructure seamlessly into your existing workflows and software ecosystem.',
        id: 'api'
    }
];

export default function Features() {
    return (
        <main className="max-w-6xl mx-auto px-4 py-16 animate-fade-in">
            <div className="text-center mb-16 max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Powerful <span className="text-sky-400">Features</span>
                </h1>
                <p className="text-slate-400 text-lg">
                    Everything you need to manage, track, and optimize your links in one professional platform.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {FEATURES.map(({ icon: Icon, title, desc, id }) => (
                    <div key={id} id={id} className="card p-8 hover:border-sky-500/30 transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Icon size={24} className="text-sky-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            {desc}
                        </p>
                    </div>
                ))}
            </div>
        </main>
    );
}

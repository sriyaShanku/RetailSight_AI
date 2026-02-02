import { Github, Linkedin, Mail, Code, Palette, Brain, Server, Globe } from 'lucide-react';

const TeamMember = ({ name, role, responsibilities, image, icon: Icon }) => (
    <div className="group relative bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-8 hover:bg-card/60 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>

        <div className="relative flex flex-col items-center text-center">
            <div className="relative mb-6">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="relative w-32 h-32 rounded-2xl object-cover border-2 border-background shadow-xl transform group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="relative w-32 h-32 rounded-2xl bg-muted flex items-center justify-center border-2 border-background shadow-xl transform group-hover:scale-105 transition-transform duration-500">
                        <span className="text-4xl font-bold text-muted-foreground">{name.charAt(0)}</span>
                    </div>
                )}
                <div className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-xl text-primary-foreground shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                    <Icon size={18} />
                </div>
            </div>

            <h3 className="text-2xl font-bold mb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{name}</h3>
            <p className="text-primary font-medium mb-6 px-3 py-1 bg-primary/10 rounded-full text-sm inline-block">{role}</p>

            <div className="w-full space-y-3 text-left">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Key Responsibilities</h4>
                <ul className="space-y-2">
                    {responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80 group-hover:text-foreground transition-colors duration-300">
                            <div className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0"></div>
                            <span>{resp}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex gap-4 mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="p-2 hover:bg-muted rounded-full transition-colors"><Linkedin size={18} className="text-muted-foreground hover:text-primary" /></button>
                <button className="p-2 hover:bg-muted rounded-full transition-colors"><Github size={18} className="text-muted-foreground hover:text-primary" /></button>
                <button className="p-2 hover:bg-muted rounded-full transition-colors"><Mail size={18} className="text-muted-foreground hover:text-primary" /></button>
            </div>
        </div>
    </div>
);

const Team = () => {
    const team = [
        {
            name: "P Anand Kumar",
            role: "Frontend Developer",
            icon: Code,
            image: "",
            responsibilities: [
                "Developed the React-based web application",
                "Integrated FastAPI endpoints with UI",
                "Displayed demand forecasts, stock alerts, and reorder quantities"
            ]
        },
        {
            name: "Sri Varshini",
            role: "UI/UX Designer",
            icon: Palette,
            image: "/Varshini.jpg",
            responsibilities: [
                "Designed user-friendly dashboard layouts",
                "Selected color themes and icons",
                "Improved usability and visual clarity"
            ]
        },
        {
            name: "Sriya",
            role: "ML Engineer",
            icon: Brain,
            image: "",
            responsibilities: [
                "Built demand forecasting models",
                "Handled data preprocessing and feature engineering",
                "Generated accurate demand predictions"
            ]
        },
        {
            name: "Deekshita",
            role: "Backend Developer",
            icon: Server,
            image: "",
            responsibilities: [
                "Developed FastAPI backend services",
                "Connected ML models to APIs",
                "Managed JSON data flow and system integration"
            ]
        }
    ];

    const technologies = [
        { name: "React", category: "Frontend" },
        { name: "FastAPI", category: "Backend" },
        { name: "Python", category: "Backend" },
        { name: "Machine Learning", category: "AI/ML" },
        { name: "Tailwind CSS", category: "Styling" }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-12 bg-primary rounded-full"></div>
                <h1 className="text-4xl font-bold mb-2">Our Team</h1>
                <p className="text-muted-foreground text-lg">The brilliant minds behind RetailSight forecasting engine.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {team.map((member, idx) => (
                    <TeamMember key={idx} {...member} />
                ))}
            </div>

            {/* Technologies Section */}
            <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-3xl p-10 mt-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Technologies Used</h2>
                        <p className="text-muted-foreground">The stack that powers our predictive analytics.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {technologies.map((tech, idx) => (
                            <div
                                key={idx}
                                className="px-6 py-3 bg-background/50 border border-border rounded-2xl flex flex-col items-center gap-1 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-default"
                            >
                                <span className="text-foreground font-semibold">{tech.name}</span>
                                <span className="text-[10px] uppercase tracking-tighter text-muted-foreground">{tech.category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Quote or Mission */}
            <div className="text-center py-12">
                <p className="text-muted-foreground italic max-w-2xl mx-auto">
                    "Our mission is to empower retail businesses with accurate data-driven insights,
                    bridging the gap between manual inventory management and AI-powered automation."
                </p>
            </div>
        </div>
    );
};

export default Team;

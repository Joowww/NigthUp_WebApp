import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Sparkles, MapPin, Users, Calendar, Search, ArrowRight } from 'lucide-react';
import Logo from '../ui/Logo';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const WelcomeBanner: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative w-full overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-8 md:p-12 shadow-2xl border border-white/10"
        >
            {/* Background Decorative Elements */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px] animate-pulse" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-secondary/20 blur-[100px] animate-pulse" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Side: Text and Branding */}
                <div className="space-y-6">
                    <motion.div variants={itemVariants} className="flex items-center gap-3">
                        <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
                            <Logo className="text-xl md:text-2xl" />
                        </div>
                        <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-3">v2.0 Beta</Badge>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black text-white leading-[1.1]">
                        ¡Bienvenido a <span className="bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">NightUp</span>, {user?.username || 'Gamer'}!
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-lg text-white/70 max-w-xl leading-relaxed">
                        Explota la noche al máximo. Descubre los mejores eventos, planifica tus salidas con amigos y no te pierdas nada de lo que pasa en tu ciudad.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-4">
                        <button
                            onClick={() => navigate('/business')}
                            className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 px-8 py-4 rounded-2xl font-bold text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all group"
                        >
                            Ver Discotecas <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/friendship')}
                            className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-8 py-4 rounded-2xl font-bold text-white hover:bg-white/10 transition-all active:scale-95"
                        >
                            Comunidad Social
                        </button>
                    </motion.div>
                </div>

                {/* Right Side: Hero Visual or Features */}
                <motion.div
                    variants={itemVariants}
                    className="relative flex items-center justify-center p-4"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-full blur-3xl animate-pulse" />
                    <div className="grid grid-cols-2 gap-4 w-full relative z-10">
                        <FeatureCard
                            icon={<MapPin className="w-6 h-6 text-primary" />}
                            title="Explora"
                            desc="Los mejores locales cerca de ti"
                            onClick={() => navigate('/business')}
                        />
                        <FeatureCard
                            icon={<Calendar className="w-6 h-6 text-secondary" />}
                            title="Planifica"
                            desc="Organiza tu agenda social"
                            onClick={() => navigate('/calendar')}
                        />
                        <FeatureCard
                            icon={<Search className="w-6 h-6 text-accent" />}
                            title="Descubre"
                            desc="Nuevos eventos cada día"
                            onClick={() => navigate('/events')}
                        />
                        <FeatureCard
                            icon={<Users className="w-6 h-6 text-purple-400" />}
                            title="Conecta"
                            desc="Sal con tus amigos"
                            onClick={() => navigate('/friendship')}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Floating Elements Animation */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-1/4 opacity-20 hidden md:block"
            >
                <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
        </motion.div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, onClick?: () => void }> = ({ icon, title, desc, onClick }) => (
    <div
        onClick={onClick}
        className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-all group cursor-pointer"
    >
        <div className="mb-4 p-3 bg-white/5 rounded-xl w-fit group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-white font-bold mb-1">{title}</h3>
        <p className="text-white/40 text-xs leading-tight">{desc}</p>
    </div>
);

const Badge: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <span className={`text-[10px] font-black uppercase tracking-widest rounded-full border ${className}`}>
        {children}
    </span>
);

import { motion } from 'framer-motion';
import logo from '../../property-master.png';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glowing Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-brand-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-20 w-[30rem] h-[30rem] bg-accent-500/10 rounded-full blur-[140px]"
        />
        
        {/* Floating Geometric Elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1], 
              scale: [1, 1.5, 1],
              x: Math.random() * 400 - 200,
              y: Math.random() * 400 - 200,
              rotate: 360
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 0.5
            }}
            className="absolute h-1 w-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Animation */}
        <motion.div
          layoutId="main-logo"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full" />
          <img 
            src={logo} 
            alt="Property Master" 
            className="w-48 h-48 sm:w-64 sm:h-64 object-contain relative z-10"
          />
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col items-center"
        >
          <div className="flex gap-1.5 mb-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 bg-brand-500 rounded-full"
              />
            ))}
          </div>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.4em] font-bold">
            Curating Excellence
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

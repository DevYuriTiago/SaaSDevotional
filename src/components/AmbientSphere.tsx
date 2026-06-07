"use client";

import { motion } from "framer-motion";

interface AmbientSphereProps {
    size?: number;
    className?: string;
}

export default function AmbientSphere({ size = 280, className = "" }: AmbientSphereProps) {
    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            {/* Outer ambient glow */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(99,102,241,0.1) 40%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Mid ring */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: size * 0.75,
                    height: size * 0.75,
                    border: "1px solid rgba(168,85,247,0.2)",
                }}
                animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
            {/* Inner sphere */}
            <motion.div
                className="rounded-full"
                style={{
                    width: size * 0.52,
                    height: size * 0.52,
                    background: "radial-gradient(circle at 35% 35%, rgba(236,72,153,0.6), rgba(168,85,247,0.8) 40%, rgba(99,102,241,0.9) 80%)",
                    boxShadow: "0 0 60px rgba(168,85,247,0.5), 0 0 120px rgba(168,85,247,0.25), inset 0 0 40px rgba(255,255,255,0.1)",
                }}
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Shimmer overlay */}
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: size * 0.52,
                    height: size * 0.52,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)",
                    borderRadius: "50%",
                }}
            />
        </div>
    );
}

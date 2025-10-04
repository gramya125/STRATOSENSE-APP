import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Wind, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Forecast", path: "/forecast" },
    { name: "Health Alerts", path: "/health-alerts" },
    { name: "Settings", path: "/settings" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-1 rounded-2xl bg-gradient-to-br from-primary/90 to-accent/90 shadow-lg transform-gpu transition-transform group-hover:scale-105">
              {/* prettier-ignore */}
              <svg className="h-11 w-11" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0%" stopColor="#22c1c3" />
                    <stop offset="100%" stopColor="#6a11cb" />
                  </linearGradient>
                </defs>
                <rect width="64" height="64" rx="14" fill="url(#g1)" />
                <path d="M18 36c6-8 10-12 22-12" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="42" cy="22" r="3.5" fill="#fff" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>
                Stratosense
              </span>
              <span className="text-xs md:text-sm text-muted-foreground hidden md:inline">Predictive air quality</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  isActive(link.path)
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg mb-2 transition-all font-medium ${
                    isActive(link.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;

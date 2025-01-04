import { useAuth } from "@/lib/firebase/auth";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  Camera,
  ListTodo,
  History,
  BarChart2,
  Menu,
  X,
  Scroll,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // 初期化
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { href: "/record", label: "おみくじを記録", icon: Camera },
    { href: "/goals", label: "今年の抱負", icon: ListTodo },
    { href: "/goals/public", label: "みんなの抱負", icon: Users },
    { href: "/history", label: "おみくじ履歴", icon: History },
    { href: "/stats", label: "統計", icon: BarChart2 },
  ];

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        className="flex flex-row h-14 w-full items-center justify-between px-4"
        animate={{ y: isScrolled ? -2 : 0, scale: isScrolled ? 0.98 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          href="/"
          className="font-bold text-lg whitespace-nowrap flex items-center gap-2"
        >
          <Scroll className="h-5 w-5 text-slate-500" />
          おみログ
        </Link>

        {user && (
          <div className="flex items-center justify-end w-full">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isMenuOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>

            <AnimatePresence>
              {(!isMobile || isMenuOpen) && (
                <motion.nav
                  className={cn(
                    "hidden md:flex gap-2",
                    isMenuOpen
                      ? "!flex absolute left-0 right-0 top-14 flex-col bg-background/95 backdrop-blur border-b p-4 gap-2"
                      : "!flex"
                  )}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant="ghost"
                        asChild
                        className={cn(
                          "justify-start px-3",
                          "hover:bg-violet-50 hover:text-violet-900 dark:hover:bg-violet-900/20 dark:hover:text-violet-100"
                        )}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-2"
                        >
                          {item.icon && <item.icon className="h-4 w-4" />}
                          {item.label}
                        </Link>
                      </Button>
                    </motion.div>
                  ))}
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.header>
  );
}

"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Full-screen "98" mark loader — shown on first paint and automatically
 * whenever something on the site is taking longer than it should.
 */
export function LoadingScreen({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-paper"
          role="status"
          aria-live="polite"
          aria-label="Loading"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/logo-mark.png"
              alt=""
              width={1962}
              height={1511}
              priority
              className="h-14 w-auto sm:h-20"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

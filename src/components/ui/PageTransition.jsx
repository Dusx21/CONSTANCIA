import { motion } from 'framer-motion'

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
    filter: 'blur(3px)'
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(2px)',
    transition: {
      duration: 0.18,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

export default function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  )
}

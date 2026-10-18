"use client"

import { motion, useReducedMotion } from "framer-motion"

import { ENTRANCE_EASE } from "../utils/field-styles"

interface AnimatedHeadlineProps {
  words: string[]
  emphasis: string
}

export function AnimatedHeadline({ words, emphasis }: AnimatedHeadlineProps) {
  const reduceMotion = useReducedMotion()

  return (
    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl text-balance">
      {words.map((word, index) => (
        <motion.span
          key={word}
          className="inline-block"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.28,
            delay: reduceMotion ? 0 : index * 0.15,
            ease: ENTRANCE_EASE,
          }}
        >
          {word}&nbsp;
        </motion.span>
      ))}
      <motion.span
        className="font-serif font-normal italic text-emerald-600"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.28,
          delay: reduceMotion ? 0 : words.length * 0.15,
          ease: ENTRANCE_EASE,
        }}
      >
        {emphasis}
      </motion.span>
    </h1>
  )
}

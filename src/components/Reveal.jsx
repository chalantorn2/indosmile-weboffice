import { motion } from 'motion/react';
import { fadeUp, stagger, viewportOnce } from '../lib/motion';

// Scroll-reveal wrapper. Covers the common case so pages do not each repeat
// variants/initial/whileInView/viewport — reach for <motion.div> directly only
// when a section needs something these two do not express.

export function Reveal({ variants = fadeUp, as = 'div', children, ...rest }) {
  const Component = motion[as];
  return (
    <Component
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      {...rest}
    >
      {children}
    </Component>
  );
}

// Parent for a grid of cards. Children must be <RevealItem> (or any motion
// element with variants={fadeUp}) — they inherit hidden/visible from here.
export function RevealGroup({ as = 'div', children, ...rest }) {
  const Component = motion[as];
  return (
    <Component
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      {...rest}
    >
      {children}
    </Component>
  );
}

// A card inside RevealGroup. No initial/animate of its own on purpose: the
// parent drives the cascade.
export function RevealItem({ as = 'div', lift = false, children, ...rest }) {
  const Component = motion[as];
  return (
    <Component
      variants={fadeUp}
      whileHover={lift ? { y: -6, transition: { duration: 0.2 } } : undefined}
      {...rest}
    >
      {children}
    </Component>
  );
}

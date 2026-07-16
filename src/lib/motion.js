// Shared Motion variants for the customer-facing site.
//
// Durations track DESIGN_SYSTEM.md §8: 200ms for interaction feedback, 300ms
// for anything that moves a block of content. Reduced-motion is handled once
// by <MotionConfig reducedMotion="user"> in App.jsx — do not gate on it here.

// Distance a revealing element travels before settling. Small on purpose: past
// ~24px the movement reads as the layout being broken rather than as polish.
const RISE = 16;

export const EASE_OUT = [0.16, 1, 0.3, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: RISE },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: EASE_OUT } },
};

export const fadeFromLeft = {
  hidden: { opacity: 0, x: -RISE * 1.5 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const fadeFromRight = {
  hidden: { opacity: 0, x: RISE * 1.5 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

// Parent for a grid/list of fadeUp children. Children inherit `hidden`/`visible`
// from the parent automatically — they need `variants={fadeUp}` and nothing else.
export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// Slower cascade for short lists where 80ms reads as too abrupt.
export const staggerSlow = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// Scroll-reveal viewport config. `once` because re-animating on every scroll
// past is noise; the -80px margin fires the reveal just before the element is
// fully in view so it never completes off-screen.
export const viewportOnce = { once: true, margin: '-80px' };

// Card hover: lift + settle. Pairs with existing Tailwind hover:shadow-xl.
export const hoverLift = {
  rest: { y: 0 },
  hover: { y: -6, transition: { duration: 0.2, ease: EASE_OUT } },
};

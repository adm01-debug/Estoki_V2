/**
 * Haptic Feedback Utility
 * Provides tactile feedback for critical user actions.
 */
export const haptics = {
  /**
   * Light tap for navigation or selection
   */
  light: () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(5);
    }
  },

  /**
   * Medium impact for primary actions (save, confirm)
   */
  medium: () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(15);
    }
  },

  /**
   * Double tap for success confirmation
   */
  success: () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([10, 30, 10]);
    }
  },

  /**
   * Distinct pattern for errors or warnings
   */
  error: () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([50, 100, 50]);
    }
  }
};
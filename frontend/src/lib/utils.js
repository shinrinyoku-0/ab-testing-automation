/**
 * Utility function to conditionally join classNames together
 * Filters out falsy values and joins valid strings with spaces
 * 
 * @param  {...any} classes - Class names or conditional expressions
 * @returns {string} Combined class name string
 * 
 * @example
 * cn('base-class', isActive && 'active-class', 'another-class')
 * // Returns: 'base-class active-class another-class' (if isActive is true)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

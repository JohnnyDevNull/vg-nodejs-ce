/**
 * Generates a six numeric char long activation code
 */
export function getActivationCode(): string {
  return (Math.random() * 1000000).toFixed(0).padStart(6, '0');
}

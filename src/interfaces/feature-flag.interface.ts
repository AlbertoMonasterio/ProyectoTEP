// src/interfaces/feature-flag.interface.ts

/**
 * Define la estructura de una única feature flag.
 * - `environments`: Array opcional de entornos donde esta flag está activa.
 * - `users`: Array opcional de IDs de usuario o roles para quienes esta flag está activa.
 */
export interface FeatureFlagConfigItem {
  environments?: ('dev' | 'test' | 'prod')[];
  users?: string[];
}

/**
 * Define la estructura completa de la configuración de las feature flags,
 * donde cada clave es el nombre de una feature flag y su valor es un FeatureFlagConfigItem.
 */
export interface FeatureFlagsConfiguration {
  [flagName: string]: FeatureFlagConfigItem;
}
// src/feature-flag.service.ts
import { FeatureFlagsConfiguration, FeatureFlagConfigItem } from './interfaces/feature-flag.interface';

/**
 * Servicio central para la gestión y evaluación de Feature Flags.
 * Permite determinar si una funcionalidad está habilitada basándose en un conjunto
 * de reglas de configuración (entorno y/o usuario).
 */
export class FeatureFlagService {
  private config: FeatureFlagsConfiguration;
  private currentEnvironment: 'dev' | 'test' | 'prod';

  /**
   * Constructor del servicio de Feature Flags.
   * @param config La configuración inicial de todas las feature flags.
   * @param environment El entorno actual de la aplicación (dev, test, prod).
   * @throws Error si la configuración o el entorno no son válidos.
   */
  constructor(config: FeatureFlagsConfiguration, environment: 'dev' | 'test' | 'prod') {
    if (!config) {
        throw new Error("La configuración de las Feature Flags es requerida.");
    }
    if (!environment || !['dev', 'test', 'prod'].includes(environment)) {
        throw new Error("Un entorno válido ('dev', 'test', 'prod') es requerido.");
    }
    this.config = config;
    this.currentEnvironment = environment;
  }

  /**
   * Verifica si una feature flag específica está habilitada para el entorno y usuario dados.
   * La flag se considera habilitada si todas las condiciones aplicables (entorno y usuario) se cumplen.
   * @param flagName El nombre de la feature flag a verificar.
   * @param userId Opcional: El ID del usuario actual para la comprobación por usuario.
   * @returns true si la feature flag está habilitada, false en caso contrario.
   */
  public isFeatureEnabled(flagName: string, userId?: string): boolean {
    const flagSettings = this.config[flagName];

    // Si la flag no está definida en la configuración, por defecto la consideramos deshabilitada.
    if (!flagSettings) {
      console.warn(`[FeatureFlagService] Feature flag '${flagName}' not found in configuration. Defaulting to disabled.`);
      return false;
    }

    // 1. Comprobación de entorno:
    // Si la flag tiene entornos definidos, el entorno actual debe estar en esa lista.
    // Si no tiene entornos definidos, se asume que coincide con cualquier entorno.
    let environmentMatches = true;
    if (flagSettings.environments && flagSettings.environments.length > 0) {
      environmentMatches = flagSettings.environments.includes(this.currentEnvironment);
    }

    // 2. Comprobación de usuario:
    // Si la flag tiene usuarios definidos, el userId proporcionado debe estar en esa lista.
    // Si no tiene usuarios definidos, se asume que coincide con cualquier usuario.
    // Si se requieren usuarios específicos pero no se proporciona un userId, no coincide.
    let userMatches = true;
    if (flagSettings.users && flagSettings.users.length > 0) {
      if (!userId) {
        userMatches = false;
      } else {
        userMatches = flagSettings.users.includes(userId);
      }
    }

    // La feature flag está habilitada solo si coinciden tanto las condiciones de entorno como las de usuario (si aplican).
    return environmentMatches && userMatches;
  }

  /**
   * Obtiene los detalles de configuración de una feature flag específica.
   * @param flagName El nombre de la feature flag.
   * @returns Los detalles de configuración de la flag (FeatureFlagConfigItem) o undefined si no se encuentra.
   */
  public getFlagDetails(flagName: string): FeatureFlagConfigItem | undefined {
    return this.config[flagName];
  }

  /**
   * Obtiene la configuración completa de todas las feature flags cargadas en el servicio.
   * @returns Un objeto con la configuración de todas las feature flags. Se retorna una copia para evitar modificaciones directas.
   */
  public getAllFeatureFlags(): FeatureFlagsConfiguration {
    return { ...this.config }; // Retorna una copia superficial
  }

  /**
   * Establece un nuevo entorno actual para la evaluación de feature flags.
   * Esto puede ser útil para pruebas o si el entorno de ejecución puede cambiar dinámicamente.
   * @param environment El nuevo entorno a establecer ('dev', 'test', 'prod').
   * @throws Error si el entorno proporcionado no es válido.
   */
  public setEnvironment(environment: 'dev' | 'test' | 'prod'): void {
    if (!environment || !['dev', 'test', 'prod'].includes(environment)) {
        throw new Error("Un entorno válido ('dev', 'test', 'prod') es requerido para establecer el entorno.");
    }
    this.currentEnvironment = environment;
  }

  /**
   * Actualiza la configuración de las feature flags.
   * Esto reemplaza la configuración existente con la nueva configuración proporcionada.
   * @param newConfig La nueva configuración de las feature flags.
   * @throws Error si la nueva configuración no es válida.
   */
  public updateConfig(newConfig: FeatureFlagsConfiguration): void {
    if (!newConfig) {
        throw new Error("La nueva configuración no puede ser nula o indefinida.");
    }
    this.config = newConfig;
  }
}
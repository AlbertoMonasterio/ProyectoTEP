// src/feature-flag.service.ts

import { FeatureFlagsConfiguration, FeatureFlagConfigItem } from './interfaces/feature-flag.interface';

export class FeatureFlagService {
  private config: FeatureFlagsConfiguration;
  private currentEnvironment: 'dev' | 'test' | 'prod';

  /**
   * Crea una nueva instancia de FeatureFlagService.
   * @param config La configuración inicial de las feature flags.
   * @param environment El entorno inicial de la aplicación ('dev', 'test', o 'prod').
   * @throws {Error} Si la configuración o el entorno no son válidos.
   */
  constructor(config: FeatureFlagsConfiguration, environment: 'dev' | 'test' | 'prod') {
    if (!config) {
      throw new Error("La configuración de Feature Flags es requerida.");
    }
    if (!environment || !['dev', 'test', 'prod'].includes(environment)) {
      throw new Error("Un entorno válido ('dev', 'test', 'prod') es requerido.");
    }
    this.config = config;
    this.currentEnvironment = environment;
  }

  /**
   * Verifica si una feature flag específica está habilitada para el entorno actual
   * y, opcionalmente, para un usuario dado.
   *
   * @param flagName El nombre de la feature flag a verificar.
   * @param user Opcional. El ID o rol del usuario para quien se verifica la flag.
   * @returns `true` si la feature flag está habilitada según la configuración y el entorno/usuario; de lo contrario, `false`.
   */
  public isFeatureEnabled(flagName: string, user?: string): boolean {
    const flagSettings = this.config[flagName];

    if (!flagSettings) {
      console.warn(`[FeatureFlagService] La feature flag '${flagName}' no se encontró en la configuración. Por defecto, está deshabilitada.`);
      return false;
    }

    // 1. Verificar el entorno
    const isEnvironmentEnabled = flagSettings.environments.includes(this.currentEnvironment);
    if (!isEnvironmentEnabled) {
      return false; // Si no está habilitada para el entorno actual, es false
    }

    // 2. Si el entorno está habilitado, verificar las condiciones de usuario
    // Si la lista de usuarios está vacía o no existe, la feature está habilitada para CUALQUIER usuario en este entorno.
    if (!flagSettings.users || flagSettings.users.length === 0) {
      return true;
    } else {
      // Si se especifican usuarios, se debe proporcionar un usuario y debe estar en la lista.
      return user ? flagSettings.users.includes(user) : false;
    }
  }

  /**
   * Establece el entorno actual para la evaluación de las feature flags.
   * @param environment El nuevo entorno ('dev', 'test', o 'prod').
   * @throws {Error} Si el entorno proporcionado no es válido.
   */
  public setEnvironment(environment: 'dev' | 'test' | 'prod'): void {
    if (!environment || !['dev', 'test', 'prod'].includes(environment)) {
      throw new Error("Un entorno válido ('dev', 'test', 'prod') es requerido para establecer el entorno.");
    }
    this.currentEnvironment = environment;
  }

  /**
   * Obtiene los detalles de configuración de una feature flag específica.
   * @param flagName El nombre de la feature flag.
   * @returns Un objeto `FeatureFlagConfigItem` con los detalles de la flag, o `undefined` si la flag no se encuentra.
   */
  public getFlagDetails(flagName: string): FeatureFlagConfigItem | undefined {
    return this.config[flagName];
  }

  /**
   * Devuelve una copia de la configuración actual de todas las feature flags.
   * @returns Un objeto `FeatureFlagsConfiguration` que representa la configuración actual.
   */
  public getAllFeatureFlags(): FeatureFlagsConfiguration {
    return { ...this.config }; // Devolver una copia para evitar mutaciones externas
  }

  /**
   * Reemplaza *completamente* la configuración de las feature flags con una nueva.
   * Las flags no presentes en `newConfig` serán eliminadas.
   * @param newConfig La nueva configuración completa de las feature flags.
   */
  public updateConfig(newConfig: FeatureFlagsConfiguration): void {
    this.config = newConfig;
  }

  /**
   * Actualiza o añade una *feature flag* específica, fusionando sus propiedades
   * con la configuración existente. Si la flag no existe, la añade.
   * Si ya existe, sus propiedades (incluyendo los arrays 'environments' y 'users')
   * serán sobrescritas completamente por `updatedFlagConfig`.
   * @param flagName El nombre de la feature flag a actualizar o añadir.
   * @param updatedFlagConfig El objeto de configuración parcial o completo de la feature flag.
   */
  public updateFeatureFlag(flagName: string, updatedFlagConfig: Partial<FeatureFlagConfigItem>): void {
    // Asegurarse de que el objeto de configuración base para la flag exista.
    // Si la flag no existe, se inicializa con un objeto vacío.
    const currentFlagConfig = this.config[flagName] || {};

    // Fusionar las propiedades existentes con las propiedades actualizadas.
    // Esto asegura que solo las propiedades proporcionadas en `updatedFlagConfig` sean cambiadas.
    // Nota: Si `updatedFlagConfig` incluye 'environments' o 'users', esos arrays serán reemplazados.
    this.config = {
      ...this.config, // Copiar todas las flags existentes
      [flagName]: {   // Actualizar o añadir la flag específica
        ...currentFlagConfig,
        ...updatedFlagConfig
      }
    };
  }
}
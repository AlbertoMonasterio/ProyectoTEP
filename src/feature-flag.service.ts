// En src/feature-flag.service.ts
import { FeatureFlagsConfiguration, FeatureFlagConfigItem } from './interfaces/feature-flag.interface';

export class FeatureFlagService {
  private config: FeatureFlagsConfiguration;
  private currentEnvironment: 'dev' | 'test' | 'prod';

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

  public isFeatureEnabled(flagName: string, user?: string): boolean {
    const flagSettings = this.config[flagName];

    if (!flagSettings) {
      console.warn(`[FeatureFlagService] Feature flag '${flagName}' not found in configuration. Defaulting to disabled.`);
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

  // ... (otros métodos como getFlagDetails, getAllFeatureFlags, setEnvironment, updateConfig)

  public setEnvironment(environment: 'dev' | 'test' | 'prod'): void {
    if (!environment || !['dev', 'test', 'prod'].includes(environment)) {
      throw new Error("Un entorno válido ('dev', 'test', 'prod') es requerido para establecer el entorno.");
    }
    this.currentEnvironment = environment;
  }

  public getFlagDetails(flagName: string): FeatureFlagConfigItem | undefined {
    return this.config[flagName];
  }

  public getAllFeatureFlags(): FeatureFlagsConfiguration {
    return { ...this.config }; // Devolver una copia para evitar mutaciones externas
  }

  public updateConfig(newConfig: FeatureFlagsConfiguration): void {
    this.config = newConfig; // Asumo que `updateConfig` reemplaza la configuración existente
  }
}
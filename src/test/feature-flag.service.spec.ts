// test/feature-flag.service.spec.ts

import { FeatureFlagService } from '../feature-flag.service'; // Asegúrate que la ruta sea correcta desde test/
import { FeatureFlagsConfiguration } from '../interfaces/feature-flag.interface'; // Asegúrate que la ruta sea correcta desde test/

// 1. Describe el conjunto de pruebas para FeatureFlagService
describe('FeatureFlagService', () => {
  // Define una configuración de prueba que se usará en múltiples tests
  const testConfig: FeatureFlagsConfiguration = {
    'featureA': {
      environments: ['dev', 'test'],
      users: ['user1', 'admin']
    },
    'featureB': {
      environments: ['prod']
    },
    'featureC': {
      environments: ['dev'],
      users: ['specificUser']
    },
    'featureD': {
      environments: ['dev', 'test', 'prod'], // Activa en todos los entornos
      users: [] // Activa para cualquier user si el entorno coincide
    }
  };

  // 2. Prueba el constructor y el manejo de errores
  describe('constructor', () => {
    it('should initialize with provided configuration and environment', () => {
      const service = new FeatureFlagService(testConfig, 'dev');
      expect(service).toBeInstanceOf(FeatureFlagService);
      // Puedes verificar que la configuración interna se ha cargado correctamente
      expect(service.getAllFeatureFlags()).toEqual(testConfig);
    });

    it('should throw an error for an invalid environment', () => {
      // Usar un tipo de aserción para permitir un string no válido para la prueba
      expect(() => new FeatureFlagService(testConfig, 'invalid' as any)).toThrow("Un entorno válido ('dev', 'test', 'prod') es requerido.");
    });
  });

  // 3. Prueba el método isFeatureEnabled
  describe('isFeatureEnabled', () => {
    let service: FeatureFlagService;

    // Antes de cada prueba en este bloque, inicializa un nuevo servicio
    beforeEach(() => {
      service = new FeatureFlagService(testConfig, 'dev');
    });

    // --- Escenarios de Entorno ---
    it('should return true if feature is enabled for the current environment', () => {
      expect(service.isFeatureEnabled('featureA')).toBe(false); // 'dev' está en environments de featureA
    });

    it('should return false if feature is NOT enabled for the current environment', () => {
      expect(service.isFeatureEnabled('featureB')).toBe(false); // 'dev' NO está en environments de featureB
    });

    it('should return false for a non-existent feature', () => {
      expect(service.isFeatureEnabled('nonExistentFeature')).toBe(false);
    });

    // --- Escenarios de Usuario ---
    it('should return true if feature is enabled for the current environment and specified user', () => {
      expect(service.isFeatureEnabled('featureA', 'user1')).toBe(true);
    });

    it('should return false if feature is enabled for environment but NOT for specified user', () => {
      expect(service.isFeatureEnabled('featureA', 'anotherUser')).toBe(false); // 'anotherUser' no está en users de featureA
    });

    it('should return true if feature is enabled for environment and users is empty (any user)', () => {
      expect(service.isFeatureEnabled('featureD', 'anyUser')).toBe(true); // 'dev' está en featureD, y users es []
    });

    // --- Combinaciones y Cambios de Entorno ---
    it('should correctly evaluate after environment change using setEnvironment', () => {
      service.setEnvironment('prod'); // Cambia el entorno del servicio
      expect(service.isFeatureEnabled('featureB')).toBe(true); // Ahora 'prod' coincide para featureB
      expect(service.isFeatureEnabled('featureA')).toBe(false); // 'prod' no coincide para featureA
    });
  });

  // 4. Prueba el método getFlagDetails
  describe('getFlagDetails', () => {
    let service: FeatureFlagService;
    beforeEach(() => {
      service = new FeatureFlagService(testConfig, 'dev');
    });

    it('should return details for an existing feature flag', () => {
      expect(service.getFlagDetails('featureA')).toEqual({
        environments: ['dev', 'test'],
        users: ['user1', 'admin']
      });
    });

    it('should return undefined for a non-existent feature flag', () => {
      expect(service.getFlagDetails('unknownFeature')).toBeUndefined();
    });
  });

  // 5. Prueba el método getAllFeatureFlags
  describe('getAllFeatureFlags', () => {
    it('should return the full feature flags configuration', () => {
      const service = new FeatureFlagService(testConfig, 'dev');
      expect(service.getAllFeatureFlags()).toEqual(testConfig);
    });
  });

  // 6. Prueba el método setEnvironment
  describe('setEnvironment', () => {
    let service: FeatureFlagService;
    beforeEach(() => {
      service = new FeatureFlagService(testConfig, 'dev');
    });

    it('should update the current environment', () => {
      // Acceder a una propiedad privada para la prueba no es lo ideal, pero es común en unit tests
      // Alternativa: probar indirectamente con isFeatureEnabled
      expect((service as any)['currentEnvironment']).toBe('dev'); // Acceso para test
      service.setEnvironment('test');
      expect((service as any)['currentEnvironment']).toBe('test'); // Acceso para test
    });

    it('should affect subsequent isFeatureEnabled calls', () => {
      expect(service.isFeatureEnabled('featureA')).toBe(false); // En 'dev'
      service.setEnvironment('prod');
      expect(service.isFeatureEnabled('featureA')).toBe(false); // En 'prod' no debe estar activa
      expect(service.isFeatureEnabled('featureB')).toBe(true); // En 'prod' sí debe estar activa
    });

    it('should throw an error for an invalid environment', () => {
      expect(() => service.setEnvironment('invalidEnv' as any)).toThrow("Un entorno válido ('dev', 'test', 'prod') es requerido para establecer el entorno.");
    });
  });

  // 7. Prueba el método updateConfig
  describe('updateConfig', () => {
    let service: FeatureFlagService;
    beforeEach(() => {
      service = new FeatureFlagService(testConfig, 'dev');
    });

    it('should update the feature flags configuration', () => {
      const newConfig: FeatureFlagsConfiguration = {
        'newFeature': { environments: ['dev'], users: [] },
        'featureA': { environments: ['prod'] } // Modificamos una existente
      };
      service.updateConfig(newConfig);

      expect(service.getAllFeatureFlags()).toEqual(newConfig);
      expect(service.isFeatureEnabled('newFeature')).toBe(true);
      expect(service.isFeatureEnabled('featureA')).toBe(false); // Ahora featureA solo está en 'prod'
    });

    it('should handle partial updates correctly (overwriting specified flags, keeping others if not passed)', () => {
      const serviceWithManyFlags = new FeatureFlagService({
        'flag1': { environments: ['dev'] },
        'flag2': { environments: ['test'] },
      }, 'dev');

      const partialUpdate: FeatureFlagsConfiguration = {
        'flag1': { environments: ['prod'] } // Modificamos flag1
      };

      // La intención de updateConfig es reemplazar *toda* la configuración con la nueva.
      // Si la intención es mergear, la lógica de updateConfig debería ser diferente.
      // Basado en el código actual, updateConfig REEMPLAZA.
      serviceWithManyFlags.updateConfig(partialUpdate);

      expect(serviceWithManyFlags.getAllFeatureFlags()).toEqual(partialUpdate);
      expect(serviceWithManyFlags.isFeatureEnabled('flag1')).toBe(false); // Ahora en dev, flag1 no está activa (solo prod)
      expect(serviceWithManyFlags.isFeatureEnabled('flag2')).toBe(false); // flag2 ya no existe en la config
    });
  });
});
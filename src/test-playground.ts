// src/test-playground.ts


import { FeatureFlagService } from './feature-flag.service';

import { FeatureFlagsConfiguration, FeatureFlagConfigItem } from './interfaces/feature-flag.interface';


// Define una configuración de Feature Flags de ejemplo
const myTestFeatureFlagsConfig: FeatureFlagsConfiguration = {
  // Flag activa en desarrollo y pruebas, para un usuario 'tester1'
  'newFeatureA': {
    environments: ['dev', 'test'],
    users: ['tester1']
  },
  // Flag activa en producción para cualquier usuario
  'featureBForProd': {
    environments: ['prod']
  },
  // Flag activa en desarrollo para cualquier usuario
  'devOnlyFeature': {
    environments: ['dev']
  },
  // Flag activa en todos los entornos, solo para usuarios 'admin'
  'adminAccess': {
    environments: ['dev', 'test', 'prod'],
    users: ['admin']
  }
};

// 3. Simula diferentes entornos y usuarios para probar
console.log('--- Probando en entorno DEV ---');
const devService = new FeatureFlagService(myTestFeatureFlagsConfig, 'dev');

console.log(`newFeatureA (dev, user: tester1): ${devService.isFeatureEnabled('newFeatureA', 'tester1')}`);
console.log(`newFeatureA (dev, user: other): ${devService.isFeatureEnabled('newFeatureA', 'other')}`);
console.log(`featureBForProd (dev, no user): ${devService.isFeatureEnabled('featureBForProd')}`);
console.log(`devOnlyFeature (dev, no user): ${devService.isFeatureEnabled('devOnlyFeature')}`);
console.log(`adminAccess (dev, user: admin): ${devService.isFeatureEnabled('adminAccess', 'admin')}`);
console.log(`adminAccess (dev, user: regular): ${devService.isFeatureEnabled('adminAccess', 'regular')}`);

console.log('\n--- Probando en entorno PROD ---');
const prodService = new FeatureFlagService(myTestFeatureFlagsConfig, 'prod');

console.log(`newFeatureA (prod, user: tester1): ${prodService.isFeatureEnabled('newFeatureA', 'tester1')}`);
console.log(`featureBForProd (prod, no user): ${prodService.isFeatureEnabled('featureBForProd')}`);
console.log(`devOnlyFeature (prod, no user): ${prodService.isFeatureEnabled('devOnlyFeature')}`);
console.log(`adminAccess (prod, user: admin): ${prodService.isFeatureEnabled('adminAccess', 'admin')}`);

// Probando otros métodos:
console.log('\n--- Probando getFlagDetails ---');
console.log('Detalles de adminAccess:', prodService.getFlagDetails('adminAccess'));
console.log('Detalles de nonExistentFlag:', prodService.getFlagDetails('nonExistentFlag')); // Debería ser undefined

console.log('\n--- Probando getAllFeatureFlags ---');
console.log('Todas las flags:', prodService.getAllFeatureFlags());

console.log('\n--- Probando setEnvironment ---');
// Acceder a 'currentEnvironment' directamente es solo para depuración en este playground.
// En un código de producción, no se accedería a propiedades privadas de esta forma.
console.log('DevService antes de setEnvironment:', (devService as any)['currentEnvironment']);
devService.setEnvironment('test');
console.log('DevService después de setEnvironment:', (devService as any)['currentEnvironment']);
console.log(`newFeatureA (test, user: tester1): ${devService.isFeatureEnabled('newFeatureA', 'tester1')}`);

console.log('\n--- Probando updateConfig ---');
const originalConfig = devService.getAllFeatureFlags();
//  Asegura que newConfig sea explícitamente del tipo FeatureFlagsConfiguration.
const newConfig: FeatureFlagsConfiguration = {
  ...originalConfig,
  'newConfigFeature': {
    environments: ['dev'],
    users: ['newuser']
  }
};
devService.updateConfig(newConfig);
console.log('Configuración después de updateConfig:', devService.getAllFeatureFlags());
console.log(`newConfigFeature (dev, user: newuser): ${devService.isFeatureEnabled('newConfigFeature', 'newuser')}`);
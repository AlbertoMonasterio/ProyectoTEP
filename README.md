
````markdown
# `feature-flag-service-tep`

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Una librería TypeScript robusta y flexible para la gestión de Feature Flags (también conocidas como Feature Toggles), diseñada pensando en la compatibilidad con el framework NestJS. Permite habilitar o deshabilitar funcionalidades dinámicamente en tu aplicación, controlar el acceso por entorno y usuario específico, y actualizar la configuración en tiempo de ejecución.

---

## 🚀 Características Principales

* **Gestión por Entorno Específico:** Opera con los entornos predefinidos `dev`, `test` y `prod`.
* **Control por Usuario:** Habilita flags para usuarios específicos o grupos.
* **Configuración Dinámica:** Actualiza las flags en tiempo de ejecución sin necesidad de reiniciar la aplicación.
* **Servicio Centralizado:** Provee un `FeatureFlagService` para una gestión sencilla y coherente.
* **Compatibilidad NestJS:** Diseñado con NestJS en mente para una fácil integración (a través de un módulo NestJS, que se implementará en la aplicación consumidora).

---

## 📦 Instalación

Dado que esta librería está en desarrollo y se consumirá desde un repositorio de GitHub, puedes instalarla directamente en tu proyecto (por ejemplo, tu servidor de demostración de NestJS) de la siguiente manera:

1.  Asegúrate de que tus cambios estén subidos a la **rama `develop`** de tu repositorio de la librería.

2.  En el **`package.json` de tu proyecto consumidor** (ej. tu servidor NestJS de demostración), añade la siguiente dependencia:

    ```json
    "dependencies": {
      // ... otras dependencias de tu proyecto
      "feature-flag-service-tep": "git+[https://github.com/TU_USUARIO_DE_GITHUB/feature-flag-service-tep.git#develop](https://github.com/TU_USUARIO_DE_GITHUB/feature-flag-service-tep.git#develop)"
    }
    ```

    *Reemplaza `TU_USUARIO_DE_GITHUB` con tu nombre de usuario de GitHub.*

3.  Ejecuta `npm install` (o `yarn install`) en el directorio de tu proyecto consumidor:

    ```bash
    npm install
    ```

    Esto descargará el repositorio, ejecutará el *build* de la librería y solo instalará los archivos compilados (`.js` y `.d.ts`) en tu `node_modules` gracias a la configuración `files` en el `package.json` de la librería.

---

## 🛠️ Uso Básico

Una vez instalada, puedes importar y utilizar `FeatureFlagService` en tu aplicación.

### 1. Definir tu Configuración de Feature Flags

Crea un objeto de configuración que siga la interfaz `FeatureFlagsConfiguration`. Las propiedades `enabled` de cada flag deben incluir los entornos `dev`, `test` y `prod`.

```typescript
// src/config/feature-flags.config.ts (ejemplo)
import { FeatureFlagsConfiguration } from 'feature-flag-service-tep';

export const AppFeatureFlags: FeatureFlagsConfiguration = {
  'new-dashboard': {
    description: 'Habilita el nuevo diseño del panel de control.',
    enabled: {
      dev: true,
      test: true,
      prod: false, // Deshabilitado por defecto en producción
    },
    users: ['admin', 'johndoe'], // Opcional: solo estos usuarios pueden verla si está habilitada para el entorno
  },
  'email-notifications': {
    description: 'Activa el envío de notificaciones por correo electrónico.',
    enabled: {
      dev: true,
      test: false,
      prod: true,
    },
  },
  'beta-feature': {
    description: 'Acceso a una característica en fase beta para testers.',
    enabled: {
      dev: true,
      test: false, // Ejemplo: deshabilitado en test, para probar en dev
      prod: false
    },
    users: ['betatester1', 'betatester2']
  }
};
````

### 2\. Inicializar y Utilizar `FeatureFlagService`

Puedes instanciar el servicio con tu configuración y el entorno actual. El entorno inicial debe ser `'dev'`, `'test'` o `'prod'`.

```typescript
// main.ts o un servicio/módulo de tu aplicación NestJS
import { FeatureFlagService } from 'feature-flag-service-tep';
import { AppFeatureFlags } from './config/feature-flags.config'; // Tu configuración

// Ejemplo de inicialización
// Asegúrate de que process.env.NODE_ENV o tu variable de entorno sea 'dev', 'test', o 'prod'
const currentEnv: 'dev' | 'test' | 'prod' = (process.env.NODE_ENV === 'production' ? 'prod' : (process.env.NODE_ENV === 'test' ? 'test' : 'dev'));
const featureFlagService = new FeatureFlagService(AppFeatureFlags, currentEnv);

// Verificar si una feature está habilitada
if (featureFlagService.isFeatureEnabled('new-dashboard')) {
  console.log('El nuevo panel de control está habilitado.');
} else {
  console.log('Usando el panel de control antiguo.');
}

// Verificar para un usuario específico
const userId = 'admin';
if (featureFlagService.isFeatureEnabled('beta-feature', userId)) {
  console.log(`El usuario ${userId} tiene acceso a la característica beta.`);
} else {
  console.log(`El usuario ${userId} NO tiene acceso a la característica beta.`);
}

// Obtener detalles de una flag
const details = featureFlagService.getFlagDetails('email-notifications');
if (details) {
  console.log(`Descripción de 'email-notifications': ${details.description}`);
}

// Obtener todas las flags
console.log('Todas las flags:', featureFlagService.getAllFeatureFlags());

// Cambiar el entorno en tiempo de ejecución (útil para tests o entornos dinámicos)
// El entorno debe ser 'dev', 'test' o 'prod'
featureFlagService.setEnvironment('prod');
if (featureFlagService.isFeatureEnabled('new-dashboard')) {
  console.log('Después de cambiar a producción, el nuevo panel está habilitado (lo cual es falso en nuestro ejemplo de config).');
} else {
  console.log('Después de cambiar a producción, el nuevo panel está deshabilitado.'); // Esto se imprimiría
}

// Actualizar configuración en tiempo de ejecución
featureFlagService.updateConfig({
    'new-dashboard': {
        description: 'Actualización: Nuevo dashboard para todos en producción!',
        enabled: {
            prod: true // Ahora habilitada en producción
        }
    }
});

if (featureFlagService.isFeatureEnabled('new-dashboard')) {
    console.log('Después de actualizar la config, el nuevo panel está habilitado en producción.'); // Esto se imprimiría
}
```

-----

## 🚀 API

El `FeatureFlagService` expone los siguientes métodos públicos:

  * `constructor(config: FeatureFlagsConfiguration, initialEnvironment: 'dev' | 'test' | 'prod')`: Inicializa el servicio con la configuración y el entorno inicial. El entorno debe ser uno de los predefinidos (`'dev'`, `'test'`, `'prod'`).
  * `isFeatureEnabled(flagName: string, userId?: string): boolean`: Verifica si una feature flag está habilitada para el entorno actual y, opcionalmente, para un usuario específico.
  * `getFlagDetails(flagName: string): FeatureFlagConfigItem | undefined`: Devuelve los detalles de una feature flag específica o `undefined` si no se encuentra.
  * `getAllFeatureFlags(): FeatureFlagsConfiguration`: Devuelve el objeto de configuración completo de las feature flags.
  * `setEnvironment(newEnvironment: 'dev' | 'test' | 'prod'): void`: Cambia el entorno actual de la librería en tiempo de ejecución. **Solo acepta `'dev'`, `'test'` o `'prod'`.**
  * `updateConfig(newConfig: Partial<FeatureFlagsConfiguration>): void`: Actualiza la configuración de las feature flags. Se fusiona con la configuración existente, permitiendo actualizaciones parciales.

-----

## 👩‍💻 Desarrollo

Para trabajar en el desarrollo de esta librería:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/TU_USUARIO_DE_GITHUB/feature-flag-service-tep.git](https://github.com/TU_USUARIO_DE_GITHUB/feature-flag-service-tep.git)
    cd feature-flag-service-tep
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Ejecutar pruebas unitarias:**
    ```bash
    npm test
    ```
4.  **Compilar el código TypeScript:**
    ```bash
    npm run build
    ```
    Esto generará los archivos JavaScript y de definición de tipos en la carpeta `dist/`.

-----

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](https://opensource.org/licenses/MIT) para más detalles.

-----

## 👥 Autores

  * apmonasterio.22@est.ucab.edu.ve
  * jrmondim.22@est.ucab.edu.ve
  * cacova.21@est.ucab.edu.ve

<!-- end list -->

```
```


# `feature-flag-service-tep`

[](https://opensource.org/licenses/MIT)

Una librería TypeScript robusta y flexible para la gestión de Feature Flags (también conocidas como Feature Toggles), diseñada pensando en la compatibilidad con el framework NestJS. Permite habilitar o deshabilitar funcionalidades dinámicamente en tu aplicación, controlar el acceso por entorno y usuario específico, y actualizar la configuración en tiempo de ejecución.

-----

## 🚀 Características Principales

  * **Gestión por Entorno Específico:** Opera con los entornos predefinidos `dev`, `test` y `prod`. La configuración indica una lista de entornos donde la flag está activa.
  * **Control por Usuario:** Habilita flags para usuarios específicos o grupos.
  * **Configuración Dinámica:** Actualiza las flags en tiempo de ejecución sin necesidad de reiniciar la aplicación.
  * **Servicio Centralizado:** Provee un `FeatureFlagService` para una gestión sencilla y coherente.
  * **Compatibilidad NestJS:** Diseñado con NestJS en mente para una fácil integración (a través de un módulo NestJS, que se implementará en la aplicación consumidora).

-----

## 📦 Instalación

Para instalar esta librería en tu proyecto (por ejemplo, tu servidor NestJS), puedes hacerlo directamente desde el repositorio de GitHub:

1.  **Asegúrate de que tus cambios estén subidos a la rama `develop`** de tu repositorio de la librería. Esto es crucial para que el `prepare` script y el código más reciente sean incluidos.

2.  En la terminal de tu proyecto consumidor (ej. tu servidor NestJS), ejecuta el siguiente comando:

    ```bash
    npm install git+https://github.com/TU_USUARIO_DE_GITHUB/feature-flag-service-tep.git#develop
    ```

    *Reemplaza `TU_USUARIO_DE_GITHUB` con el nombre de usuario de GitHub donde se encuentre alojado tu repositorio de la librería.*

    Este comando se encargará de:

      * Descargar el repositorio.
      * Ejecutar el `build` de la librería automáticamente (gracias al script `prepare` en el `package.json` de la librería).
      * Instalar solo los archivos compilados (`.js` y `.d.ts`) en tu `node_modules` de forma limpia.

-----

## 🛠️ Uso Básico

Una vez instalada, puedes importar y utilizar `FeatureFlagService` en tu aplicación.

### 1\. Definir tu Configuración de Feature Flags

Crea un objeto de configuración que siga la interfaz `FeatureFlagsConfiguration`. Las propiedades de cada flag incluyen `environments` (un array de entornos donde la flag está activa) y opcionalmente `users` (un array de IDs de usuario).

```typescript
// src/config/feature-flags.config.ts (ejemplo)
import { FeatureFlagsConfiguration } from 'feature-flag-service-tep';

export const AppFeatureFlags: FeatureFlagsConfiguration = {
  'new-dashboard': {
    environments: ['dev', 'test'], // Habilitado en dev y test
    users: ['admin', 'johndoe'], // Opcional: solo estos usuarios pueden verla si está habilitada para el entorno
  },
  'email-notifications': {
    environments: ['dev', 'prod'], // Habilitado en dev y prod
  },
  'beta-feature': {
    environments: ['dev'], // Solo habilitado en dev para pruebas
    users: ['betatester1', 'betatester2']
  }
};
```

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

// Verificar si una feature está habilitada para el entorno actual
if (featureFlagService.isFeatureEnabled('new-dashboard')) {
  console.log('El nuevo panel de control está habilitado para el entorno actual.');
} else {
  console.log('Usando el panel de control antiguo para el entorno actual.');
}

// Verificar si una feature está habilitada para un usuario específico en el entorno actual
const userId = 'admin';
if (featureFlagService.isFeatureEnabled('beta-feature', userId)) {
  console.log(`El usuario ${userId} tiene acceso a la característica beta.`);
} else {
  console.log(`El usuario ${userId} NO tiene acceso a la característica beta.`);
}

// Obtener detalles de una flag
const details = featureFlagService.getFlagDetails('email-notifications');
if (details) {
  console.log(`Entornos de 'email-notifications': ${details.environments?.join(', ')}`);
}

// Obtener todas las flags
console.log('Todas las flags:', featureFlagService.getAllFeatureFlags());

// Cambiar el entorno en tiempo de ejecución (útil para tests o entornos dinámicos)
featureFlagService.setEnvironment('prod');
if (featureFlagService.isFeatureEnabled('new-dashboard')) {
  console.log('Después de cambiar a producción, el nuevo panel está habilitado.');
} else {
  console.log('Después de cambiar a producción, el nuevo panel está deshabilitado.'); // Esto se imprimiría (ya que 'new-dashboard' no está en 'prod' en AppFeatureFlags)
}

// Actualizar configuración en tiempo de ejecución
// Nota: Tu método `updateConfig()` reemplaza *completamente* la configuración existente.
// Si deseas actualizar solo algunas flags, deberás fusionar las configuraciones manualmente
// antes de llamar a este método.
featureFlagService.updateConfig({
    'new-dashboard': {
        environments: ['dev', 'prod'], // Ahora habilitada en producción
        users: [] // Ahora para todos los usuarios en los entornos habilitados
    },
    // Es crucial incluir aquí TODAS las demás flags que quieras mantener,
    // ya que `updateConfig` actualmente reemplaza la configuración.
    'email-notifications': AppFeatureFlags['email-notifications'],
    'beta-feature': AppFeatureFlags['beta-feature']
});

if (featureFlagService.isFeatureEnabled('new-dashboard')) {
    console.log('Después de actualizar la config, el nuevo panel está habilitado en producción.'); // Esto se imprimiría
}
```

-----

## 🚀 API

El `FeatureFlagService` expone los siguientes métodos públicos:

  * `constructor(config: FeatureFlagsConfiguration, initialEnvironment: 'dev' | 'test' | 'prod')`: Inicializa el servicio con la configuración y el entorno inicial. El entorno debe ser uno de los predefinidos (`'dev'`, `'test'`, `'prod'`).

  * `isFeatureEnabled(flagName: string, userId?: string): boolean`: Verifica si una *feature flag* está habilitada para el entorno actual y, opcionalmente, para un usuario específico.

      * **Lógica:** La flag está habilitada si el `currentEnvironment` está presente en su array `environments` **Y** (si se especifica el array `users` para la flag) el `userId` proporcionado está presente en el array `users`. Si el array `users` está vacío o no se especifica para la flag, esta está activa para **cualquier** usuario en los entornos habilitados.

  * `getFlagDetails(flagName: string): FeatureFlagConfigItem | undefined`: Devuelve los detalles de una *feature flag* específica o `undefined` si no se encuentra.

  * `getAllFeatureFlags(): FeatureFlagsConfiguration`: Devuelve el objeto de configuración completo de las *feature flags* (devuelve una copia para evitar mutaciones externas directas).

  * `setEnvironment(newEnvironment: 'dev' | 'test' | 'prod'): void`: Cambia el entorno actual de la librería en tiempo de ejecución. **Solo acepta `'dev'`, `'test'` o `'prod'`.**

  * `updateConfig(newConfig: FeatureFlagsConfiguration): void`: **Reemplaza completamente** la configuración de las *feature flags* con `newConfig`. Si deseas actualizar solo algunas flags, debes fusionar las configuraciones manualmente antes de llamar a este método (ej. usando `Object.assign` o el operador *spread*).

-----

## 👩‍💻 Desarrollo

Para trabajar en el desarrollo de esta librería:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/TU_USUARIO_DE_GITHUB/feature-flag-service-tep.git
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

-----
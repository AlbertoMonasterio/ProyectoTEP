

# feature-flag-service-tep

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

```bash
npm install git+https://github.com/AlbertoMonasterio/ProyectoTEP.git#main
````

Este comando se encargará de:

  * Descargar el repositorio.
  * Ejecutar el `build` de la librería automáticamente (gracias al script `prepare` en el `package.json` de la librería).
  * Instalar solo los archivos compilados (`.js` y `.d.ts`) en tu `node_modules` de forma limpia.

-----




## 🛠️ Uso Básico

Una vez instalada, puedes importar y utilizar `FeatureFlagService` en tu aplicación.

### 1. Definir tu Configuración de Feature Flags

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
  },
  'universal-access': {
    environments: ['dev', 'test', 'prod'], // Habilitado en todos los entornos
    users: [] // Vacío significa habilitado para CUALQUIER usuario en los entornos especificados
  }
};
````

### 2\. Inicializar `FeatureFlagService`

Instancia el servicio con tu configuración inicial y el entorno actual de tu aplicación. El entorno inicial debe ser `'dev'`, `'test'` o `'prod'`.

```typescript
// main.ts o un servicio/módulo de tu aplicación NestJS
import { FeatureFlagService } from 'feature-flag-service-tep';
import { AppFeatureFlags } from './config/feature-flags.config'; // Tu configuración

// Determina el entorno de tu aplicación (ej. desde variables de entorno)
const currentEnv: 'dev' | 'test' | 'prod' = (process.env.NODE_ENV === 'production' ? 'prod' : (process.env.NODE_ENV === 'test' ? 'test' : 'dev'));

const featureFlagService = new FeatureFlagService(AppFeatureFlags, currentEnv);

console.log(`Servicio de Feature Flags inicializado en entorno: ${currentEnv}`);
```

### 3\. Verificar Feature Flags (`isFeatureEnabled`)

Usa este método para controlar el flujo de tu aplicación basado en si una característica está activa.

```typescript
// Ejemplo 1: Verificar una flag solo por entorno
if (featureFlagService.isFeatureEnabled('email-notifications')) {
  console.log('Las notificaciones por email están activas para este entorno.');
  // Lógica para habilitar notificaciones
} else {
  console.log('Las notificaciones por email están deshabilitadas para este entorno.');
}

// Ejemplo 2: Verificar una flag por entorno y usuario específico
const userId = 'johndoe';
if (featureFlagService.isFeatureEnabled('new-dashboard', userId)) {
  console.log(`El nuevo dashboard está habilitado para ${userId} en este entorno.`);
  // Lógica para mostrar el nuevo dashboard
} else {
  console.log(`El nuevo dashboard NO está habilitado para ${userId} o el entorno actual.`);
  // Lógica para el dashboard antiguo
}

// Ejemplo 3: Verificar una flag con acceso universal (users: [])
if (featureFlagService.isFeatureEnabled('universal-access', 'anyUser')) {
    console.log('La característica de acceso universal está activa para cualquier usuario en este entorno.');
}
```

### 4\. Otras Operaciones Básicas

```typescript
// Obtener detalles de una flag
const details = featureFlagService.getFlagDetails('beta-feature');
if (details) {
  console.log(`Detalles de 'beta-feature': Entornos: ${details.environments?.join(', ')}, Usuarios: ${details.users?.join(', ')}`);
}

// Obtener todas las flags
console.log('Todas las flags actualmente configuradas:', featureFlagService.getAllFeatureFlags());

// Cambiar el entorno en tiempo de ejecución (útil para tests o entornos dinámicos)
featureFlagService.setEnvironment('prod');
console.log(`Entorno cambiado a: ${featureFlagService.getFlagDetails('currentEnvironment')}`); // Simula obtener el entorno actual
if (featureFlagService.isFeatureEnabled('email-notifications')) {
    console.log('Después de cambiar a producción, las notificaciones por email están habilitadas.');
} else {
    console.log('Después de cambiar a producción, las notificaciones por email están deshabilitadas.');
}
```

-----

## ⚙️ Gestión Dinámica y Avanzada (Actualización de Configuración)

La librería permite modificar la configuración de las *feature flags* en tiempo de ejecución, lo cual es útil para sistemas de configuración remota o herramientas de administración.

### `updateConfig(newConfig: FeatureFlagsConfiguration): void`

**Reemplaza completamente** la configuración de las *feature flags* con `newConfig`. Utiliza este método cuando quieras cargar una configuración *totalmente nueva*. Las flags no presentes en `newConfig` serán eliminadas.

```typescript
// Supongamos que AppFeatureFlags es tu configuración inicial
// Importa AppFeatureFlags si no lo has hecho
import { AppFeatureFlags } from './config/feature-flags.config';

// Crea una nueva configuración que reemplazará a la existente
const updatedFullConfig = {
    'new-dashboard': {
        environments: ['dev', 'prod'], // Ahora habilitada también en producción
        users: [] // Ahora para todos los usuarios en los entornos habilitados
    },
    // Es CRUCIAL incluir aquí TODAS las demás flags que quieras mantener,
    // ya que `updateConfig` REEMPLAZA la configuración completa.
    'email-notifications': AppFeatureFlags['email-notifications'],
    'beta-feature': AppFeatureFlags['beta-feature'],
    'universal-access': AppFeatureFlags['universal-access']
    // Si no incluyes una flag aquí, ¡se eliminará de la configuración!
};

featureFlagService.updateConfig(updatedFullConfig);

console.log('\n--- Después de updateConfig ---');
if (featureFlagService.isFeatureEnabled('new-dashboard')) {
    console.log('El nuevo panel está habilitado en el entorno actual (después de updateConfig).');
}
console.log('Todas las flags después de updateConfig:', featureFlagService.getAllFeatureFlags());
```

### `updateFeatureFlag(flagName: string, updatedFlagConfig: Partial<FeatureFlagConfigItem>): void`

**Actualiza o añade** una *feature flag* específica. Este es el método preferido para hacer cambios puntuales a flags individuales.

  * **Comportamiento de actualización:**
      * Si la `feature flag` ya existe, las propiedades proporcionadas en `updatedFlagConfig` **sobrescribirán** las propiedades correspondientes de la flag existente.
      * Para las propiedades de tipo array (`environments` y `users`), el array proporcionado en `updatedFlagConfig` **reemplazará completamente** el array existente; **no** se fusionarán sus elementos.
      * Si la `feature flag` no existe, se creará una nueva con el `flagName` y las `updatedFlagConfig` proporcionadas.

<!-- end list -->

```typescript
// Ejemplo 1: Actualizar una flag existente (reemplazando arrays)
// Configuración inicial de 'new-dashboard': { environments: ['dev', 'test'], users: ['admin', 'johndoe'] }
featureFlagService.updateFeatureFlag('new-dashboard', {
  environments: ['dev', 'test', 'prod'], // Ahora incluirá 'prod'
  users: ['superAdmin']                 // ¡Solo 'superAdmin' ahora!
});

console.log('\n--- Después de updateFeatureFlag (Ejemplo 1) ---');
console.log('Detalles de "new-dashboard" actualizados:', featureFlagService.getFlagDetails('new-dashboard'));
// Resultado: { environments: ['dev', 'test', 'prod'], users: ['superAdmin'] }


// Ejemplo 2: Actualizar solo algunas propiedades (sin afectar otras)
// Configuración inicial de 'email-notifications': { environments: ['dev', 'prod'] }
featureFlagService.updateFeatureFlag('email-notifications', {
  users: ['marketingTeam'] // Solo cambiamos los usuarios, dejando `environments` intacto
});

console.log('\n--- Después de updateFeatureFlag (Ejemplo 2) ---');
console.log('Detalles de "email-notifications" actualizados:', featureFlagService.getFlagDetails('email-notifications'));
// Resultado: { environments: ['dev', 'prod'], users: ['marketingTeam'] }


// Ejemplo 3: Añadir una nueva flag
featureFlagService.updateFeatureFlag('maintenance-mode', {
  environments: ['prod'],
  users: ['sysadmin']
});

console.log('\n--- Después de updateFeatureFlag (Ejemplo 3) ---');
console.log('Detalles de "maintenance-mode" (nueva flag):', featureFlagService.getFlagDetails('maintenance-mode'));
// Resultado: { environments: ['prod'], users: ['sysadmin'] }
```

-----

## 🚀 API

El `FeatureFlagService` expone los siguientes métodos públicos:

  * `constructor(config: FeatureFlagsConfiguration, initialEnvironment: 'dev' | 'test' | 'prod')`: Inicializa el servicio con la configuración y el entorno inicial. El entorno debe ser uno de los predefinidos (`'dev'`, `'test'`, `'prod'`).

  * `isFeatureEnabled(flagName: string, userId?: string): boolean`: Verifica si una *feature flag* está habilitada para el entorno actual y, opcionalmente, para un usuario específico.

      * **Lógica:** La flag está habilitada si el `currentEnvironment` está presente en su array `environments` **Y** (si se especifica el array `users` para la flag) el `userId` proporcionado está presente en el array `users`. Si el array `users` está vacío o no se especifica para la flag, esta está activa para **cualquier** usuario en los entornos especificados.

  * `getFlagDetails(flagName: string): FeatureFlagConfigItem | undefined`: Devuelve los detalles de una *feature flag* específica o `undefined` si no se encuentra.

  * `getAllFeatureFlags(): FeatureFlagsConfiguration`: Devuelve el objeto de configuración completo de las *feature flags* (devuelve una copia para evitar mutaciones externas directas).

  * `setEnvironment(newEnvironment: 'dev' | 'test' | 'prod'): void`: Cambia el entorno actual de la librería en tiempo de ejecución. **Solo acepta `'dev'`, `'test'` o `'prod'`.**

  * `updateConfig(newConfig: FeatureFlagsConfiguration): void`: **Reemplaza completamente** la configuración de las *feature flags* con `newConfig`. Utiliza este método cuando quieras cargar una configuración *totalmente nueva*. Si deseas modificar solo una parte, considera usar `updateFeatureFlag` o fusionar las configuraciones manualmente antes de llamar a este método (ej. usando `Object.assign` o el operador *spread*).

  * `updateFeatureFlag(flagName: string, updatedFlagConfig: Partial<FeatureFlagConfigItem>): void`: **Actualiza o añade** una *feature flag* específica, fusionando sus propiedades con la configuración existente.

      * **Comportamiento de actualización:**
          * Si la `feature flag` ya existe, las propiedades que proporciones en `updatedFlagConfig` **sobrescribirán** las propiedades correspondientes de la flag existente.
          * Para las propiedades de tipo array (`environments` y `users`), el array proporcionado en `updatedFlagConfig` **reemplazará completamente** el array existente; **no** se fusionarán sus elementos.
          * Si la `feature flag` no existe, se creará una nueva con el `flagName` y las `updatedFlagConfig` proporcionadas.

-----

## 👩‍💻 Desarrollo

Para trabajar en el desarrollo de esta librería:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/AlbertoMonasterio/ProyectoTEP.git
    cd ProyectoTEP
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

  * Alberto Monasterio apmonasterio.22@est.ucab.edu.ve
  * Jose Mondim jrmondim.22@est.ucab.edu.ve
  * Cesar Cova cacova.21@est.ucab.edu.ve

<!-- end list -->






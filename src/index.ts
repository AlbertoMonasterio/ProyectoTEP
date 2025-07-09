// src/index.ts

// Exporta la clase principal del servicio de Feature Flags
export * from './feature-flag.service';

// Exporta las interfaces de configuración para que los consumidores puedan usarlas para tipado
export * from './interfaces/feature-flag.interface';




git add src/interfaces/feature-flag.interface.ts src/feature-flag.service.ts src/index.ts
git commit -m "feat(feature-flags): Implement core service with full API and interfaces"


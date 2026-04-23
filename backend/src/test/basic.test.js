import { describe, it, expect } from 'vitest';

describe('Pruebas de Calidad Básicas', () => {
  it('Verifica que el entorno de pruebas funcione', () => {
    expect(1 + 1).toBe(2);
  });

  it('Verifica configuración de strings', () => {
    const proyecto = 'ECenciaAPP';
    expect(proyecto).toBe('ECenciaAPP');
  });
});

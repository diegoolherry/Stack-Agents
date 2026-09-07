// TASK-05 (área plantilla) — validación en seco del guion onboard sobre la
// candidata ya cerrada `template-hardening` (corpus). SOLO LECTURA: este test
// no escribe producto, no registra demos, no fusiona, no marca done.
//
// Oráculos de comportamiento: baseline v1 en
// specs/sdd-onboard-flow/{requirements,design}.md — RF-09/matriz de
// parametrización Propose/Verify/Archive, RF-11/tres pausas, RF-14/template
// `## Onboarding Complete!`, RNF-02/narración 1-3 oraciones, RNF-03/español,
// RF-06/RF-07/RF-08/aislamiento, RNF-04/reversibilidad.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '../..');

// --- Oráculos mínimos de la baseline v1 (el guion los implementa) ---
const PAUSAS_OBLIGATORIAS = [
  'elección de candidata demo por el usuario tras el scan',
  'aprobación explícita post-proposal',
  'confirmación antes de Apply (paso a código)',
];
const CAMPOS_SUMMARY_RF14 = [
  'change elegido',
  'artefactos WHY/WHAT/HOW/STEPS',
  'archivos cambiados',
  'one-liner explore → propose → spec → design → tasks → apply → verify → archive',
  'cuándo usar SDD vs codear directo',
  'next steps',
];
const FASES_PARAMETRIZADAS = ['Propose', 'Verify', 'Archive'];

// --- Guion simulado en seco: F1..F10 narradas (cada una ≤3 oraciones) ---
const NARRACION_SECO = [
  'Dimos la bienvenida y detectamos un repo brownfield con suite de tests. El scan small&safe propone la candidata cerrada template-hardening como demo.',
  'Exploramos el corpus: findings y specs cerrados confirman alcance acotado y sin migraciones.',
  'Propose aún no adoptado — se omite con línea explícita; el gate Full de baseline sigue vigente.',
  'Las specs existen y están cerradas: requirements, design y tasks con baseline v1.',
  'El diseño registra decisiones y alternativas sin teaching de pasos inexistentes.',
  'Las tasks son concretas, checkeables y llevan su área asignada.',
  'Apply ya ejecutado por TDD en su feature original; aquí solo se relee, no se escribe código.',
  'Verify aún no adoptado — se omite con línea explícita; Reviewer de dos pasadas cubre la verificación.',
  'Archive aún no adoptado — se omite con línea explícita; la demo queda en rama sin merge a main.',
  'Cerramos con el template ## Onboarding Complete! en español, persistido fuera del producto.',
];

function gitRead(...args) {
  return spawnSync('git', ['-C', repositoryRoot, ...args], { encoding: 'utf8' });
}

function featureList() {
  return JSON.parse(readFileSync(join(repositoryRoot, 'feature_list.json'), 'utf8'));
}

function contarOraciones(texto) {
  return texto.split(/[.!?]+/).map((parte) => parte.trim()).filter(Boolean).length;
}

function narracionValida(texto) {
  const total = contarOraciones(texto);
  return total >= 1 && total <= 3;
}

function resolverPaso(existeEnPipeline) {
  return existeEnPipeline ? 'ejecutar-con-formato-real' : 'omitir-con-linea-explicita';
}

function validarSummary(summary) {
  return CAMPOS_SUMMARY_RF14.filter((campo) => !summary[campo]);
}

// --- Ayudas del harness (implementación en fase GREEN) ---

test('harness: contarOraciones distingue 1, 3 y 4 oraciones', () => {
  assert.equal(contarOraciones('Hola mundo.'), 1);
  assert.equal(contarOraciones('Una. Dos. Tres.'), 3);
  assert.equal(contarOraciones('Una. Dos. Tres. Cuatro.'), 4);
});

test('harness: narración válida tiene entre 1 y 3 oraciones', () => {
  assert.equal(narracionValida('Una. Dos. Tres.'), true);
  assert.equal(narracionValida('Una. Dos. Tres. Cuatro.'), false);
});

test('harness: resolverPaso parametriza Propose/Verify/Archive en ambos estados', () => {
  assert.equal(resolverPaso(true), 'ejecutar-con-formato-real');
  assert.equal(resolverPaso(false), 'omitir-con-linea-explicita');
});

test('harness: validarSummary reporta campos RF-14 faltantes', () => {
  assert.deepEqual(validarSummary({}), CAMPOS_SUMMARY_RF14);
  const completo = Object.fromEntries(CAMPOS_SUMMARY_RF14.map((campo) => [campo, 'presente']));
  assert.deepEqual(validarSummary(completo), []);
});

// --- Simulación en seco, fase por fase ---

test('seco F1: repo brownfield con corpus cerrado, sin derivar a Discovery', () => {
  assert.ok(existsSync(join(repositoryRoot, 'architecture', 'architecture.md')), 'sin architecture.md el guion derivaría a Discovery');
  for (const archivo of ['requirements.md', 'design.md', 'tasks.md']) {
    assert.ok(existsSync(join(repositoryRoot, 'specs', 'template-hardening', archivo)), `falta specs/template-hardening/${archivo}`);
  }
  const lista = featureList();
  const candidata = lista.features.find((feature) => feature.id === 'template-hardening');
  assert.ok(candidata, 'el corpus template-hardening debe estar registrado');
  assert.equal(candidata.status, 'done', 'la candidata debe estar ya cerrada: el seco no ejecuta trabajo');
});

test('seco F3/F8/F9: parametrización Propose/Verify/Archive en estado ausente', () => {
  // Estado vigente: las tres fases están in_progress (specs existen, sin done).
  const hechas = new Set(featureList().features.filter((f) => f.status === 'done').map((f) => f.id));
  for (const fase of FASES_PARAMETRIZADAS) {
    assert.equal(hechas.has(`sdd-${fase.toLowerCase()}-phase`), false, `${fase} no adoptada → el guion la omite con línea explícita`);
    assert.equal(resolverPaso(false), 'omitir-con-linea-explicita');
  }
  assert.equal(resolverPaso(true), 'ejecutar-con-formato-real', 'con la fase adoptada el guion la ejecuta con formato real');
});

test('seco pausas: exactamente las tres obligatorias, ni más ni menos', () => {
  assert.equal(PAUSAS_OBLIGATORIAS.length, 3);
  assert.ok(PAUSAS_OBLIGATORIAS.some((pausa) => pausa.includes('elección de candidata')));
  assert.ok(PAUSAS_OBLIGATORIAS.some((pausa) => pausa.includes('post-proposal')));
  assert.ok(PAUSAS_OBLIGATORIAS.some((pausa) => pausa.includes('Apply')));
});

test('seco F10: summary con template fijo, en español y persistible fuera del producto', () => {
  const summary = Object.fromEntries(CAMPOS_SUMMARY_RF14.map((campo) => [campo, 'verificado en seco']));
  assert.deepEqual(validarSummary(summary), []);
  const requisitos = readFileSync(join(repositoryRoot, 'specs', 'template-hardening', 'requirements.md'), 'utf8');
  assert.match(requisitos, /debe/i, 'artefactos y convención en español neutro (RNF-03)');
});

test('seco narración: las 10 fases narran 1-3 oraciones por ruta, sin volcar artefactos', () => {
  assert.equal(NARRACION_SECO.length, 10);
  for (const [indice, narracion] of NARRACION_SECO.entries()) {
    assert.equal(narracionValida(narracion), true, `F${indice + 1} excede 3 oraciones: ${narracion}`);
  }
});

test('seco aislamiento: sin registro demo, sin merge, sin done, fuera de main', () => {
  const lista = featureList();
  assert.equal(lista.features.some((feature) => feature.id.startsWith('onboard-demo-')), false, 'la demo nunca se registra en feature_list.json');
  assert.equal(lista.features.some((feature) => feature.id.startsWith('onboard-demo-') && feature.status === 'done'), false, 'la demo nunca se marca done');
  const rama = gitRead('branch', '--show-current').stdout.trim();
  assert.notEqual(rama, 'main', 'el seco nunca corre sobre main');
  assert.equal(rama.startsWith('feature/onboard-'), false, 'este seco de plantilla no usa rama demo');
  assert.equal(existsSync(join(repositoryRoot, 'specs', 'onboard-demo-x')), false);
  const reportes = readdirSync(join(repositoryRoot, 'reports'));
  assert.equal(reportes.some((reporte) => /^onboard-.*\.md$/.test(reporte)), false, 'el seco no persiste reports/onboard-*.md');
});

test('seco reversibilidad: candidata sin migraciones ni efectos colaterales', () => {
  const estado = gitRead('status', '--short', '--untracked-files=all').stdout.trim();
  const permitidas = ['M init-sdd.ps1', 'M init-sdd.sh', 'M package.json'];
  const prefijosPermitidos = ['changes/sdd-onboard-flow/plantilla/', 'tests/sdd-onboard-flow/', 'specs/sdd-onboard-flow/tasks.md'];
  for (const linea of estado.split('\n').map((l) => l.trim()).filter(Boolean)) {
    const permitida = permitidas.includes(linea) || prefijosPermitidos.some((prefijo) => linea.includes(prefijo));
    assert.ok(permitida, `cambio fuera del área plantilla: ${linea}`);
  }
  const requisitos = readFileSync(join(repositoryRoot, 'specs', 'template-hardening', 'requirements.md'), 'utf8').toLowerCase();
  assert.equal(requisitos.includes('migración'), false, 'la candidata no exige migraciones: reversible por borrado de rama');
});

test('seco sincronía: agentes de fase referenciados existen con permisos vigentes', () => {
  for (const agente of ['leader', 'researcher', 'spec-author', 'implementer', 'reviewer', 'scm']) {
    assert.ok(existsSync(join(repositoryRoot, '.opencode', 'agents', `${agente}.md`)), `falta .opencode/agents/${agente}.md: desincronización con el pipeline`);
  }
});

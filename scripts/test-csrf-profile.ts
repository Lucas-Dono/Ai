/**
 * Script de prueba manual para verificar la protección CSRF en el endpoint de profile
 *
 * Este script simula requests con diferentes origins para verificar
 * que la protección CSRF funciona correctamente.
 */

import { NextRequest } from 'next/server';
import { checkCSRF } from '../lib/security/csrf-protection';

console.log('🔐 Testing CSRF Protection on Profile Endpoint\n');

// Test 1: PATCH con origin válido
console.log('Test 1: PATCH con origin válido (localhost:3000)');
const validRequest = new NextRequest('http://localhost:3000/api/user/profile', {
  method: 'PATCH',
  headers: {
    origin: 'http://localhost:3000',
  },
});

const validResult = checkCSRF(validRequest);
console.log(validResult ? '❌ FAIL: Bloqueado incorrectamente' : '✅ PASS: Permitido correctamente');
console.log('');

// Test 2: PATCH sin origin header
console.log('Test 2: PATCH sin origin header');
const noOriginRequest = new NextRequest('http://localhost:3000/api/user/profile', {
  method: 'PATCH',
});

const noOriginResult = checkCSRF(noOriginRequest);
console.log(noOriginResult ? '✅ PASS: Bloqueado correctamente' : '❌ FAIL: Debería estar bloqueado');
console.log('');

// Test 3: PATCH con origin malicioso
console.log('Test 3: PATCH con origin malicioso (evil.com)');
const evilRequest = new NextRequest('http://localhost:3000/api/user/profile', {
  method: 'PATCH',
  headers: {
    origin: 'https://evil.com',
  },
});

const evilResult = checkCSRF(evilRequest);
console.log(evilResult ? '✅ PASS: Bloqueado correctamente' : '❌ FAIL: Debería estar bloqueado');
console.log('');

// Test 4: GET sin restricciones (no debe validar)
console.log('Test 4: GET request (no debería validar origin)');
const getRequest = new NextRequest('http://localhost:3000/api/user/profile', {
  method: 'GET',
  // Sin origin header intencionalmente
});

const getResult = checkCSRF(getRequest);
console.log(getResult ? '❌ FAIL: Bloqueado incorrectamente' : '✅ PASS: Permitido correctamente (GET no valida)');
console.log('');

// Test 5: PATCH con referer válido (fallback)
console.log('Test 5: PATCH con referer válido como fallback');
const refererRequest = new NextRequest('http://localhost:3000/api/user/profile', {
  method: 'PATCH',
  headers: {
    referer: 'http://localhost:3000/configuracion',
  },
});

const refererResult = checkCSRF(refererRequest);
console.log(refererResult ? '❌ FAIL: Bloqueado incorrectamente' : '✅ PASS: Permitido correctamente');
console.log('');

console.log('✨ Tests completados');

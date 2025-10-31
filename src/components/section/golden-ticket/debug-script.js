// 🎫 Golden Ticket - Script de Prueba
// Copia y pega este código en la consola del navegador (F12)

console.log('🔍 Iniciando diagnóstico del Golden Ticket...\n');

// 1. Verificar que el botón existe
const button = document.querySelector('.open-ticket-btn');
console.log('1️⃣ Botón encontrado:', button ? '✅ SÍ' : '❌ NO');
if (button) {
  console.log('   - Texto:', button.textContent);
  console.log('   - Visible:', window.getComputedStyle(button).display !== 'none');
  console.log('   - Click listener:', button.onclick ? 'Asignado' : 'No asignado directamente (probablemente React)');
}

// 2. Verificar si el modal existe
const modal = document.querySelector('.modal-overlay');
console.log('\n2️⃣ Modal en DOM:', modal ? '✅ SÍ' : '❌ NO');
if (modal) {
  const styles = window.getComputedStyle(modal);
  console.log('   - Display:', styles.display);
  console.log('   - Z-index:', styles.zIndex);
  console.log('   - Position:', styles.position);
  console.log('   - Opacity:', styles.opacity);
  console.log('   - Tiene clase "active":', modal.classList.contains('active') ? '✅' : '❌');
}

// 3. Verificar canvas-confetti
console.log('\n3️⃣ Canvas Confetti:', typeof confetti !== 'undefined' ? '✅ Disponible' : '⚠️ No disponible globalmente');

// 4. Verificar z-indexes en la página
console.log('\n4️⃣ Elementos con Z-index > 50:');
const zIndexElements = Array.from(document.querySelectorAll('*'))
  .map(el => ({
    element: el,
    zIndex: parseInt(window.getComputedStyle(el).zIndex)
  }))
  .filter(item => item.zIndex > 50)
  .sort((a, b) => b.zIndex - a.zIndex);

zIndexElements.slice(0, 10).forEach(item => {
  console.log(`   - ${item.element.className || item.element.tagName}: ${item.zIndex}`);
});

// 5. Verificar si hay elementos bloqueando
console.log('\n5️⃣ Elemento más arriba en la esquina superior izquierda:');
const topElement = document.elementFromPoint(100, 100);
console.log('   -', topElement?.className || topElement?.tagName);

// 6. Simular click en el botón
console.log('\n6️⃣ Intentando simular click en el botón...');
if (button) {
  setTimeout(() => {
    button.click();
    console.log('   - Click simulado ✅');
    
    setTimeout(() => {
      const modalAfterClick = document.querySelector('.modal-overlay');
      const isVisible = modalAfterClick && window.getComputedStyle(modalAfterClick).display !== 'none';
      console.log('   - Modal visible después del click:', isVisible ? '✅ SÍ' : '❌ NO');
      
      if (modalAfterClick) {
        console.log('   - Display actual:', window.getComputedStyle(modalAfterClick).display);
        console.log('   - Clase active:', modalAfterClick.classList.contains('active') ? '✅' : '❌');
      }
    }, 500);
  }, 1000);
  console.log('   - Esperando 1 segundo antes del click...');
}

// 7. Verificar estructura del body
console.log('\n7️⃣ Hijos directos del body:');
Array.from(document.body.children).forEach((child, index) => {
  console.log(`   ${index + 1}. <${child.tagName.toLowerCase()}> ${child.id ? '#' + child.id : ''} ${child.className ? '.' + child.className.split(' ')[0] : ''}`);
});

console.log('\n✅ Diagnóstico completado. Revisa los resultados arriba.\n');
console.log('💡 Tip: Si el modal no aparece después del click simulado:');
console.log('   1. Verifica que no haya errores en la consola (arriba)');
console.log('   2. Revisa si el display del modal es "flex" cuando está activo');
console.log('   3. Verifica que el z-index sea 9999 o mayor');

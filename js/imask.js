document.addEventListener("DOMContentLoaded", function () {
  // Máscara para telefone fixo
  IMask(
    document.getElementById('telefone'),
    {
      mask: '(00) 0000-0000'
    }
  );

  // Máscara para celular
  IMask(
    document.getElementById('celular'),
    {
      mask: '(00) 00000-0000'
    }
  );
});


document.addEventListener("DOMContentLoaded", function () {
  const loginInput = document.getElementById('usuario');

  loginInput.addEventListener('input', function () {
    // Remove qualquer número
    this.value = this.value.replace(/[0-9]/g, '');

    // Limita a 6 caracteres
    if (this.value.length > 6) {
      this.value = this.value.slice(0, 6);
    }
  });
});
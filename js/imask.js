// Máscaras de input
IMask(
  document.getElementById('celular'),
  {
    mask: '+{55}(00)00000-0000'}
  
)
IMask(
  document.getElementById('telefone'),
  {
    mask: '+{55}(00)0000-0000'
  }
)

IMask(
  document.getElementById('cpf',),
  {
    mask: '000.000.000-00'
  }
)

IMask(
  document.getElementById('cep'),
  {
    mask: '00000-000'
  }
)

IMask(document.getElementById('usuario'), {
  // Aceita exatamente até 20 letras (o [ ] torna os caracteres opcionais)
  mask: 'a[aaaaaa]' 
});

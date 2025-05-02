export const formatCNPJ = (cnpj: string | null): string => {
  if (!cnpj) return 'Não informado';
  // Additional check to ensure cnpj is a string
  if (typeof cnpj !== 'string') return 'Formato inválido';
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

export const formatPhone = (phone: string | null): string => {
  if (!phone) return 'Não informado';
  return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
};

export const formatCPF = (cpf: string | null): string => {
  if (!cpf) return 'Não informado';
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
};

export const formatDate = (date: string | null): string => {
  if (!date) return 'Não informado';
  return new Date(date).toLocaleDateString('pt-BR');
};
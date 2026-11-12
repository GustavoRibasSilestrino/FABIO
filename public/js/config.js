/* Ligação com o Supabase (banco de dados e fotos dos imóveis).
   Estes dois valores são PÚBLICOS por natureza: quem protege os dados são as regras do banco
   (supabase/schema.sql). Nunca coloque aqui a chave "secret" ou "service_role". */
window.FABIO_CONFIG = {
  supabaseUrl: 'https://mhjvryysmsmtgekqcwvs.supabase.co',
  supabaseKey: '' // chave pública: Project Settings > API Keys > "Publishable key" (sb_publishable_…) ou "anon"
};

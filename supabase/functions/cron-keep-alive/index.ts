// Função Edge para manter o projeto Supabase ativo
// Executada diariamente às 20h via cron job

import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  try {
    // Verificar se a requisição é do cron job
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente Supabase usando variáveis de ambiente
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidas");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Executar a função register_keep_alive
    const { data, error } = await supabase.rpc('register_keep_alive');

    if (error) {
      throw error;
    }

    // Registrar o sucesso nos logs
    await supabase
      .from('keep_alive_logs')
      .insert({
        success: true,
        details: `Consulta executada via Cron Job: ${new Date().toISOString()}`
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Consulta de manutenção executada com sucesso",
        timestamp: new Date().toISOString(),
        result: data
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro ao executar consulta de manutenção:", error);

    // Tentar registrar o erro nos logs
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase
          .from('keep_alive_logs')
          .insert({
            success: false,
            details: `Erro no Cron Job: ${error.message || "Erro desconhecido"}`
          });
      }
    } catch (logError) {
      console.error("Erro ao registrar falha nos logs:", logError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro desconhecido",
        timestamp: new Date().toISOString()
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
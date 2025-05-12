// Função Edge para manter o projeto Supabase ativo
// Executa uma consulta simples para evitar que o projeto seja pausado após 7 dias de inatividade

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  // Lidar com requisições OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
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
        details: `Consulta executada via Edge Function: ${new Date().toISOString()}`
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Consulta de manutenção executada com sucesso",
        timestamp: new Date().toISOString(),
        result: data
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
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
            details: `Erro: ${error.message || "Erro desconhecido"}`
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
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
"use server";

import { createClient } from "@/lib/supabase/server";
import type { TipoAcaoAuditoria } from "@/lib/types";

interface CreateAuditLogParams {
  usuarioId: string;
  clinicaId: string;
  acao: TipoAcaoAuditoria;
  entidade: string;
  entidadeId?: string;
  detalhes?: Record<string, unknown>;
}

export async function createAuditLog({
  usuarioId,
  clinicaId,
  acao,
  entidade,
  entidadeId,
  detalhes,
}: CreateAuditLogParams) {
  const supabase = await createClient();

  const { error } = await supabase.from("auditoria").insert({
    usuario_id: usuarioId,
    clinica_id: clinicaId,
    acao,
    entidade,
    entidade_id: entidadeId,
    detalhes: detalhes || {},
    ip_address: null,
    user_agent: null,
  });

  if (error) {
    console.error("Erro ao criar log de auditoria:", error);
  }
}

export async function getAuditLogs(clinicaId: string, limit = 50) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("auditoria")
    .select(
      `
      *,
      usuarios:usuario_id (
        nome
      )
    `
    )
    .eq("clinica_id", clinicaId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao buscar logs de auditoria:", error);
    return [];
  }

  return data;
}

export async function getAllAuditLogs(limit = 100) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("auditoria")
    .select(
      `
      *,
      usuarios:usuario_id (
        nome
      ),
      clinicas:clinica_id (
        nome
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao buscar todos os logs de auditoria:", error);
    return [];
  }

  return data;
}

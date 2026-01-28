import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, FileText, Download, Eye, Trash2, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

export const metadata = {
  title: 'Documentos - ClinicOps',
}

export default async function DocumentosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*, clinica:clinicas(*)')
    .eq('id', user.id)
    .single()

  if (!usuario) {
    redirect('/auth/login')
  }

  let query = supabase
    .from('documentos')
    .select('*, paciente:pacientes(nome), usuario:usuarios(nome)')
    .eq('clinica_id', usuario.clinica_id)
    .order('created_at', { ascending: false })

  if (params.q) {
    query = query.ilike('nome_arquivo', `%${params.q}%`)
  }

  const { data: documentos } = await query

  function getDocumentTypeBadge(tipo: string) {
    const types: Record<string, { label: string; className: string }> = {
      prontuario: { label: 'Prontuario', className: 'bg-primary/10 text-primary border-primary/20' },
      exame: { label: 'Exame', className: 'bg-accent/10 text-accent border-accent/20' },
      receita: { label: 'Receita', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
      atestado: { label: 'Atestado', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
      outros: { label: 'Outros', className: 'bg-muted text-muted-foreground border-border' },
    }
    const typeInfo = types[tipo] || types.outros
    return <Badge variant="outline" className={typeInfo.className}>{typeInfo.label}</Badge>
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div>
      <DashboardHeader title="Documentos" userName={usuario.nome} />
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <form className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              placeholder="Buscar documentos..."
              className="pl-9"
              defaultValue={params.q}
            />
          </form>
          <Button asChild>
            <Link href="/dashboard/documentos/upload">
              <Plus className="mr-2 h-4 w-4" />
              Novo Documento
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            {documentos && documentos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Documento</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Paciente</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tamanho</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentos.map((documento) => (
                      <tr key={documento.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <span className="font-medium text-foreground">{documento.nome_arquivo}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getDocumentTypeBadge(documento.tipo)}
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/dashboard/pacientes/${documento.paciente_id}`} className="text-foreground hover:text-primary">
                            {documento.paciente?.nome || 'N/A'}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatFileSize(documento.tamanho_bytes)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(documento.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <a href={documento.url_arquivo} target="_blank" rel="noopener noreferrer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href={documento.url_arquivo} download>
                                  <Download className="mr-2 h-4 w-4" />
                                  Baixar
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum documento cadastrado ainda.</p>
                <Button asChild>
                  <Link href="/dashboard/documentos/upload">
                    <Plus className="mr-2 h-4 w-4" />
                    Enviar Primeiro Documento
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

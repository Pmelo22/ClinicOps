'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartData {
  dia: string
  valor: number
}

interface AppointmentChartData {
  tipo: string
  quantidade: number
}

interface DashboardChartsProps {
  revenueData?: ChartData[]
  appointmentData?: AppointmentChartData[]
}

export function DashboardCharts({ revenueData = [], appointmentData = [] }: DashboardChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Gráfico de Faturamento Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Faturamento Mensal</CardTitle>
          <CardDescription>Receita dos últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueData && revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
              <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                formatter={(value) => [`R$ ${(value as number).toLocaleString('pt-BR')}`, 'Receita']}
              />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              <p>Nenhum dado disponível</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Atendimentos por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Atendimentos por Tipo</CardTitle>
          <CardDescription>Distribuição de procedimentos realizados</CardDescription>
        </CardHeader>
        <CardContent>
          {appointmentData && appointmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={appointmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
              <XAxis dataKey="tipo" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                formatter={(value) => [value, 'Quantidade']}
              />
              <Bar 
                dataKey="quantidade" 
                fill="hsl(var(--accent))" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              <p>Nenhum dado disponível</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { mockDashboardMetrics, mockConsumosPorDia, mockConsumosPorConvenio } from '@/data/mockData';
import { UtensilsCrossed, CalendarDays, Building2, Users } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const CHART_COLORS = ['#2F4D49', '#BF5D30', '#C2803A', '#61603C', '#7A402E'];

const metrics = [
  {
    title: 'Almuerzos Hoy',
    value: mockDashboardMetrics.almuerzosHoy,
    icon: UtensilsCrossed,
    description: 'Consumidos el día de hoy',
  },
  {
    title: 'Almuerzos del Mes',
    value: mockDashboardMetrics.almuerzosMes,
    icon: CalendarDays,
    description: 'Total acumulado mensual',
  },
  {
    title: 'Convenios Activos',
    value: mockDashboardMetrics.conveniosActivos,
    icon: Building2,
    description: 'Empresas con convenio',
  },
  {
    title: 'Clientes',
    value: mockDashboardMetrics.clientesFrecuentes,
    icon: Users,
    description: 'Clientes registrados',
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-cafe to-terracota">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">Bienvenido al panel de control de Ecencia Andina</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const colors = ['border-l-primary', 'border-l-terracota', 'border-l-oro', 'border-l-secondary'];
          const bgColors = ['bg-primary/5', 'bg-terracota/5', 'bg-oro/5', 'bg-secondary/5'];
          const iconColors = ['text-primary', 'text-terracota', 'text-oro', 'text-secondary'];
          
          return (
            <Card key={metric.title} className={cn("border-border shadow-sm border-l-4", colors[index % colors.length], bgColors[index % bgColors.length])}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-cafe uppercase tracking-wider">{metric.title}</CardTitle>
                <metric.icon className={cn("h-5 w-5", iconColors[index % iconColors.length])} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">{metric.value}</div>
                <p className="text-xs text-muted-foreground font-medium">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Consumos por Día */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Consumos por Día</CardTitle>
            <CardDescription>Almuerzos consumidos esta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockConsumosPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#2F4D49" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Consumos por Convenio */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Consumos por Convenio</CardTitle>
            <CardDescription>Distribución mensual de almuerzos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockConsumosPorConvenio}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockConsumosPorConvenio.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

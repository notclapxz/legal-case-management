import { redirect } from 'next/navigation'
import AgendaMonthView from '../../components/AgendaMonthView'

export default async function AgendaMesPage({
  params,
}: {
  params: Promise<{ anio: string; mes: string }>
}) {
  const { anio, mes } = await params

  const mesNumero = parseInt(mes) - 1 // Meses en JS son 0-11
  const anioNumero = parseInt(anio)

  // Validar mes y año
  if (isNaN(mesNumero) || mesNumero < 0 || mesNumero > 11) {
    redirect('/agenda')
  }

  if (isNaN(anioNumero) || anioNumero < 2000 || anioNumero > 2100) {
    redirect('/agenda')
  }

  return <AgendaMonthView mes={mesNumero} anio={anioNumero} />
}

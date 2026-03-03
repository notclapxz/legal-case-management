import { redirect } from 'next/navigation'

export default async function NotasCasoRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Redirigir a la nueva ruta genérica
  redirect(`/dashboard/notas/caso/${id}`)
}

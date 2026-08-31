export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-lg font-semibold">Sin conexion</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        No pudimos cargar esta pagina. Si ya la visitaste antes con conexion, algunos datos pueden seguir
        disponibles en modo lectura. Conectate a internet y volve a intentar.
      </p>
    </div>
  );
}
